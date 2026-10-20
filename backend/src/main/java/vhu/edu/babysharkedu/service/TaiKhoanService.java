package vhu.edu.babysharkedu.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.Normalizer;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class TaiKhoanService {
    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;

    public TaiKhoanService(TaiKhoanRepository taiKhoanRepository, PasswordEncoder passwordEncoder) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TaiKhoanPrincipal dangNhap(String tenDangNhap, String matKhau) {
        if (tenDangNhap == null || tenDangNhap.isBlank() || matKhau == null || matKhau.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên đăng nhập và mật khẩu.");
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(tenDangNhap.trim())
                .orElseThrow(this::thongTinDangNhapKhongHopLe);

        if (!Boolean.TRUE.equals(taiKhoan.getTrangThai()) || !xacThucMatKhau(matKhau, taiKhoan)) {
            throw thongTinDangNhapKhongHopLe();
        }

        return new TaiKhoanPrincipal(taiKhoan, this);
    }

    private boolean xacThucMatKhau(String matKhau, TaiKhoan taiKhoan) {
        String matKhauDaLuu = taiKhoan.getMatKhau();
        if (matKhauDaLuu == null || matKhauDaLuu.isEmpty()) {
            return false;
        }

        if (matKhauDaLuu.matches("^\\$2[aby]\\$\\d{2}\\$.*")) {
            return passwordEncoder.matches(matKhau, matKhauDaLuu);
        }

        byte[] matKhauNhap = matKhau.getBytes(StandardCharsets.UTF_8);
        byte[] matKhauCu = matKhauDaLuu.getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(matKhauNhap, matKhauCu)) {
            return false;
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(matKhau));
        taiKhoanRepository.save(taiKhoan);
        return true;
    }

    private ResponseStatusException thongTinDangNhapKhongHopLe() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Tên đăng nhập hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.");
    }

    @Transactional
    public void doiMatKhau(Integer maTaiKhoan, String matKhauHienTai, String matKhauMoi) {
        if (matKhauHienTai == null || matKhauHienTai.isBlank()
                || matKhauMoi == null || matKhauMoi.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải có ít nhất 8 ký tự.");
        }

        TaiKhoan taiKhoan = findAccount(maTaiKhoan);
        if (!passwordEncoder.matches(matKhauHienTai, taiKhoan.getMatKhau())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác.");
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(matKhauMoi));
        taiKhoanRepository.save(taiKhoan);
    }

    @Transactional
    public void khoaTaiKhoan(Integer maTaiKhoan) {
        TaiKhoan taiKhoan = findAccount(maTaiKhoan);
        taiKhoan.setTrangThai(false);
        taiKhoanRepository.save(taiKhoan);
    }

    @Transactional
    public void moKhoaTaiKhoan(Integer maTaiKhoan) {
        TaiKhoan taiKhoan = findAccount(maTaiKhoan);
        taiKhoan.setTrangThai(true);
        taiKhoanRepository.save(taiKhoan);
    }

    public String chuanHoaVaiTro(String vaiTro) {
        String khongDau = Normalizer.normalize(vaiTro == null ? "" : vaiTro, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');
        String normalized = khongDau.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);

        return switch (normalized) {
            case "ADMIN", "QUANTRI", "QUANTRIVIEN" -> "ADMIN";
            case "GIAOVIEN", "TEACHER" -> "GIAOVIEN";
            case "PHUHUYNH", "PARENT" -> "PHUHUYNH";
            default -> normalized;
        };
    }

    private TaiKhoan findAccount(Integer maTaiKhoan) {
        return taiKhoanRepository.findById(maTaiKhoan)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản."));
    }
}
