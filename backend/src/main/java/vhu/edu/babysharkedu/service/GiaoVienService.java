package vhu.edu.babysharkedu.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.GiaoVienDTO;
import vhu.edu.babysharkedu.dto.GiaoVienRequest;
import vhu.edu.babysharkedu.dto.GiaoVienTaoDTO;
import vhu.edu.babysharkedu.dto.PhanCongGiaoVienDTO;
import vhu.edu.babysharkedu.dto.PhanCongGiaoVienRequest;
import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.LopHoc;
import vhu.edu.babysharkedu.model.PhanCongGiaoVien;
import vhu.edu.babysharkedu.model.PhanCongGiaoVienId;
import vhu.edu.babysharkedu.repository.GiaoVienDanhSachProjection;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.LopHocRepository;
import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;

@Service
public class GiaoVienService {
    private static final Set<String> VAI_TRO_HOP_LE = Set.of(
            "Giáo viên chủ nhiệm",
            "Giáo viên phó / phụ trách",
            "Giáo viên năng khiếu",
            "Tổ trưởng chuyên môn",
            "Giáo viên hỗ trợ");

    private final GiaoVienRepository giaoVienRepository;
    private final LopHocRepository lopHocRepository;
    private final PhanCongGiaoVienRepository phanCongGiaoVienRepository;
    private final TaiKhoanCapPhatService taiKhoanCapPhatService;

    public GiaoVienService(
            GiaoVienRepository giaoVienRepository,
            LopHocRepository lopHocRepository,
            PhanCongGiaoVienRepository phanCongGiaoVienRepository,
            TaiKhoanCapPhatService taiKhoanCapPhatService) {
        this.giaoVienRepository = giaoVienRepository;
        this.lopHocRepository = lopHocRepository;
        this.phanCongGiaoVienRepository = phanCongGiaoVienRepository;
        this.taiKhoanCapPhatService = taiKhoanCapPhatService;
    }

    @Transactional(readOnly = true)
    public List<GiaoVienDTO> layTatCa() {
        return toDTOs(giaoVienRepository.findAllWithAssignments());
    }

    @Transactional(readOnly = true)
    public GiaoVienDTO layChiTiet(Integer maGiaoVien) {
        return toDTOs(giaoVienRepository.findWithAssignmentsByMaGiaoVien(maGiaoVien)).stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ giáo viên."));
    }

    @Transactional
    public GiaoVienTaoDTO them(GiaoVienRequest request) {
        validate(request);
        String soDienThoai = request.soDienThoai().trim();
        if (giaoVienRepository.existsBySoDienThoai(soDienThoai)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại giáo viên đã được sử dụng.");
        }

        String tenDangNhap = taiKhoanCapPhatService.taoTenDangNhap(
                request.hoTen(), "gv" + soDienThoai.substring(soDienThoai.length() - 4));
        TaiKhoanCapPhatResult taiKhoan = taiKhoanCapPhatService.taoTaiKhoan(tenDangNhap, "GIAOVIEN");
        GiaoVien giaoVien = new GiaoVien();
        capNhatHoSo(giaoVien, request);
        giaoVien.setTaiKhoan(taiKhoan.taiKhoan());
        giaoVien = giaoVienRepository.saveAndFlush(giaoVien);

        if (request.maLopHoc() != null) {
            taoPhanCong(giaoVien, new PhanCongGiaoVienRequest(request.maLopHoc(), request.vaiTro()));
        }

        return new GiaoVienTaoDTO(layChiTiet(giaoVien.getMaGiaoVien()), tenDangNhap, taiKhoan.matKhauTamThoi());
    }

    @Transactional
    public GiaoVienDTO capNhat(Integer maGiaoVien, GiaoVienRequest request) {
        validate(request);
        GiaoVien giaoVien = giaoVienRepository.findById(maGiaoVien)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ giáo viên."));
        if (giaoVienRepository.existsBySoDienThoaiAndMaGiaoVienNot(
                request.soDienThoai().trim(), maGiaoVien)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại đã được giáo viên khác sử dụng.");
        }
        capNhatHoSo(giaoVien, request);
        giaoVienRepository.save(giaoVien);
        if (request.maLopHocCu() != null || request.maLopHoc() != null) {
            capNhatPhanCongKhiCapNhatHoSo(giaoVien, request);
        }
        return layChiTiet(maGiaoVien);
    }

    private void capNhatPhanCongKhiCapNhatHoSo(GiaoVien giaoVien, GiaoVienRequest request) {
        Integer maGiaoVien = giaoVien.getMaGiaoVien();
        Integer oldClassId = request.maLopHocCu();
        Integer newClassId = request.maLopHoc();
        LocalDateTime now = LocalDateTime.now();

        PhanCongGiaoVien oldAssignment = null;
        if (oldClassId != null) {
            oldAssignment = phanCongGiaoVienRepository.findById(taoPhanCongId(maGiaoVien, oldClassId))
                    .filter(assignment -> assignment.getNgayKetThuc() == null
                            && (assignment.getNgayBatDau() == null || !assignment.getNgayBatDau().isAfter(now)))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Phân công lớp hiện tại đã thay đổi. Tải lại hồ sơ giáo viên trước khi lưu."));
        }

        if (java.util.Objects.equals(oldClassId, newClassId)) {
            if (oldAssignment != null && !request.vaiTro().trim().equals(oldAssignment.getVaiTro())) {
                oldAssignment.setVaiTro(request.vaiTro().trim());
                phanCongGiaoVienRepository.save(oldAssignment);
            }
            return;
        }

        if (newClassId != null) {
            PhanCongGiaoVienId newAssignmentId = taoPhanCongId(maGiaoVien, newClassId);
            PhanCongGiaoVien newAssignment = phanCongGiaoVienRepository.findById(newAssignmentId)
                    .orElse(null);
            if (newAssignment == null) {
                taoPhanCong(giaoVien, new PhanCongGiaoVienRequest(newClassId, request.vaiTro()));
            } else if (newAssignment.getNgayKetThuc() != null
                    || (newAssignment.getNgayBatDau() != null && newAssignment.getNgayBatDau().isAfter(now))) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Lớp đã có phân công trước đây và không thể tạo lại theo cấu trúc dữ liệu hiện tại.");
            } else if (!request.vaiTro().trim().equals(newAssignment.getVaiTro())) {
                newAssignment.setVaiTro(request.vaiTro().trim());
                phanCongGiaoVienRepository.save(newAssignment);
            }
        }

        if (oldAssignment != null) {
            oldAssignment.setNgayKetThuc(now);
            phanCongGiaoVienRepository.save(oldAssignment);
        }
    }

    @Transactional
    public GiaoVienDTO themPhanCong(Integer maGiaoVien, PhanCongGiaoVienRequest request) {
        validatePhanCong(request);
        GiaoVien giaoVien = timGiaoVien(maGiaoVien);
        LopHoc lopHoc = timLopHoc(request.maLopHoc());
        PhanCongGiaoVienId id = taoPhanCongId(maGiaoVien, request.maLopHoc());
        if (phanCongGiaoVienRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Đã tồn tại phân công cho giáo viên và lớp này. Không thể tạo thêm kỳ phân công vì khóa dữ liệu hiện tại chỉ lưu một bản ghi cho cặp này.");
        }

        PhanCongGiaoVien phanCong = new PhanCongGiaoVien();
        phanCong.setId(id);
        phanCong.setGiaoVien(giaoVien);
        phanCong.setLopHoc(lopHoc);
        phanCong.setNgayBatDau(LocalDateTime.now());
        phanCong.setVaiTro(request.vaiTro().trim());
        phanCongGiaoVienRepository.save(phanCong);
        return layChiTiet(maGiaoVien);
    }

    @Transactional
    public GiaoVienDTO capNhatVaiTroPhanCong(
            Integer maGiaoVien,
            Integer maLopHoc,
            PhanCongGiaoVienRequest request) {
        if (request == null || request.vaiTro() == null || !VAI_TRO_HOP_LE.contains(request.vaiTro().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò phân công không hợp lệ.");
        }
        if (request.maLopHoc() != null && !request.maLopHoc().equals(maLopHoc)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lớp trong request không khớp URL.");
        }
        timGiaoVien(maGiaoVien);
        PhanCongGiaoVien phanCong = phanCongGiaoVienRepository.findById(
                taoPhanCongId(maGiaoVien, maLopHoc))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy phân công giáo viên - lớp."));
        phanCong.setVaiTro(request.vaiTro().trim());
        phanCongGiaoVienRepository.save(phanCong);
        return layChiTiet(maGiaoVien);
    }

    @Transactional
    public GiaoVienDTO ketThucPhanCong(Integer maGiaoVien, Integer maLopHoc) {
        timGiaoVien(maGiaoVien);
        PhanCongGiaoVien phanCong = phanCongGiaoVienRepository.findById(
                taoPhanCongId(maGiaoVien, maLopHoc))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy phân công giáo viên - lớp."));
        if (phanCong.getNgayKetThuc() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phân công này đã kết thúc.");
        }
        phanCong.setNgayKetThuc(LocalDateTime.now());
        phanCongGiaoVienRepository.save(phanCong);
        return layChiTiet(maGiaoVien);
    }

    private void taoPhanCong(GiaoVien giaoVien, PhanCongGiaoVienRequest request) {
        validatePhanCong(request);
        LopHoc lopHoc = timLopHoc(request.maLopHoc());
        PhanCongGiaoVienId id = taoPhanCongId(giaoVien.getMaGiaoVien(), request.maLopHoc());
        PhanCongGiaoVien phanCong = new PhanCongGiaoVien();
        phanCong.setId(id);
        phanCong.setGiaoVien(giaoVien);
        phanCong.setLopHoc(lopHoc);
        phanCong.setNgayBatDau(LocalDateTime.now());
        phanCong.setVaiTro(request.vaiTro().trim());
        phanCongGiaoVienRepository.save(phanCong);
    }

    private void validate(GiaoVienRequest request) {
        if (request == null
                || request.hoTen() == null
                || request.hoTen().isBlank()
                || request.hoTen().trim().length() > 356
                || request.soDienThoai() == null
                || !request.soDienThoai().trim().matches("\\d{10}")
                || request.email() == null
                || request.email().trim().length() > 100
                || !request.email().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
                || request.diaChiLH() == null
                || request.diaChiLH().isBlank()
                || request.diaChiLH().trim().length() > 255
                || (request.ngaySinh() != null && request.ngaySinh().isAfter(LocalDate.now()))
                || (request.trinhDoChuyenMon() != null && request.trinhDoChuyenMon().trim().length() > 255)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Họ tên, số điện thoại 10 chữ số, email hợp lệ và địa chỉ là bắt buộc; "
                            + "ngày sinh không được ở tương lai và trình độ tối đa 255 ký tự.");
        }
        String[] hoTen = request.hoTen().trim().split("\\s+");
        String ten = hoTen[hoTen.length - 1];
        String hoTenDem = String.join(" ", Arrays.copyOf(hoTen, hoTen.length - 1));
        if (ten.length() > 100 || hoTenDem.isBlank() || hoTenDem.length() > 255) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Họ tên cần có họ và tên; phần họ tên đệm tối đa 255 ký tự, tên tối đa 100 ký tự.");
        }
        if (request.maLopHoc() != null) {
            validatePhanCong(new PhanCongGiaoVienRequest(request.maLopHoc(), request.vaiTro()));
        }
    }

    private void validatePhanCong(PhanCongGiaoVienRequest request) {
        if (request == null
                || request.maLopHoc() == null
                || request.maLopHoc() <= 0
                || request.vaiTro() == null
                || !VAI_TRO_HOP_LE.contains(request.vaiTro().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lớp học và vai trò phân công không hợp lệ.");
        }
    }

    private void capNhatHoSo(GiaoVien giaoVien, GiaoVienRequest request) {
        String[] hoTen = request.hoTen().trim().split("\\s+");
        giaoVien.setHoTenDem(String.join(" ", Arrays.copyOf(hoTen, hoTen.length - 1)));
        giaoVien.setTenGiaoVien(hoTen[hoTen.length - 1]);
        giaoVien.setNgaySinh(request.ngaySinh());
        giaoVien.setSoDienThoai(request.soDienThoai().trim());
        giaoVien.setEmail(request.email().trim());
        giaoVien.setDiaChiLH(request.diaChiLH().trim());
        giaoVien.setTrinhDoChuyenMon(
                request.trinhDoChuyenMon() == null || request.trinhDoChuyenMon().isBlank()
                        ? null
                        : request.trinhDoChuyenMon().trim());
    }

    private List<GiaoVienDTO> toDTOs(List<GiaoVienDanhSachProjection> rows) {
        Map<Integer, List<GiaoVienDanhSachProjection>> grouped = new LinkedHashMap<>();
        rows.forEach(row -> grouped.computeIfAbsent(row.getMaGiaoVien(), ignored -> new ArrayList<>()).add(row));
        return grouped.values().stream().map(this::toDTO).toList();
    }

    private GiaoVienDTO toDTO(List<GiaoVienDanhSachProjection> rows) {
        GiaoVienDanhSachProjection teacher = rows.get(0);
        LocalDateTime now = LocalDateTime.now();
        List<PhanCongGiaoVienDTO> assignments = rows.stream()
                .filter(row -> row.getMaLopHoc() != null)
                .map(row -> new PhanCongGiaoVienDTO(
                        row.getMaLopHoc(),
                        row.getTenLopHoc(),
                        row.getVaiTroPhanCong(),
                        row.getNgayBatDau(),
                        row.getNgayKetThuc(),
                        (row.getNgayBatDau() == null || !row.getNgayBatDau().isAfter(now))
                                && (row.getNgayKetThuc() == null || row.getNgayKetThuc().isAfter(now))))
                .toList();
        return new GiaoVienDTO(
                teacher.getMaGiaoVien(),
                (teacher.getHoTenDem() + " " + teacher.getTenGiaoVien()).trim(),
                teacher.getNgaySinh(),
                teacher.getSoDienThoai(),
                teacher.getEmail(),
                teacher.getDiaChiLH(),
                teacher.getTrinhDoChuyenMon(),
                teacher.getTenDangNhap(),
                teacher.getTrangThaiTaiKhoan(),
                assignments.stream().anyMatch(PhanCongGiaoVienDTO::dangPhuTrach),
                assignments,
                "/api/giao-vien/" + teacher.getMaGiaoVien() + "/anh-dai-dien");
    }

    private GiaoVien timGiaoVien(Integer maGiaoVien) {
        return giaoVienRepository.findById(maGiaoVien)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ giáo viên."));
    }

    private LopHoc timLopHoc(Integer maLopHoc) {
        return lopHocRepository.findById(maLopHoc)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học."));
    }

    private PhanCongGiaoVienId taoPhanCongId(Integer maGiaoVien, Integer maLopHoc) {
        PhanCongGiaoVienId id = new PhanCongGiaoVienId();
        id.setMaGiaoVien(maGiaoVien);
        id.setMaLopHoc(maLopHoc);
        return id;
    }
}
