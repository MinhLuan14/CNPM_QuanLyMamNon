package vhu.edu.babysharkedu.service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.security.SecureRandom;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;

@Service
public class TaiKhoanCapPhatService {
    private static final int TEN_DANG_NHAP_MAX_LENGTH = 50;
    private static final int MAT_KHAU_TAM_THOI_LENGTH = 16;
    private static final String CHU_HOA = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String CHU_THUONG = "abcdefghijkmnopqrstuvwxyz";
    private static final String CHU_SO = "23456789";
    private static final String KY_TU_DAC_BIET = "!@#$%*-_?";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;

    public TaiKhoanCapPhatService(
            TaiKhoanRepository taiKhoanRepository,
            PasswordEncoder passwordEncoder) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String taoTenDangNhap(String goiY, String hauTo) {
        String normalized = chuanHoa(goiY);
        String suffix = chuanHoa(hauTo);
        if (normalized.isBlank()) {
            normalized = "nguoidung";
        }
        if (suffix.length() >= TEN_DANG_NHAP_MAX_LENGTH) {
            suffix = suffix.substring(suffix.length() - TEN_DANG_NHAP_MAX_LENGTH + 1);
        }

        int availableBaseLength = TEN_DANG_NHAP_MAX_LENGTH - suffix.length();
        String base = normalized.substring(0, Math.min(normalized.length(), availableBaseLength));
        String candidate = base + suffix;
        int attempt = 1;
        while (taiKhoanRepository.existsByTenDangNhapIgnoreCase(candidate)) {
            String attemptSuffix = "_" + attempt++;
            int candidateBaseLength = TEN_DANG_NHAP_MAX_LENGTH - suffix.length() - attemptSuffix.length();
            if (candidateBaseLength < 1) {
                throw new IllegalStateException("Không thể tạo tên đăng nhập duy nhất.");
            }
            candidate = base.substring(0, Math.min(base.length(), candidateBaseLength))
                    + suffix + attemptSuffix;
        }
        return candidate;
    }

    @Transactional
    public TaiKhoanCapPhatResult taoTaiKhoan(String tenDangNhap, String vaiTro) {
        String matKhauTamThoi = sinhMatKhauTamThoi();
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setTenDangNhap(tenDangNhap);
        taiKhoan.setMatKhau(passwordEncoder.encode(matKhauTamThoi));
        taiKhoan.setVaiTro(vaiTro);
        taiKhoan.setTrangThai(true);
        taiKhoan.setMustChangePassword(true);
        return new TaiKhoanCapPhatResult(taiKhoanRepository.save(taiKhoan), matKhauTamThoi);
    }

    @Transactional
    public String capNhatMatKhauTamThoi(TaiKhoan taiKhoan) {
        String matKhauTamThoi = sinhMatKhauTamThoi();
        taiKhoan.setMatKhau(passwordEncoder.encode(matKhauTamThoi));
        taiKhoan.setMustChangePassword(true);
        taiKhoanRepository.save(taiKhoan);
        return matKhauTamThoi;
    }

    public String taoMatKhauTamThoi() {
        return sinhMatKhauTamThoi();
    }

    private String chuanHoa(String value) {
        String noMarks = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');
        return noMarks.replaceAll("[^A-Za-z0-9]", "").toLowerCase(Locale.ROOT);
    }

    private String sinhMatKhauTamThoi() {
        String alphabet = CHU_HOA + CHU_THUONG + CHU_SO + KY_TU_DAC_BIET;
        List<Character> characters = new ArrayList<>(MAT_KHAU_TAM_THOI_LENGTH);
        characters.add(randomCharacter(CHU_HOA));
        characters.add(randomCharacter(CHU_THUONG));
        characters.add(randomCharacter(CHU_SO));
        characters.add(randomCharacter(KY_TU_DAC_BIET));
        while (characters.size() < MAT_KHAU_TAM_THOI_LENGTH) {
            characters.add(randomCharacter(alphabet));
        }
        Collections.shuffle(characters, SECURE_RANDOM);
        StringBuilder password = new StringBuilder(MAT_KHAU_TAM_THOI_LENGTH);
        characters.forEach(password::append);
        return password.toString();
    }

    private char randomCharacter(String alphabet) {
        return alphabet.charAt(SECURE_RANDOM.nextInt(alphabet.length()));
    }
}

record TaiKhoanCapPhatResult(TaiKhoan taiKhoan, String matKhauTamThoi) {
}
