package vhu.edu.babysharkedu.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.function.Function;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vhu.edu.babysharkedu.dto.KhoiPhucTaiKhoanRequest;
import vhu.edu.babysharkedu.dto.MessageResponse;
import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.KhoiPhucMatKhauToken;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.KhoiPhucMatKhauTokenRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;

@Service
public class KhoiPhucTaiKhoanService {
    private static final Logger LOGGER = LoggerFactory.getLogger(KhoiPhucTaiKhoanService.class);
    private static final String GENERIC_RESPONSE =
            "Yêu cầu đã được tiếp nhận. Nếu tài khoản phù hợp và gửi email thành công, bạn sẽ nhận được "
                    + "mật khẩu tạm thời; nếu không nhận được, vui lòng thử lại hoặc liên hệ nhà trường.";

    private final PhuHuynhRepository phuHuynhRepository;
    private final GiaoVienRepository giaoVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final KhoiPhucMatKhauTokenRepository tokenRepository;
    private final KhoiPhucEmailService emailService;
    private final KhoiPhucRateLimitService rateLimitService;
    private final TaiKhoanService taiKhoanService;
    private final TaiKhoanCapPhatService taiKhoanCapPhatService;

    public KhoiPhucTaiKhoanService(
            PhuHuynhRepository phuHuynhRepository,
            GiaoVienRepository giaoVienRepository,
            TaiKhoanRepository taiKhoanRepository,
            KhoiPhucMatKhauTokenRepository tokenRepository,
            KhoiPhucEmailService emailService,
            KhoiPhucRateLimitService rateLimitService,
            TaiKhoanService taiKhoanService,
            TaiKhoanCapPhatService taiKhoanCapPhatService) {
        this.phuHuynhRepository = phuHuynhRepository;
        this.giaoVienRepository = giaoVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.rateLimitService = rateLimitService;
        this.taiKhoanService = taiKhoanService;
        this.taiKhoanCapPhatService = taiKhoanCapPhatService;
    }

    @Transactional
    public MessageResponse guiTenDangNhap(KhoiPhucTaiKhoanRequest request, String remoteAddress) {
        validateRequest(request);
        kiemTraCauHinh();
        String email = normalizeEmail(request.email());
        if (!rateLimitService.ghiNhanYeuCau(email, remoteAddress)) {
            return new MessageResponse(GENERIC_RESPONSE);
        }
        List<TaiKhoan> accounts = findAccounts(
                email, request.loaiTaiKhoan().trim().toUpperCase(Locale.ROOT));
        if (!accounts.isEmpty()) {
            guiEmailKhongTietLoTaiKhoan(() -> emailService.guiTenDangNhap(
                    email,
                    accounts.stream().map(TaiKhoan::getTenDangNhap).distinct().toList()));
        }
        return new MessageResponse(GENERIC_RESPONSE);
    }

    @Transactional
    public MessageResponse guiMatKhauTamThoi(KhoiPhucTaiKhoanRequest request, String remoteAddress) {
        validateRequest(request);
        kiemTraCauHinh();
        String email = normalizeEmail(request.email());
        if (!rateLimitService.ghiNhanYeuCau(email, remoteAddress)) {
            return new MessageResponse(GENERIC_RESPONSE);
        }
        List<TaiKhoan> accounts = findAccounts(
                email, request.loaiTaiKhoan().trim().toUpperCase(Locale.ROOT));
        if (!accounts.isEmpty()) {
            String accountType = request.loaiTaiKhoan().trim().toUpperCase(Locale.ROOT);
            List<TaiKhoan> lockedAccounts = lockAccounts(accounts, accountType);
            if (!lockedAccounts.isEmpty()) {
                String temporaryPassword = taiKhoanCapPhatService.taoMatKhauTamThoi();
                boolean sent = guiEmailKhongTietLoTaiKhoan(() -> emailService.guiMatKhauTamThoi(
                        email,
                        lockedAccounts.stream().map(TaiKhoan::getTenDangNhap).distinct().toList(),
                        temporaryPassword));
                if (sent) {
                    LocalDateTime changedAt = LocalDateTime.now();
                    lockedAccounts.forEach(account -> {
                        taiKhoanService.capNhatMatKhauTamThoi(account, temporaryPassword);
                        tokenRepository.invalidateUnusedByAccountId(account.getMaTaiKhoan(), changedAt);
                    });
                }
            }
        }
        return new MessageResponse(GENERIC_RESPONSE);
    }

    private List<TaiKhoan> findAccounts(String email, String accountType) {
        Stream<TaiKhoan> accounts = switch (accountType) {
            case "PHUHUYNH" -> phuHuynhRepository.findAllByEmailIgnoreCase(email).stream()
                    .map(PhuHuynh::getTaiKhoan);
            case "GIAOVIEN" -> giaoVienRepository.findAllByEmailIgnoreCase(email).stream()
                    .map(GiaoVien::getTaiKhoan);
            default -> Stream.empty();
        };
        return accounts
                .filter(java.util.Objects::nonNull)
                .filter(account -> Boolean.TRUE.equals(account.getTrangThai()))
                .filter(account -> accountType.equals(taiKhoanService.chuanHoaVaiTro(account.getVaiTro())))
                .collect(java.util.stream.Collectors.toMap(
                        TaiKhoan::getMaTaiKhoan,
                        Function.identity(),
                        (first, ignored) -> first,
                        java.util.LinkedHashMap::new))
                .values()
                .stream()
                .toList();
    }

    private List<TaiKhoan> lockAccounts(List<TaiKhoan> accounts, String accountType) {
        return accounts.stream()
                .map(TaiKhoan::getMaTaiKhoan)
                .distinct()
                .sorted()
                .map(taiKhoanRepository::findWithLockByMaTaiKhoan)
                .flatMap(java.util.Optional::stream)
                .filter(account -> Boolean.TRUE.equals(account.getTrangThai()))
                .filter(account -> accountType.equals(taiKhoanService.chuanHoaVaiTro(account.getVaiTro())))
                .toList();
    }

    private void validateRequest(KhoiPhucTaiKhoanRequest request) {
        if (request == null
                || request.email() == null
                || request.email().isBlank()
                || request.email().trim().length() > 100
                || !request.email().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
                || request.loaiTaiKhoan() == null
                || !List.of("PHUHUYNH", "GIAOVIEN").contains(
                        request.loaiTaiKhoan().trim().toUpperCase(Locale.ROOT))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập email hợp lệ và chọn loại tài khoản.");
        }
    }

    private void kiemTraCauHinh() {
        if (!emailService.isConfigured()) {
            emailService.logConfigurationUnavailable();
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Dịch vụ email khôi phục chưa được cấu hình. Vui lòng liên hệ nhà trường.");
        }
    }

    private boolean guiEmailKhongTietLoTaiKhoan(Runnable sendEmail) {
        try {
            sendEmail.run();
            return true;
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode() != HttpStatus.SERVICE_UNAVAILABLE) {
                throw exception;
            }
            LOGGER.warn(
                    "Gửi email khôi phục không thành công; HTTP status từ dịch vụ gửi mail: {}.",
                    exception.getStatusCode());
            return false;
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

}
