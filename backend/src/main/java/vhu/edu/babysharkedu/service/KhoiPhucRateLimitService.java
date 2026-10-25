package vhu.edu.babysharkedu.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.sql.CallableStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import javax.sql.DataSource;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vhu.edu.babysharkedu.model.LuotYeuCauKhoiPhuc;
import vhu.edu.babysharkedu.repository.LuotYeuCauKhoiPhucRepository;

@Service
public class KhoiPhucRateLimitService {
    private static final Logger LOGGER = LoggerFactory.getLogger(KhoiPhucRateLimitService.class);
    private static final int MAX_REQUESTS_PER_IDENTIFIER = 5;
    private static final int MAX_REQUESTS_PER_IP = 10;
    private static final int APPLICATION_LOCK_TIMEOUT_MILLIS = 5000;
    private static final String APPLICATION_LOCK_CALL =
            "{? = call sys.sp_getapplock(?, ?, ?, ?, ?)}";
    private static final String APPLICATION_UNLOCK_CALL =
            "{? = call sys.sp_releaseapplock(?, ?, ?)}";
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final LuotYeuCauKhoiPhucRepository repository;
    private final JdbcTemplate jdbcTemplate;
    private final String hashSecret;

    public KhoiPhucRateLimitService(
            LuotYeuCauKhoiPhucRepository repository,
            JdbcTemplate jdbcTemplate,
            @Value("${account-recovery.hash-secret:}") String hashSecret) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
        this.hashSecret = hashSecret;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean ghiNhanYeuCau(String email, String remoteAddress) {
        if (hashSecret.length() < 32) {
            LOGGER.error("Account recovery request rejected because ACCOUNT_RECOVERY_HASH_SECRET is missing or too short.");
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Tính năng khôi phục tài khoản chưa được cấu hình đầy đủ.");
        }
        if (remoteAddress == null || remoteAddress.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể xác định nguồn gửi yêu cầu.");
        }

        String emailHash = hash("email:" + email.trim().toLowerCase(java.util.Locale.ROOT));
        String ipHash = hash("ip:" + remoteAddress.trim());
        List<String> lockKeys = java.util.stream.Stream.of(emailHash, ipHash).sorted().toList();
        if (!TransactionSynchronizationManager.isSynchronizationActive()
                || !TransactionSynchronizationManager.isActualTransactionActive()) {
            LOGGER.error("Account recovery rate-limit locks require an active Spring transaction.");
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể tiếp nhận yêu cầu lúc này. Vui lòng thử lại sau.");
        }
        List<String> acquiredLocks = new ArrayList<>(lockKeys.size());
        // JPA may not start SQL Server's physical transaction before the first write.
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                releaseApplicationLocks(acquiredLocks);
            }
        });
        for (int index = 0; index < lockKeys.size(); index++) {
            String lockKey = lockKeys.get(index);
            long lockStartedAt = System.nanoTime();
            Integer result;
            try {
                result = acquireApplicationLock(lockKey);
            } catch (DataAccessException exception) {
                LOGGER.error(
                        "SQL Server account recovery lock request failed; lockNumber={}, elapsedMs={}, "
                                + "transactionActive={}, jdbcConnectionBound={}, rootCauseType={}, "
                                + "sqlState={}, vendorCode={}.",
                        index + 1,
                        elapsedMilliseconds(lockStartedAt),
                        TransactionSynchronizationManager.isActualTransactionActive(),
                        isJdbcConnectionBound(),
                        rootCauseType(exception),
                        sqlState(exception),
                        vendorCode(exception));
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Không thể tiếp nhận yêu cầu lúc này. Vui lòng thử lại sau.",
                        exception);
            }
            if (result == null || result < 0) {
                LOGGER.warn(
                        "SQL Server did not grant account recovery lock; lockNumber={}, resultCode={}, "
                                + "resultMeaning={}, elapsedMs={}, transactionActive={}, jdbcConnectionBound={}.",
                        index + 1,
                        result,
                        describeLockResult(result),
                        elapsedMilliseconds(lockStartedAt),
                        TransactionSynchronizationManager.isActualTransactionActive(),
                        isJdbcConnectionBound());
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Không thể tiếp nhận yêu cầu lúc này. Vui lòng thử lại sau.");
            }
            acquiredLocks.add("account-recovery:" + lockKey);
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.minusHours(1);
        long identifierRequests = repository.countByEmailHashAndThoiGianYeuCauAfter(emailHash, windowStart);
        long ipRequests = repository.countByIpHashAndThoiGianYeuCauAfter(ipHash, windowStart);
        if (identifierRequests >= MAX_REQUESTS_PER_IDENTIFIER) {
            return false;
        }
        if (ipRequests >= MAX_REQUESTS_PER_IP) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
        }

        LuotYeuCauKhoiPhuc request = new LuotYeuCauKhoiPhuc();
        request.setEmailHash(emailHash);
        request.setIpHash(ipHash);
        request.setThoiGianYeuCau(now);
        repository.save(request);
        repository.deleteByThoiGianYeuCauBefore(now.minusDays(2));
        return true;
    }

    private long elapsedMilliseconds(long startedAt) {
        return (System.nanoTime() - startedAt) / 1_000_000;
    }

    private boolean isJdbcConnectionBound() {
        DataSource dataSource = jdbcTemplate.getDataSource();
        return dataSource != null && TransactionSynchronizationManager.hasResource(dataSource);
    }

    private Integer acquireApplicationLock(String lockKey) {
        return jdbcTemplate.execute((CallableStatementCreator) connection -> {
            CallableStatement statement = connection.prepareCall(APPLICATION_LOCK_CALL);
            statement.registerOutParameter(1, Types.INTEGER);
            statement.setNString(2, "account-recovery:" + lockKey);
            statement.setString(3, "Exclusive");
            statement.setString(4, "Session");
            statement.setInt(5, APPLICATION_LOCK_TIMEOUT_MILLIS);
            statement.setNString(6, "public");
            return statement;
        }, statement -> {
            statement.execute();
            return statement.getInt(1);
        });
    }

    private void releaseApplicationLocks(List<String> acquiredLocks) {
        for (int index = acquiredLocks.size() - 1; index >= 0; index--) {
            int lockNumber = index + 1;
            String resource = acquiredLocks.get(index);
            try {
                Integer result = jdbcTemplate.execute((CallableStatementCreator) connection -> {
                    CallableStatement statement = connection.prepareCall(APPLICATION_UNLOCK_CALL);
                    statement.registerOutParameter(1, Types.INTEGER);
                    statement.setNString(2, resource);
                    statement.setString(3, "Session");
                    statement.setNString(4, "public");
                    return statement;
                }, statement -> {
                    statement.execute();
                    return statement.getInt(1);
                });
                if (result == null || result < 0) {
                    LOGGER.error(
                            "SQL Server failed to release account recovery application lock; "
                                    + "lockNumber={}, resultCode={}.",
                            lockNumber,
                            result);
                }
            } catch (DataAccessException exception) {
                LOGGER.error(
                        "SQL Server application lock release failed; lockNumber={}, rootCauseType={}, "
                                + "sqlState={}, vendorCode={}.",
                        lockNumber,
                        rootCauseType(exception),
                        sqlState(exception),
                        vendorCode(exception));
            }
        }
    }

    private String describeLockResult(Integer result) {
        if (result == null) {
            return "no-result";
        }
        return switch (result) {
            case -1 -> "timeout";
            case -2 -> "cancelled";
            case -3 -> "deadlock-victim";
            case -999 -> "invalid-parameters-or-other-error";
            case 0 -> "granted-immediately";
            case 1 -> "granted-after-wait";
            default -> result < 0 ? "unknown-failure" : "granted";
        };
    }

    private String rootCauseType(Throwable exception) {
        Throwable rootCause = rootCause(exception);
        return rootCause.getClass().getSimpleName();
    }

    private Throwable rootCause(Throwable exception) {
        Throwable rootCause = exception;
        while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
            rootCause = rootCause.getCause();
        }
        return rootCause;
    }

    private String sqlState(Throwable exception) {
        Throwable rootCause = rootCause(exception);
        return rootCause instanceof SQLException sqlException ? sqlException.getSQLState() : "unavailable";
    }

    private int vendorCode(Throwable exception) {
        Throwable rootCause = rootCause(exception);
        return rootCause instanceof SQLException sqlException ? sqlException.getErrorCode() : 0;
    }

    private String hash(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(hashSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Không thể khởi tạo bộ băm yêu cầu khôi phục.", exception);
        }
    }
}
