package vhu.edu.babysharkedu.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.CapNhatProfileRequest;
import vhu.edu.babysharkedu.dto.PhanCongGiaoVienDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhTreDTO;
import vhu.edu.babysharkedu.dto.ProfileDTO;
import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.PhanCongGiaoVien;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class ProfileService {
    private final PhuHuynhRepository phuHuynhRepository;
    private final PhuHuynhTreRepository phuHuynhTreRepository;
    private final GiaoVienRepository giaoVienRepository;
    private final PhanCongGiaoVienRepository phanCongGiaoVienRepository;

    public ProfileService(
            PhuHuynhRepository phuHuynhRepository,
            PhuHuynhTreRepository phuHuynhTreRepository,
            GiaoVienRepository giaoVienRepository,
            PhanCongGiaoVienRepository phanCongGiaoVienRepository) {
        this.phuHuynhRepository = phuHuynhRepository;
        this.phuHuynhTreRepository = phuHuynhTreRepository;
        this.giaoVienRepository = giaoVienRepository;
        this.phanCongGiaoVienRepository = phanCongGiaoVienRepository;
    }

    @Transactional(readOnly = true)
    public ProfileDTO layProfile(TaiKhoanPrincipal principal) {
        return taoProfile(principal);
    }

    @Transactional
    public ProfileDTO capNhatProfile(TaiKhoanPrincipal principal, CapNhatProfileRequest request) {
        validate(request, principal.getVaiTro());
        String phone = request.soDienThoai().trim();
        String email = request.email() == null || request.email().isBlank()
                ? null
                : request.email().trim();
        String address = request.diaChiLH().trim();

        if ("PHUHUYNH".equals(principal.getVaiTro())) {
            PhuHuynh parent = phuHuynhRepository.findByTaiKhoanMaTaiKhoan(principal.getMaTaiKhoan())
                    .orElseThrow(this::profileNotFound);
            if (phuHuynhRepository.existsBySoDienThoaiAndMaPhuHuynhNot(phone, parent.getMaPhuHuynh())
                    || giaoVienRepository.existsBySoDienThoai(phone)) {
                throw phoneConflict();
            }
            parent.setSoDienThoai(phone);
            parent.setEmail(email);
            parent.setDiaChiLH(address);
            phuHuynhRepository.save(parent);
        } else if ("GIAOVIEN".equals(principal.getVaiTro())) {
            GiaoVien teacher = giaoVienRepository.findByTaiKhoanMaTaiKhoan(principal.getMaTaiKhoan())
                    .orElseThrow(this::profileNotFound);
            if (giaoVienRepository.existsBySoDienThoaiAndMaGiaoVienNot(phone, teacher.getMaGiaoVien())
                    || phuHuynhRepository.existsBySoDienThoai(phone)) {
                throw phoneConflict();
            }
            teacher.setSoDienThoai(phone);
            teacher.setEmail(email);
            teacher.setDiaChiLH(address);
            giaoVienRepository.save(teacher);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vai trò này không có hồ sơ cá nhân.");
        }
        return taoProfile(principal);
    }

    private ProfileDTO taoProfile(TaiKhoanPrincipal principal) {
        if ("PHUHUYNH".equals(principal.getVaiTro())) {
            PhuHuynh parent = phuHuynhRepository.findByTaiKhoanMaTaiKhoan(principal.getMaTaiKhoan())
                    .orElseThrow(this::profileNotFound);
            TaiKhoan account = parent.getTaiKhoan();
            List<PhuHuynhTreDTO> children = phuHuynhTreRepository
                    .findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(parent.getMaPhuHuynh())
                    .stream().map(this::toChildDTO).toList();
            return new ProfileDTO(
                    principal.getVaiTro(),
                    parent.getMaPhuHuynh(),
                    account.getTenDangNhap(),
                    account.getTrangThai(),
                    (parent.getHoTenDemPH() + " " + parent.getTenPH()).trim(),
                    null,
                    parent.getSoDienThoai(),
                    parent.getEmail(),
                    parent.getDiaChiLH(),
                    null,
                    children,
                    List.of());
        }
        if ("GIAOVIEN".equals(principal.getVaiTro())) {
            GiaoVien teacher = giaoVienRepository.findByTaiKhoanMaTaiKhoan(principal.getMaTaiKhoan())
                    .orElseThrow(this::profileNotFound);
            TaiKhoan account = teacher.getTaiKhoan();
            List<PhanCongGiaoVienDTO> assignments = phanCongGiaoVienRepository
                    .findAllByGiaoVienMaGiaoVienOrderByNgayBatDauDesc(teacher.getMaGiaoVien())
                    .stream().map(this::toAssignmentDTO).toList();
            return new ProfileDTO(
                    principal.getVaiTro(),
                    teacher.getMaGiaoVien(),
                    account.getTenDangNhap(),
                    account.getTrangThai(),
                    (teacher.getHoTenDem() + " " + teacher.getTenGiaoVien()).trim(),
                    teacher.getNgaySinh(),
                    teacher.getSoDienThoai(),
                    teacher.getEmail(),
                    teacher.getDiaChiLH(),
                    teacher.getTrinhDoChuyenMon(),
                    List.of(),
                    assignments);
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vai trò này không có hồ sơ cá nhân.");
    }

    private PhuHuynhTreDTO toChildDTO(PhuHuynhTre link) {
        return new PhuHuynhTreDTO(
                link.getPhuHuynh().getMaPhuHuynh(),
                link.getPhuHuynh().getHoTenDemPH(),
                link.getPhuHuynh().getTenPH(),
                link.getTreEm().getMaTre(),
                link.getTreEm().getHoTenDemTre(),
                link.getTreEm().getTenTre(),
                link.getQuanHe());
    }

    private PhanCongGiaoVienDTO toAssignmentDTO(PhanCongGiaoVien assignment) {
        LocalDateTime now = LocalDateTime.now();
        boolean active = (assignment.getNgayBatDau() == null || !assignment.getNgayBatDau().isAfter(now))
                && (assignment.getNgayKetThuc() == null || assignment.getNgayKetThuc().isAfter(now));
        return new PhanCongGiaoVienDTO(
                assignment.getLopHoc().getMaLopHoc(),
                assignment.getLopHoc().getTenLopHoc(),
                assignment.getVaiTro(),
                assignment.getNgayBatDau(),
                assignment.getNgayKetThuc(),
                active);
    }

    private void validate(CapNhatProfileRequest request, String role) {
        if (request == null
                || request.soDienThoai() == null
                || !request.soDienThoai().trim().matches("\\d{10}")
                || request.diaChiLH() == null
                || request.diaChiLH().isBlank()
                || request.diaChiLH().trim().length() > 255
                || ("GIAOVIEN".equals(role)
                        && (request.email() == null || request.email().isBlank()))
                || (request.email() != null && !request.email().isBlank()
                        && (request.email().trim().length() > 100
                                || !request.email().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số điện thoại phải gồm 10 chữ số, email phải hợp lệ và địa chỉ không được để trống.");
        }
    }

    private ResponseStatusException profileNotFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ liên kết tài khoản.");
    }

    private ResponseStatusException phoneConflict() {
        return new ResponseStatusException(
                HttpStatus.CONFLICT, "Số điện thoại đã được sử dụng bởi hồ sơ khác.");
    }
}
