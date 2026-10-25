package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.TaiKhoanDanhSachProjection;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;

@ExtendWith(MockitoExtension.class)
class TaiKhoanServiceTest {
    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    private BCryptPasswordEncoder passwordEncoder;
    private TaiKhoanService service;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        service = new TaiKhoanService(
                taiKhoanRepository,
                passwordEncoder,
                new TaiKhoanCapPhatService(taiKhoanRepository, passwordEncoder));
    }

    @Test
    void dangNhapHoTroAdminGiaoVienVaPhuHuynhVoiBcrypt() {
        for (String role : new String[] { "ADMIN", "GIAOVIEN", "PHUHUYNH" }) {
            TaiKhoan account = new TaiKhoan();
            account.setMaTaiKhoan(1);
            account.setTenDangNhap(role.toLowerCase());
            account.setMatKhau(passwordEncoder.encode("Strong-pass-123"));
            account.setVaiTro(role);
            account.setTrangThai(true);
            when(taiKhoanRepository.findByTenDangNhap(role.toLowerCase()))
                    .thenReturn(Optional.of(account));

            var principal = service.dangNhap(role.toLowerCase(), "Strong-pass-123");

            assertEquals(role, principal.getVaiTro());
            assertEquals("ROLE_" + role, principal.getAuthorities().iterator().next().getAuthority());
        }
    }

    @Test
    void dangNhapTuChoiTaiKhoanBiKhoa() {
        TaiKhoan account = new TaiKhoan();
        account.setTenDangNhap("parent");
        account.setMatKhau(passwordEncoder.encode("Strong-pass-123"));
        account.setVaiTro("PHUHUYNH");
        account.setTrangThai(false);
        when(taiKhoanRepository.findByTenDangNhap("parent")).thenReturn(Optional.of(account));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.dangNhap("parent", "Strong-pass-123"));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void layDanhSachTaiKhoanTraThongTinKhongBaoGomMatKhau() {
        TaiKhoanDanhSachProjection account = mock(TaiKhoanDanhSachProjection.class);
        when(account.getMaTaiKhoan()).thenReturn(7);
        when(account.getTenDangNhap()).thenReturn("phuhuynh1");
        when(account.getHoTenChuTaiKhoan()).thenReturn("Nguyen Van An");
        when(account.getEmail()).thenReturn("an@example.com");
        when(account.getVaiTro()).thenReturn("Phụ huynh");
        when(account.getTrangThai()).thenReturn(true);
        when(taiKhoanRepository.findAllForAccountManagement()).thenReturn(List.of(account));

        var result = service.layDanhSachTaiKhoan();

        assertEquals(1, result.size());
        assertEquals(7, result.get(0).maTaiKhoan());
        assertEquals("phuhuynh1", result.get(0).tenDangNhap());
        assertEquals("Nguyen Van An", result.get(0).hoTenChuTaiKhoan());
        assertEquals("an@example.com", result.get(0).email());
        assertEquals("PHUHUYNH", result.get(0).vaiTro());
        assertNull(result.get(0).lanDangNhapGanNhat());
        assertTrue(result.get(0).trangThai());
    }

    @Test
    void capLaiMatKhauTaoMatKhauTamThoiVaChiLuuBcrypt() {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(7);
        account.setTenDangNhap("phuhuynh7");
        account.setMatKhau(passwordEncoder.encode("Old-password-123!"));
        account.setVaiTro("PHUHUYNH");
        account.setTrangThai(false);
        when(taiKhoanRepository.findById(7)).thenReturn(Optional.of(account));
        when(taiKhoanRepository.save(account)).thenReturn(account);

        var result = service.capLaiMatKhauTamThoi(7);

        assertEquals(7, result.maTaiKhoan());
        assertEquals("phuhuynh7", result.tenDangNhap());
        assertTrue(passwordEncoder.matches(result.matKhauTamThoi(), account.getMatKhau()));
        assertNotEquals(result.matKhauTamThoi(), account.getMatKhau());
        assertTrue(Boolean.FALSE.equals(account.getTrangThai()));
        assertTrue(Boolean.TRUE.equals(account.getMustChangePassword()));
    }

    @Test
    void capLaiMatKhauTaiKhoanKhongTonTaiTra404() {
        when(taiKhoanRepository.findById(404)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.capLaiMatKhauTamThoi(404));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void doiMatKhauDungChoPhuHuynhVaGiaoVienChiBangMatKhauHienTaiDung() {
        for (String role : new String[] { "PHUHUYNH", "GIAOVIEN" }) {
            TaiKhoan account = new TaiKhoan();
            account.setMaTaiKhoan(role.equals("PHUHUYNH") ? 31 : 32);
            account.setTenDangNhap(role.toLowerCase());
            account.setMatKhau(passwordEncoder.encode("Current-123!"));
            account.setVaiTro(role);
            account.setTrangThai(true);
            when(taiKhoanRepository.findById(account.getMaTaiKhoan())).thenReturn(Optional.of(account));
            when(taiKhoanRepository.findByTenDangNhap(account.getTenDangNhap())).thenReturn(Optional.of(account));
            when(taiKhoanRepository.save(account)).thenReturn(account);

            service.doiMatKhau(account.getMaTaiKhoan(), "Current-123!", "New-pass-456", "New-pass-456");

            assertTrue(passwordEncoder.matches("New-pass-456", account.getMatKhau()));
            assertFalse(account.getMustChangePassword());
            assertEquals(role, service.dangNhap(account.getTenDangNhap(), "New-pass-456").getVaiTro());
            assertThrows(
                    ResponseStatusException.class,
                    () -> service.dangNhap(account.getTenDangNhap(), "Current-123!"));
        }
    }

    @Test
    void dangNhapBangMatKhauTamThoiBatBuocDoiVaMatKhauCuMatTacDungSauKhiDoi() {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(33);
        account.setTenDangNhap("parent33");
        account.setMatKhau(passwordEncoder.encode("Old-password-123!"));
        account.setVaiTro("PHUHUYNH");
        account.setTrangThai(true);
        when(taiKhoanRepository.findByTenDangNhap("parent33")).thenReturn(Optional.of(account));
        when(taiKhoanRepository.findById(33)).thenReturn(Optional.of(account));

        String temporaryPassword = "Temporary-password-123!";
        service.capNhatMatKhauTamThoi(account, temporaryPassword);
        var temporaryLogin = service.dangNhap("parent33", temporaryPassword);

        assertTrue(temporaryLogin.isMustChangePassword());
        assertTrue(passwordEncoder.matches(temporaryPassword, account.getMatKhau()));
        assertNotEquals(temporaryPassword, account.getMatKhau());

        service.doiMatKhau(33, temporaryPassword, "New-password-456!", "New-password-456!");

        assertFalse(account.getMustChangePassword());
        assertTrue(passwordEncoder.matches("New-password-456!", account.getMatKhau()));
        assertFalse(service.dangNhap("parent33", "New-password-456!").isMustChangePassword());
        assertThrows(
                ResponseStatusException.class,
                () -> service.dangNhap("parent33", temporaryPassword));
    }

    @Test
    void doiMatKhauChapNhanLang12345ViCoChinKyTu() {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(40);
        account.setMatKhau(passwordEncoder.encode("Current-123!"));
        account.setTrangThai(true);
        when(taiKhoanRepository.findById(40)).thenReturn(Optional.of(account));
        when(taiKhoanRepository.save(account)).thenReturn(account);

        service.doiMatKhau(40, "Current-123!", "Lang12345", "Lang12345");

        assertTrue(passwordEncoder.matches("Lang12345", account.getMatKhau()));
    }

    @Test
    void doiMatKhauTuChoiMatKhauHienTaiSaiVaXacNhanKhongKhop() {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(41);
        account.setMatKhau(passwordEncoder.encode("Current-123!"));
        account.setTrangThai(true);
        when(taiKhoanRepository.findById(41)).thenReturn(Optional.of(account));

        ResponseStatusException incorrectCurrent = assertThrows(
                ResponseStatusException.class,
                () -> service.doiMatKhau(41, "wrong-password", "New-pass-456", "New-pass-456"));
        ResponseStatusException confirmationMismatch = assertThrows(
                ResponseStatusException.class,
                () -> service.doiMatKhau(41, "Current-123!", "New-pass-456", "different"));

        assertEquals(HttpStatus.BAD_REQUEST, incorrectCurrent.getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, confirmationMismatch.getStatusCode());
        assertFalse(passwordEncoder.matches("New-pass-456", account.getMatKhau()));
    }

    @Test
    void doiMatKhauTuChoiTaiKhoanBiKhoa() {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(42);
        account.setMatKhau(passwordEncoder.encode("Current-123!"));
        account.setTrangThai(false);
        when(taiKhoanRepository.findById(42)).thenReturn(Optional.of(account));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.doiMatKhau(42, "Current-123!", "New-pass-456", "New-pass-456"));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertTrue(passwordEncoder.matches("Current-123!", account.getMatKhau()));
    }
}
