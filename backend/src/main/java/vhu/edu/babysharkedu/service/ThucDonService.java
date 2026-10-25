package vhu.edu.babysharkedu.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.ChiTietThucDonDTO;
import vhu.edu.babysharkedu.dto.ChiTietThucDonRequest;
import vhu.edu.babysharkedu.dto.MonAnDTO;
import vhu.edu.babysharkedu.dto.ThucDonDTO;
import vhu.edu.babysharkedu.dto.ThucDonRequest;
import vhu.edu.babysharkedu.model.ChiTietThucDon;
import vhu.edu.babysharkedu.model.MonAn;
import vhu.edu.babysharkedu.model.ThucDon;
import vhu.edu.babysharkedu.repository.ChiTietThucDonRepository;
import vhu.edu.babysharkedu.repository.MonAnRepository;
import vhu.edu.babysharkedu.repository.ThucDonRepository;

@Service
public class ThucDonService {
    private static final WeekFields ISO_WEEK = WeekFields.ISO;
    private final ThucDonRepository thucDonRepository;
    private final ChiTietThucDonRepository chiTietRepository;
    private final MonAnRepository monAnRepository;

    public ThucDonService(
            ThucDonRepository thucDonRepository,
            ChiTietThucDonRepository chiTietRepository,
            MonAnRepository monAnRepository) {
        this.thucDonRepository = thucDonRepository;
        this.chiTietRepository = chiTietRepository;
        this.monAnRepository = monAnRepository;
    }

    @Transactional(readOnly = true)
    public List<ThucDonDTO> layTatCa() {
        return thucDonRepository.findAll().stream().map(menu -> toDTO(menu, List.of())).toList();
    }

    @Transactional(readOnly = true)
    public ThucDonDTO layChiTiet(Integer maThucDon) {
        ThucDon menu = timThucDon(maThucDon);
        return toDTO(menu, layChiTietMon(menu.getMaThucDon()));
    }

    @Transactional
    public ThucDonDTO them(ThucDonRequest request) {
        validate(request);
        kiemTraTuanTrung(request, null);
        ThucDon menu = new ThucDon();
        capNhat(menu, request);
        menu = thucDonRepository.saveAndFlush(menu);
        return toDTO(menu, List.of());
    }

    @Transactional
    public ThucDonDTO capNhat(Integer maThucDon, ThucDonRequest request) {
        validate(request);
        ThucDon menu = timThucDon(maThucDon);
        kiemTraTuanTrung(request, maThucDon);
        capNhat(menu, request);
        return toDTO(thucDonRepository.saveAndFlush(menu), layChiTietMon(maThucDon));
    }

    @Transactional
    public void xoa(Integer maThucDon) {
        ThucDon menu = timThucDon(maThucDon);
        if (chiTietRepository.countByThucDonMaThucDon(maThucDon) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa thực đơn đang có chi tiết. Hãy xóa từng món ăn khỏi thực đơn trước.");
        }
        thucDonRepository.delete(menu);
    }

    @Transactional
    public ChiTietThucDonDTO themMon(Integer maThucDon, ChiTietThucDonRequest request) {
        ThucDon menu = timThucDon(maThucDon);
        validateChiTiet(request, menu);
        MonAn mon = timMonDuocPhep(request.maMonAn());
        kiemTraMonTrung(maThucDon, request, null);
        ChiTietThucDon detail = new ChiTietThucDon();
        detail.setThucDon(menu);
        detail.setMonAn(mon);
        detail.setDonGia(donGiaChoChiTiet(mon));
        capNhatChiTiet(detail, request);
        return toDTO(chiTietRepository.save(detail));
    }

    @Transactional
    public ChiTietThucDonDTO capNhatMon(
            Integer maThucDon,
            Integer maChiTietThucDon,
            ChiTietThucDonRequest request) {
        ThucDon menu = timThucDon(maThucDon);
        validateChiTiet(request, menu);
        ChiTietThucDon detail = timChiTiet(maChiTietThucDon, maThucDon);
        MonAn mon = timMonDuocPhep(request.maMonAn());
        kiemTraMonTrung(maThucDon, request, maChiTietThucDon);
        if (!Objects.equals(detail.getMonAn().getMaMonAn(), mon.getMaMonAn())) {
            detail.setDonGia(donGiaChoChiTiet(mon));
        }
        detail.setMonAn(mon);
        capNhatChiTiet(detail, request);
        return toDTO(chiTietRepository.save(detail));
    }

    @Transactional
    public void xoaMon(Integer maThucDon, Integer maChiTietThucDon) {
        chiTietRepository.delete(timChiTiet(maChiTietThucDon, maThucDon));
    }

    private void validate(ThucDonRequest request) {
        if (request == null
                || request.tuanApDung() == null || request.tuanApDung() < 1 || request.tuanApDung() > 53
                || request.thangApDung() == null || request.thangApDung() < 1 || request.thangApDung() > 12
                || request.namApDung() == null || request.namApDung() < 2000 || request.namApDung() > 2100
                || request.ngayBatDau() == null || request.ngayKetThuc() == null
                || request.ngayKetThuc().isBefore(request.ngayBatDau())
                || request.ghiChu() != null && request.ghiChu().trim().length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin thực đơn tuần không hợp lệ.");
        }
        LocalDate start = request.ngayBatDau();
        if (start.getDayOfWeek() != DayOfWeek.MONDAY
                || !request.ngayKetThuc().equals(start.plusDays(6))
                || request.tuanApDung() != start.get(ISO_WEEK.weekOfWeekBasedYear())
                || request.namApDung() != start.get(ISO_WEEK.weekBasedYear())
                || request.thangApDung() != start.getMonthValue()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tuần phải từ thứ Hai đến Chủ nhật; tuần, tháng và năm phải khớp ngày bắt đầu theo tuần ISO.");
        }
    }

    private void kiemTraTuanTrung(ThucDonRequest request, Integer excludedId) {
        boolean duplicate = thucDonRepository.findAll().stream()
                .anyMatch(existing -> !existing.getMaThucDon().equals(excludedId)
                        && existing.getTuanApDung() != null
                        && existing.getNamApDung() != null
                        && existing.getTuanApDung().equals(request.tuanApDung())
                        && existing.getNamApDung().equals(request.namApDung()));
        if (duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Đã có thực đơn cho tuần ISO này trong năm đã chọn.");
        }
    }

    private void capNhat(ThucDon menu, ThucDonRequest request) {
        menu.setTuanApDung(request.tuanApDung());
        menu.setThangApDung(request.thangApDung());
        menu.setNamApDung(request.namApDung());
        menu.setNgayBatDau(request.ngayBatDau().atStartOfDay());
        menu.setNgayKetThuc(request.ngayKetThuc().atTime(23, 59, 59));
        menu.setGhiChu(request.ghiChu() == null || request.ghiChu().isBlank() ? null : request.ghiChu().trim());
        if (request.trangThai() != null) {
            menu.setTrangThai(request.trangThai());
        } else if (menu.getMaThucDon() == null) {
            menu.setTrangThai(true);
        }
    }

    private void validateChiTiet(ChiTietThucDonRequest request, ThucDon menu) {
        if (request == null
                || request.ngayAn() == null
                || request.buaAn() == null
                || request.buaAn().isBlank()
                || request.buaAn().trim().length() > 30
                || request.maMonAn() == null
                || request.ghiChu() != null && request.ghiChu().trim().length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin món ăn trong thực đơn không hợp lệ.");
        }
        LocalDate start = menu.getNgayBatDau().toLocalDate();
        LocalDate end = menu.getNgayKetThuc().toLocalDate();
        if (request.ngayAn().isBefore(start) || request.ngayAn().isAfter(end)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Ngày ăn phải nằm trong khoảng thời gian áp dụng của thực đơn.");
        }
    }

    private void kiemTraMonTrung(Integer maThucDon, ChiTietThucDonRequest request, Integer excludedId) {
        boolean duplicate = chiTietRepository
                .findAllByThucDonMaThucDonOrderByNgayAnAscBuaAnAscMaChiTietThucDonAsc(maThucDon)
                .stream()
                .anyMatch(existing -> !existing.getMaChiTietThucDon().equals(excludedId)
                        && existing.getMonAn().getMaMonAn().equals(request.maMonAn())
                        && existing.getNgayAn() != null
                        && existing.getNgayAn().toLocalDate().equals(request.ngayAn())
                        && existing.getBuaAn() != null
                        && existing.getBuaAn().equalsIgnoreCase(request.buaAn().trim()));
        if (duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Món ăn này đã có trong cùng ngày và bữa ăn của thực đơn.");
        }
    }

    private void capNhatChiTiet(ChiTietThucDon detail, ChiTietThucDonRequest request) {
        detail.setNgayAn(request.ngayAn().atStartOfDay());
        detail.setBuaAn(request.buaAn().trim());
        detail.setGhiChu(request.ghiChu() == null || request.ghiChu().isBlank() ? null : request.ghiChu().trim());
    }

    private BigDecimal donGiaChoChiTiet(MonAn mon) {
        BigDecimal donGia = mon.getDonGia();
        if (donGia == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Món ăn chưa có đơn giá. Vui lòng cập nhật đơn giá trước khi thêm vào thực đơn.");
        }
        if (donGia.signum() < 0 || donGia.compareTo(new BigDecimal("99999999.99")) > 0
                || donGia.stripTrailingZeros().scale() > 2) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Đơn giá món ăn không phù hợp với giới hạn lưu của chi tiết thực đơn.");
        }
        return donGia;
    }

    private ThucDon timThucDon(Integer maThucDon) {
        return thucDonRepository.findById(maThucDon)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thực đơn."));
    }

    private ChiTietThucDon timChiTiet(Integer maChiTietThucDon, Integer maThucDon) {
        ChiTietThucDon detail = chiTietRepository.findById(maChiTietThucDon)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết thực đơn."));
        if (!detail.getThucDon().getMaThucDon().equals(maThucDon)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chi tiết không thuộc thực đơn đã chọn.");
        }
        return detail;
    }

    private MonAn timMonDuocPhep(Integer maMonAn) {
        MonAn mon = monAnRepository.findById(maMonAn)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy món ăn."));
        if (!Boolean.TRUE.equals(mon.getTrangThai())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể thêm món ăn đã ngừng sử dụng.");
        }
        return mon;
    }

    private List<ChiTietThucDonDTO> layChiTietMon(Integer maThucDon) {
        return chiTietRepository
                .findAllByThucDonMaThucDonOrderByNgayAnAscBuaAnAscMaChiTietThucDonAsc(maThucDon)
                .stream().map(this::toDTO).toList();
    }

    private ThucDonDTO toDTO(ThucDon menu, List<ChiTietThucDonDTO> details) {
        return new ThucDonDTO(
                menu.getMaThucDon(),
                menu.getTuanApDung(),
                menu.getThangApDung(),
                menu.getNamApDung(),
                menu.getNgayBatDau() == null ? null : menu.getNgayBatDau().toLocalDate(),
                menu.getNgayKetThuc() == null ? null : menu.getNgayKetThuc().toLocalDate(),
                menu.getGhiChu(),
                menu.getTrangThai(),
                details);
    }

    private ChiTietThucDonDTO toDTO(ChiTietThucDon detail) {
        MonAn mon = detail.getMonAn();
        return new ChiTietThucDonDTO(
                detail.getMaChiTietThucDon(),
                detail.getNgayAn() == null ? null : detail.getNgayAn().toLocalDate(),
                detail.getBuaAn(),
                detail.getDonGia(),
                detail.getGhiChu(),
                new MonAnDTO(
                        mon.getMaMonAn(),
                        mon.getTenMonAn(),
                        mon.getLoaiMon(),
                        mon.getThanhPhan(),
                        mon.getDonGia(),
                        mon.getTrangThai()));
    }
}
