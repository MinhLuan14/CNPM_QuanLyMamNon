package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import vhu.edu.babysharkedu.model.LuotYeuCauKhoiPhuc;
import vhu.edu.babysharkedu.repository.LuotYeuCauKhoiPhucRepository;

@ExtendWith(MockitoExtension.class)
class KhoiPhucRateLimitServiceTest {
    private static final String EXPECTED_APPLICATION_LOCK_CALL =
            "{? = call sys.sp_getapplock(?, ?, ?, ?, ?)}";
    private static final String EXPECTED_APPLICATION_UNLOCK_CALL =
            "{? = call sys.sp_releaseapplock(?, ?, ?)}";

    @Mock
    private LuotYeuCauKhoiPhucRepository repository;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @ParameterizedTest
    @ValueSource(ints = {-1, -2, -3, -999})
    void tuChoi503NeuSqlServerKhongCapLock(int lockResult) throws SQLException {
        KhoiPhucRateLimitService configuredService = new KhoiPhucRateLimitService(
                repository, jdbcTemplate, "a".repeat(32));
        mockApplicationLockResults(lockResult);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> inTransaction(
                        () -> configuredService.ghiNhanYeuCau("parent@example.com", "127.0.0.1")));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
        assertEquals("Không thể tiếp nhận yêu cầu lúc này. Vui lòng thử lại sau.", exception.getReason());
        verify(repository, never()).save(any(LuotYeuCauKhoiPhuc.class));
    }

    @Test
    void tuChoi503VaGiuThongTinSqlKhiTruyVanLockGapLoi() {
        KhoiPhucRateLimitService configuredService = new KhoiPhucRateLimitService(
                repository, jdbcTemplate, "a".repeat(32));
        when(jdbcTemplate.execute(
                        any(CallableStatementCreator.class), any(CallableStatementCallback.class)))
                .thenThrow(new DataAccessResourceFailureException(
                        "SQL access failed", new SQLException("Database unavailable", "08001", 1001)));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> inTransaction(
                        () -> configuredService.ghiNhanYeuCau("parent@example.com", "127.0.0.1")));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
        verify(repository, never()).save(any(LuotYeuCauKhoiPhuc.class));
    }

    @Test
    void tuChoiKhiBiMatHmacThieuHoacQuaNgan() {
        KhoiPhucRateLimitService configuredService = new KhoiPhucRateLimitService(
                repository, jdbcTemplate, "short");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> configuredService.ghiNhanYeuCau("parent@example.com", "127.0.0.1"));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
        verify(jdbcTemplate, never()).execute(
                any(CallableStatementCreator.class), any(CallableStatementCallback.class));
    }

    @Test
    void ghiNhanYeuCauSauKhiCaHaiLockDuocCap() throws SQLException {
        KhoiPhucRateLimitService configuredService = new KhoiPhucRateLimitService(
                repository, jdbcTemplate, "a".repeat(32));
        CallableStatement statement = mockApplicationLockResults(0, 1, 0, 0);
        when(repository.countByEmailHashAndThoiGianYeuCauAfter(anyString(), any())).thenReturn(0L);
        when(repository.countByIpHashAndThoiGianYeuCauAfter(anyString(), any())).thenReturn(0L);

        boolean recorded = inTransaction(
                () -> configuredService.ghiNhanYeuCau("parent@example.com", "127.0.0.1"));

        assertTrue(recorded);
        verify(repository).save(any(LuotYeuCauKhoiPhuc.class));
        verify(jdbcTemplate, org.mockito.Mockito.times(4)).execute(
                any(CallableStatementCreator.class),
                any(CallableStatementCallback.class));
        verify(statement, org.mockito.Mockito.times(4)).registerOutParameter(1, Types.INTEGER);
        verify(statement, org.mockito.Mockito.times(4))
                .setNString(eq(2), argThat(resource -> resource.startsWith("account-recovery:")
                        && resource.length() <= 255));
        verify(statement, org.mockito.Mockito.times(2)).setString(3, "Exclusive");
        verify(statement, org.mockito.Mockito.times(2)).setString(4, "Session");
        verify(statement, org.mockito.Mockito.times(2)).setInt(5, 5000);
        verify(statement, org.mockito.Mockito.times(2)).setNString(6, "public");
        verify(statement, org.mockito.Mockito.times(2)).setString(3, "Session");
        verify(statement, org.mockito.Mockito.times(4)).execute();
        verify(statement, org.mockito.Mockito.times(4)).getInt(1);
    }

    @Test
    void gioiHanTheoEmailTraVeFalseNhungKhongTietLo() throws SQLException {
        KhoiPhucRateLimitService configuredService = new KhoiPhucRateLimitService(
                repository, jdbcTemplate, "a".repeat(32));
        mockApplicationLockResults(0, 0, 0, 0);
        when(repository.countByEmailHashAndThoiGianYeuCauAfter(anyString(), any())).thenReturn(5L);
        when(repository.countByIpHashAndThoiGianYeuCauAfter(anyString(), any())).thenReturn(5L);

        boolean recorded = inTransaction(
                () -> configuredService.ghiNhanYeuCau("parent@example.com", "127.0.0.1"));

        assertFalse(recorded);
        verify(repository, never()).save(any(LuotYeuCauKhoiPhuc.class));
    }

    private CallableStatement mockApplicationLockResults(int... results) throws SQLException {
        CallableStatement statement = mock(CallableStatement.class);
        AtomicInteger nextResult = new AtomicInteger();
        when(jdbcTemplate.execute(
                        any(CallableStatementCreator.class), any(CallableStatementCallback.class)))
                .thenAnswer(invocation -> {
                    CallableStatementCreator creator = invocation.getArgument(0);
                    CallableStatementCallback<Integer> callback = invocation.getArgument(1);
                    Connection connection = mock(Connection.class);
                    when(connection.prepareCall(anyString())).thenAnswer(prepareCall -> {
                        assertTrue(List.of(EXPECTED_APPLICATION_LOCK_CALL, EXPECTED_APPLICATION_UNLOCK_CALL)
                                .contains(prepareCall.getArgument(0)));
                        return statement;
                    });
                    CallableStatement createdStatement = creator.createCallableStatement(connection);
                    return callback.doInCallableStatement(createdStatement);
                });
        when(statement.getInt(1)).thenAnswer(invocation -> results[nextResult.getAndIncrement()]);
        return statement;
    }

    private <T> T inTransaction(Supplier<T> action) {
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        int completionStatus = TransactionSynchronization.STATUS_COMMITTED;
        try {
            return action.get();
        } catch (RuntimeException | Error exception) {
            completionStatus = TransactionSynchronization.STATUS_ROLLED_BACK;
            throw exception;
        } finally {
            for (TransactionSynchronization synchronization :
                    TransactionSynchronizationManager.getSynchronizations()) {
                synchronization.afterCompletion(completionStatus);
            }
            TransactionSynchronizationManager.clearSynchronization();
            TransactionSynchronizationManager.setActualTransactionActive(false);
        }
    }
}
