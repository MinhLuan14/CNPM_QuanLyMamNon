package vhu.edu.babysharkedu.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class GiaoVienPhanCongAccessService {
    private final PhanCongGiaoVienRepository phanCongGiaoVienRepository;

    public GiaoVienPhanCongAccessService(PhanCongGiaoVienRepository phanCongGiaoVienRepository) {
        this.phanCongGiaoVienRepository = phanCongGiaoVienRepository;
    }

    public void requireClassAccess(Authentication authentication, Integer maLopHoc) {
        TaiKhoanPrincipal principal = taiKhoanPrincipal(authentication);
        if ("ADMIN".equals(principal.getVaiTro())) {
            return;
        }
        if (!"GIAOVIEN".equals(principal.getVaiTro())
                || !phanCongGiaoVienRepository.existsPhanCongHienTaiByTaiKhoanAndLopHoc(
                        principal.getMaTaiKhoan(), maLopHoc, LocalDateTime.now())) {
            throw new AccessDeniedException("Bạn không có phân công hiện hành cho lớp này.");
        }
    }

    public List<Integer> currentClassIds(Authentication authentication) {
        TaiKhoanPrincipal principal = taiKhoanPrincipal(authentication);
        if (!"GIAOVIEN".equals(principal.getVaiTro())) {
            throw new AccessDeniedException("Chỉ giáo viên mới được truy cập danh sách lớp được phân công.");
        }
        return phanCongGiaoVienRepository.findMaLopHienTaiByTaiKhoan(
                principal.getMaTaiKhoan(), LocalDateTime.now());
    }

    private TaiKhoanPrincipal taiKhoanPrincipal(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof TaiKhoanPrincipal principal)) {
            throw new AccessDeniedException("Không thể xác định tài khoản đang đăng nhập.");
        }
        return principal;
    }
}
