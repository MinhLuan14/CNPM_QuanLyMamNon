package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import vhu.edu.babysharkedu.dto.KhoiPhucTaiKhoanRequest;
import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.KhoiPhucMatKhauTokenRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;

@ExtendWith(MockitoExtension.class)
class KhoiPhucTaiKhoanServiceTest {
    @Mock
    private PhuHuynhRepository phuHuynhRepository;

    @Mock
    private GiaoVienRepository giaoVienRepository;

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @Mock
    private KhoiPhucMatKhauTokenRepository tokenRepository;

    @Mock
    private KhoiPhucEmailService emailService;

    @Mock
    private KhoiPhucRateLimitService rateLimitService;

    @Mock
    private TaiKhoanService taiKhoanService;

    @Mock
    private TaiKhoanCapPhatService taiKhoanCapPhatService;

    private KhoiPhucTaiKhoanService service;

    @BeforeEach
    void setUp() {
        service = new KhoiPhucTaiKhoanService(
                phuHuynhRepository,
                giaoVienRepository,
                taiKhoanRepository,
                tokenRepository,
                emailService,
                rateLimitService,
                taiKhoanService,
                taiKhoanCapPhatService);
    }

    @Test
    void cauHinhEmailThieuTra503TruocKhiRateLimit() {
        when(emailService.isConfigured()).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.guiMatKhauTamThoi(
                        new KhoiPhucTaiKhoanRequest("parent@example.com", "PHUHUYNH"),
                        "127.0.0.1"));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
        verify(emailService).logConfigurationUnavailable();
        verifyNoInteractions(rateLimitService);
    }

    @Test
    void taiKhoanPhuHuynhNhanMatKhauTamThoiVaHashChiDuocCapNhatSauKhiGuiMail() {
        mockParentRecovery();
        when(taiKhoanCapPhatService.taoMatKhauTamThoi()).thenReturn("Temporary-123!");
        when(taiKhoanRepository.findWithLockByMaTaiKhoan(12))
                .thenReturn(Optional.of(taiKhoan(12, "parent12", "PHUHUYNH")));
        when(taiKhoanService.chuanHoaVaiTro("PHUHUYNH")).thenReturn("PHUHUYNH");

        service.guiMatKhauTamThoi(
                new KhoiPhucTaiKhoanRequest(" Parent@Example.com ", "PHUHUYNH"),
                "127.0.0.1");

        InOrder order = inOrder(emailService, taiKhoanService, tokenRepository);
        order.verify(emailService).guiMatKhauTamThoi(
                "parent@example.com", List.of("parent12"), "Temporary-123!");
        order.verify(taiKhoanService).capNhatMatKhauTamThoi(any(TaiKhoan.class), eq("Temporary-123!"));
        order.verify(tokenRepository).invalidateUnusedByAccountId(eq(12), any());
    }

    @Test
    void taiKhoanGiaoVienDuocCapMatKhauTamThoi() {
        when(emailService.isConfigured()).thenReturn(true);
        when(rateLimitService.ghiNhanYeuCau("teacher@example.com", "127.0.0.1")).thenReturn(true);
        TaiKhoan account = taiKhoan(22, "teacher22", "GIAOVIEN");
        GiaoVien teacher = new GiaoVien();
        teacher.setTaiKhoan(account);
        when(giaoVienRepository.findAllByEmailIgnoreCase("teacher@example.com")).thenReturn(List.of(teacher));
        when(taiKhoanService.chuanHoaVaiTro("GIAOVIEN")).thenReturn("GIAOVIEN");
        when(taiKhoanRepository.findWithLockByMaTaiKhoan(22)).thenReturn(Optional.of(account));
        when(taiKhoanCapPhatService.taoMatKhauTamThoi()).thenReturn("Temporary-456!");

        service.guiMatKhauTamThoi(
                new KhoiPhucTaiKhoanRequest("teacher@example.com", "GIAOVIEN"),
                "127.0.0.1");

        verify(emailService).guiMatKhauTamThoi(
                "teacher@example.com", List.of("teacher22"), "Temporary-456!");
        verify(taiKhoanService).capNhatMatKhauTamThoi(account, "Temporary-456!");
        verify(tokenRepository).invalidateUnusedByAccountId(eq(22), any());
    }

    @Test
    void smtpThatBaiKhongDoiHashHayVoHieuHoaToken() {
        mockParentRecovery();
        when(taiKhoanCapPhatService.taoMatKhauTamThoi()).thenReturn("Temporary-123!");
        when(taiKhoanRepository.findWithLockByMaTaiKhoan(12))
                .thenReturn(Optional.of(taiKhoan(12, "parent12", "PHUHUYNH")));
        when(taiKhoanService.chuanHoaVaiTro("PHUHUYNH")).thenReturn("PHUHUYNH");
        doThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SMTP failure"))
                .when(emailService)
                .guiMatKhauTamThoi("parent@example.com", List.of("parent12"), "Temporary-123!");

        var response = service.guiMatKhauTamThoi(
                new KhoiPhucTaiKhoanRequest("parent@example.com", "PHUHUYNH"),
                "127.0.0.1");

        assertEquals(
                "Yêu cầu đã được tiếp nhận. Nếu tài khoản phù hợp và gửi email thành công, bạn sẽ nhận được "
                        + "mật khẩu tạm thời; nếu không nhận được, vui lòng thử lại hoặc liên hệ nhà trường.",
                response.message());
        verify(taiKhoanService, never()).capNhatMatKhauTamThoi(any(), anyString());
        verify(tokenRepository, never()).invalidateUnusedByAccountId(any(), any());
    }

    @Test
    void khongTietLoTaiKhoanKhongTonTaiVaVanApDungRateLimit() {
        when(emailService.isConfigured()).thenReturn(true);
        when(rateLimitService.ghiNhanYeuCau("missing@example.com", "127.0.0.1")).thenReturn(true);
        when(phuHuynhRepository.findAllByEmailIgnoreCase("missing@example.com")).thenReturn(List.of());

        var response = service.guiMatKhauTamThoi(
                new KhoiPhucTaiKhoanRequest("missing@example.com", "PHUHUYNH"),
                "127.0.0.1");

        assertEquals(
                "Yêu cầu đã được tiếp nhận. Nếu tài khoản phù hợp và gửi email thành công, bạn sẽ nhận được "
                        + "mật khẩu tạm thời; nếu không nhận được, vui lòng thử lại hoặc liên hệ nhà trường.",
                response.message());
        verify(taiKhoanCapPhatService, never()).taoMatKhauTamThoi();
        verify(emailService, never()).guiMatKhauTamThoi(anyString(), any(), anyString());
    }

    @Test
    void gioiHanTheoEmailTraThongBaoChungVaKhongTraCuuHoSo() {
        when(emailService.isConfigured()).thenReturn(true);
        when(rateLimitService.ghiNhanYeuCau("parent@example.com", "127.0.0.1")).thenReturn(false);

        service.guiMatKhauTamThoi(
                new KhoiPhucTaiKhoanRequest("parent@example.com", "PHUHUYNH"),
                "127.0.0.1");

        verifyNoInteractions(phuHuynhRepository, giaoVienRepository, tokenRepository);
        verify(taiKhoanCapPhatService, never()).taoMatKhauTamThoi();
    }

    @Test
    void guiTenDangNhapVanDungEmailDaDangKy() {
        when(emailService.isConfigured()).thenReturn(true);
        when(rateLimitService.ghiNhanYeuCau("parent@example.com", "127.0.0.1")).thenReturn(true);
        TaiKhoan account = taiKhoan(12, "parent12", "PHUHUYNH");
        PhuHuynh parent = new PhuHuynh();
        parent.setTaiKhoan(account);
        when(phuHuynhRepository.findAllByEmailIgnoreCase("parent@example.com")).thenReturn(List.of(parent));
        when(taiKhoanService.chuanHoaVaiTro("PHUHUYNH")).thenReturn("PHUHUYNH");

        service.guiTenDangNhap(
                new KhoiPhucTaiKhoanRequest("parent@example.com", "PHUHUYNH"),
                "127.0.0.1");

        verify(emailService).guiTenDangNhap("parent@example.com", List.of("parent12"));
    }

    private void mockParentRecovery() {
        when(emailService.isConfigured()).thenReturn(true);
        when(rateLimitService.ghiNhanYeuCau("parent@example.com", "127.0.0.1")).thenReturn(true);
        TaiKhoan account = taiKhoan(12, "parent12", "PHUHUYNH");
        PhuHuynh parent = new PhuHuynh();
        parent.setTaiKhoan(account);
        when(phuHuynhRepository.findAllByEmailIgnoreCase("parent@example.com")).thenReturn(List.of(parent));
    }

    private TaiKhoan taiKhoan(Integer id, String username, String role) {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(id);
        account.setTenDangNhap(username);
        account.setVaiTro(role);
        account.setTrangThai(true);
        return account;
    }
}
