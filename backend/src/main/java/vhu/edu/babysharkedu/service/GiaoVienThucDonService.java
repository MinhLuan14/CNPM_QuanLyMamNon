package vhu.edu.babysharkedu.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.ThucDonDTO;
import vhu.edu.babysharkedu.model.PhanCongGiaoVien;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class GiaoVienThucDonService {
    private final GiaoVienRepository giaoVienRepository;
    private final PhanCongGiaoVienRepository phanCongRepository;
    private final ThucDonService thucDonService;

    public GiaoVienThucDonService(
            GiaoVienRepository giaoVienRepository,
            PhanCongGiaoVienRepository phanCongRepository,
            ThucDonService thucDonService) {
        this.giaoVienRepository = giaoVienRepository;
        this.phanCongRepository = phanCongRepository;
        this.thucDonService = thucDonService;
    }

    @Transactional(readOnly = true)
    public List<ThucDonDTO> layTheoLop(TaiKhoanPrincipal principal, Integer maLopHoc) {
        if (!"GIAOVIEN".equals(principal.getVaiTro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ giáo viên mới được theo dõi thực đơn lớp.");
        }
        var teacher = giaoVienRepository.findByTaiKhoanMaTaiKhoan(principal.getMaTaiKhoan())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ giáo viên liên kết tài khoản."));
        LocalDateTime now = LocalDateTime.now();
        boolean assignedToClass = phanCongRepository
                .findAllByGiaoVienMaGiaoVienOrderByNgayBatDauDesc(teacher.getMaGiaoVien())
                .stream()
                .anyMatch(assignment -> assignment.getLopHoc().getMaLopHoc().equals(maLopHoc)
                        && isCurrentAssignment(assignment, now));
        if (!assignedToClass) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Không tìm thấy lớp đang được phân công cho tài khoản.");
        }

        return thucDonService.layTatCaDaCongKhai();
    }

    private boolean isCurrentAssignment(PhanCongGiaoVien assignment, LocalDateTime now) {
        return (assignment.getNgayBatDau() == null || !assignment.getNgayBatDau().isAfter(now))
                && (assignment.getNgayKetThuc() == null || assignment.getNgayKetThuc().isAfter(now));
    }
}
