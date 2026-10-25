package vhu.edu.babysharkedu.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.CapNhatTrangThaiTreRequest;
import vhu.edu.babysharkedu.dto.PhanLopRequest;
import vhu.edu.babysharkedu.dto.TreEmDTO;
import vhu.edu.babysharkedu.dto.TreEmRequest;
import vhu.edu.babysharkedu.dto.TreEmThongKeDTO;
import vhu.edu.babysharkedu.dto.TreEmThongKeDTO.ThongKeTreTheoLopDTO;
import vhu.edu.babysharkedu.model.LopHoc;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.HocPhiRepository;
import vhu.edu.babysharkedu.repository.LopHocRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class TreEmService {
    private static final int HO_TEN_DEM_MAX_LENGTH = 255;
    private static final int TEN_TRE_MAX_LENGTH = 100;
    private static final int NOI_SINH_MAX_LENGTH = 100;
    private static final List<String> TRANG_THAI_HOP_LE = List.of("Đang học", "Tạm nghỉ", "Đã nghỉ");

    private final TreEmRepository treEmRepository;
    private final LopHocRepository lopHocRepository;
    private final HocPhiRepository hocPhiRepository;
    private final PhuHuynhTreRepository phuHuynhTreRepository;
    private final PhuHuynhRepository phuHuynhRepository;

    public TreEmService(
            TreEmRepository treEmRepository,
            LopHocRepository lopHocRepository,
            HocPhiRepository hocPhiRepository,
            PhuHuynhTreRepository phuHuynhTreRepository,
            PhuHuynhRepository phuHuynhRepository) {
        this.treEmRepository = treEmRepository;
        this.lopHocRepository = lopHocRepository;
        this.hocPhiRepository = hocPhiRepository;
        this.phuHuynhTreRepository = phuHuynhTreRepository;
        this.phuHuynhRepository = phuHuynhRepository;
    }

    @Transactional(readOnly = true)
    public List<TreEmDTO> layTatCa(Authentication authentication) {
        if (laNhanVien(authentication)) {
            return treEmRepository.findAllByOrderByMaTre().stream().map(this::toDTO).toList();
        }
        Integer maPhuHuynh = timMaPhuHuynh(authentication);
        return phuHuynhTreRepository
                .findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(maPhuHuynh)
                .stream().map(lienKet -> toDTO(lienKet.getTreEm())).toList();
    }

    @Transactional(readOnly = true)
    public TreEmDTO layChiTiet(Integer maTre, Authentication authentication) {
        TreEm treEm = timTre(maTre);
        if (!laNhanVien(authentication)) {
            Integer maPhuHuynh = timMaPhuHuynh(authentication);
            if (!phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(maPhuHuynh, maTre)) {
                throw new AccessDeniedException("Bạn không có quyền xem thông tin của trẻ này.");
            }
        }
        return toDTO(treEm);
    }

    @Transactional
    public TreEmDTO them(TreEmRequest request) {
        validate(request);
        TreEm treEm = new TreEm();
        capNhatThongTin(treEm, request);
        treEm.setTrangThaiHocTap("Đang học");
        return toDTO(treEmRepository.save(treEm));
    }

    @Transactional
    public TreEmDTO capNhat(Integer maTre, TreEmRequest request) {
        validate(request);
        TreEm treEm = timTre(maTre);
        capNhatThongTin(treEm, request);
        return toDTO(treEmRepository.save(treEm));
    }

    @Transactional
    public void xoa(Integer maTre) {
        TreEm treEm = timTre(maTre);
        if (hocPhiRepository.existsByTreEmMaTre(maTre)
                || phuHuynhTreRepository.existsByTreEmMaTre(maTre)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa hồ sơ trẻ đã phát sinh học phí hoặc liên kết phụ huynh.");
        }
        treEmRepository.delete(treEm);
    }

    @Transactional(readOnly = true)
    public List<TreEmDTO> timKiem(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập từ khóa tìm kiếm.");
        }

        String tuKhoa = keyword.trim();
        Map<Integer, TreEm> ketQua = new LinkedHashMap<>();
        treEmRepository
                .findAllByHoTenDemTreContainingIgnoreCaseOrTenTreContainingIgnoreCaseOrderByMaTre(tuKhoa, tuKhoa)
                .forEach(tre -> ketQua.put(tre.getMaTre(), tre));

        if (tuKhoa.matches("\\d+")) {
            try {
                treEmRepository.findById(Integer.valueOf(tuKhoa))
                        .ifPresent(tre -> ketQua.put(tre.getMaTre(), tre));
            } catch (NumberFormatException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã trẻ tìm kiếm vượt quá giới hạn.");
            }
        }

        return ketQua.values().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<TreEmDTO> layTheoLop(Integer maLopHoc) {
        timLop(maLopHoc);
        return treEmRepository.findAllByLopHocMaLopHocOrderByMaTre(maLopHoc)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<TreEmDTO> layChuaPhanLop() {
        return treEmRepository.findAllByLopHocIsNullOrderByMaTre()
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<TreEmDTO> layTreChuaLienKet(Integer maPhuHuynh) {
        if (!phuHuynhRepository.existsById(maPhuHuynh)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ phụ huynh.");
        }
        return treEmRepository.findAllChuaLienKetVoiPhuHuynh(maPhuHuynh)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public TreEmDTO phanLop(Integer maTre, PhanLopRequest request) {
        if (request == null || request.maLopHoc() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn lớp cần phân.");
        }
        TreEm treEm = timTre(maTre);
        ganLop(treEm, request.maLopHoc());
        return toDTO(treEmRepository.save(treEm));
    }

    @Transactional
    public TreEmDTO chuyenLop(Integer maTre, PhanLopRequest request) {
        if (request == null || request.maLopHoc() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn lớp cần chuyển đến.");
        }
        TreEm treEm = timTre(maTre);
        if (treEm.getLopHoc() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Trẻ chưa được phân lớp; hãy sử dụng chức năng phân lớp.");
        }
        ganLop(treEm, request.maLopHoc());
        return toDTO(treEmRepository.save(treEm));
    }

    @Transactional
    public TreEmDTO capNhatTrangThai(Integer maTre, CapNhatTrangThaiTreRequest request) {
        if (request == null || request.trangThaiHocTap() == null
                || !TRANG_THAI_HOP_LE.contains(request.trangThaiHocTap().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái phải là Đang học, Tạm nghỉ hoặc Đã nghỉ.");
        }
        TreEm treEm = timTre(maTre);
        treEm.setTrangThaiHocTap(request.trangThaiHocTap().trim());
        return toDTO(treEmRepository.save(treEm));
    }

    @Transactional(readOnly = true)
    public TreEmThongKeDTO thongKe() {
        List<TreEm> danhSachTre = treEmRepository.findAllByOrderByMaTre();
        Map<String, Long> theoTrangThai = new LinkedHashMap<>();
        Map<String, Long> theoDoTuoi = new LinkedHashMap<>();

        for (String trangThai : TRANG_THAI_HOP_LE) {
            theoTrangThai.put(trangThai, 0L);
        }
        theoDoTuoi.put("Dưới 3 tuổi", 0L);
        theoDoTuoi.put("3-4 tuổi", 0L);
        theoDoTuoi.put("4-5 tuổi", 0L);
        theoDoTuoi.put("5-6 tuổi", 0L);
        theoDoTuoi.put("Từ 6 tuổi", 0L);

        Map<Integer, Long> soTreTheoLop = new LinkedHashMap<>();
        for (TreEm treEm : danhSachTre) {
            theoTrangThai.merge(treEm.getTrangThaiHocTap(), 1L, Long::sum);
            theoDoTuoi.merge(nhomDoTuoi(treEm.getNgayThangNamSinh()), 1L, Long::sum);
            if (treEm.getLopHoc() != null) {
                soTreTheoLop.merge(treEm.getLopHoc().getMaLopHoc(), 1L, Long::sum);
            }
        }

        List<ThongKeTreTheoLopDTO> theoLop = new ArrayList<>();
        for (LopHoc lopHoc : lopHocRepository.findAll()) {
            theoLop.add(new ThongKeTreTheoLopDTO(
                    lopHoc.getMaLopHoc(),
                    lopHoc.getTenLopHoc(),
                    soTreTheoLop.getOrDefault(lopHoc.getMaLopHoc(), 0L)));
        }

        return new TreEmThongKeDTO(danhSachTre.size(), theoTrangThai, theoDoTuoi, theoLop);
    }

    private TreEm timTre(Integer maTre) {
        return treEmRepository.findById(maTre)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ trẻ."));
    }

    private LopHoc timLop(Integer maLopHoc) {
        return lopHocRepository.findById(maLopHoc)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học."));
    }

    private void validate(TreEmRequest request) {
        if (request == null
                || request.hoTenDemTre() == null
                || request.hoTenDemTre().isBlank()
                || request.hoTenDemTre().trim().length() > HO_TEN_DEM_MAX_LENGTH
                || request.tenTre() == null
                || request.tenTre().isBlank()
                || request.tenTre().trim().length() > TEN_TRE_MAX_LENGTH
                || request.ngayThangNamSinh() == null
                || request.ngayThangNamSinh().isAfter(LocalDate.now())
                || request.noiSinh() == null
                || request.noiSinh().isBlank()
                || request.noiSinh().trim().length() > NOI_SINH_MAX_LENGTH
                || (request.trangThaiHocTap() != null
                        && !TRANG_THAI_HOP_LE.contains(request.trangThaiHocTap().trim()))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Họ tên, ngày sinh hợp lệ và nơi sinh là bắt buộc; trạng thái học tập không hợp lệ.");
        }

        if (request.maLopHoc() != null) {
            timLop(request.maLopHoc());
        }
    }

    private void capNhatThongTin(TreEm treEm, TreEmRequest request) {
        treEm.setHoTenDemTre(request.hoTenDemTre().trim());
        treEm.setTenTre(request.tenTre().trim());
        treEm.setNgayThangNamSinh(request.ngayThangNamSinh());
        treEm.setNoiSinh(request.noiSinh().trim());
        ganLop(treEm, request.maLopHoc());
        if (request.trangThaiHocTap() != null) {
            treEm.setTrangThaiHocTap(request.trangThaiHocTap().trim());
        }
    }

    private void ganLop(TreEm treEm, Integer maLopHoc) {
        if (maLopHoc == null) {
            treEm.setLopHoc(null);
            return;
        }

        LopHoc lopHoc = timLop(maLopHoc);
        boolean sameClass = treEm.getLopHoc() != null
                && treEm.getLopHoc().getMaLopHoc().equals(maLopHoc);
        long soTreTrongLop = treEmRepository.countByLopHocMaLopHoc(maLopHoc);
        long siSoToiDa = lopHoc.getSoLuongToiDa() == null ? 0 : lopHoc.getSoLuongToiDa();
        if (!sameClass && soTreTrongLop >= siSoToiDa) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lớp đã đủ sĩ số tối đa.");
        }
        treEm.setLopHoc(lopHoc);
    }

    private String nhomDoTuoi(LocalDate ngaySinh) {
        int tuoi = Period.between(ngaySinh, LocalDate.now()).getYears();
        if (tuoi < 3) {
            return "Dưới 3 tuổi";
        }
        if (tuoi < 4) {
            return "3-4 tuổi";
        }
        if (tuoi < 5) {
            return "4-5 tuổi";
        }
        if (tuoi < 6) {
            return "5-6 tuổi";
        }
        return "Từ 6 tuổi";
    }

    private TreEmDTO toDTO(TreEm treEm) {
        LopHoc lopHoc = treEm.getLopHoc();
        return new TreEmDTO(
                treEm.getMaTre(),
                treEm.getHoTenDemTre(),
                treEm.getTenTre(),
                treEm.getNgayThangNamSinh(),
                treEm.getNoiSinh(),
                lopHoc == null ? null : lopHoc.getMaLopHoc(),
                lopHoc == null ? null : lopHoc.getTenLopHoc(),
                treEm.getTrangThaiHocTap(),
                "/api/tre-em/" + treEm.getMaTre() + "/anh-dai-dien");
    }

    private boolean laNhanVien(Authentication authentication) {
        return authentication != null
                && authentication.getPrincipal() instanceof TaiKhoanPrincipal principal
                && ("ADMIN".equals(principal.getVaiTro()) || "GIAOVIEN".equals(principal.getVaiTro()));
    }

    private Integer timMaPhuHuynh(Authentication authentication) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof TaiKhoanPrincipal principal)
                || !"PHUHUYNH".equals(principal.getVaiTro())) {
            throw new AccessDeniedException("Bạn không có quyền xem danh sách trẻ.");
        }
        return phuHuynhRepository.findByTaiKhoanMaTaiKhoan(principal.getMaTaiKhoan())
                .map(phuHuynh -> phuHuynh.getMaPhuHuynh())
                .orElseThrow(() -> new AccessDeniedException(
                        "Tài khoản chưa được gắn với hồ sơ phụ huynh."));
    }
}
