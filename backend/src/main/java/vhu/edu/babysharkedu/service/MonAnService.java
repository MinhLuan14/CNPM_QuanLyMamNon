package vhu.edu.babysharkedu.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.MonAnDTO;
import vhu.edu.babysharkedu.dto.MonAnRequest;
import vhu.edu.babysharkedu.model.MonAn;
import vhu.edu.babysharkedu.repository.ChiTietThucDonRepository;
import vhu.edu.babysharkedu.repository.MonAnRepository;

@Service
public class MonAnService {
    private static final int TEN_MON_MAX_LENGTH = 100;
    private static final int LOAI_MON_MAX_LENGTH = 50;
    private static final int THANH_PHAN_MAX_LENGTH = 500;
    private static final BigDecimal MAX_DON_GIA = new BigDecimal("9999999999.99");
    private static final String TEN_MON_AN_DUPLICATE_MESSAGE =
            "Tên món ăn đã tồn tại. Vui lòng nhập tên món ăn khác.";
    private static final String MON_AN_DANG_SU_DUNG_MESSAGE =
            "Không thể xóa món ăn này vì đang được sử dụng trong thực đơn.";

    private final MonAnRepository monAnRepository;
    private final ChiTietThucDonRepository chiTietRepository;

    public MonAnService(MonAnRepository monAnRepository, ChiTietThucDonRepository chiTietRepository) {
        this.monAnRepository = monAnRepository;
        this.chiTietRepository = chiTietRepository;
    }

    @Transactional(readOnly = true)
    public List<MonAnDTO> layTatCa(String keyword, String loaiMon, Boolean trangThai) {
        return monAnRepository.timKiem(
                        keyword == null || keyword.isBlank() ? null : keyword.trim(),
                        loaiMon == null || loaiMon.isBlank() ? null : loaiMon.trim(),
                        trangThai)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public MonAnDTO layChiTiet(Integer maMonAn) {
        return toDTO(timMon(maMonAn));
    }

    @Transactional
    public MonAnDTO them(MonAnRequest request) {
        validate(request);
        String tenMonAn = request.tenMonAn().strip();
        if (monAnRepository.demTenMonAnChuanHoa(chuanHoaTenMonAn(tenMonAn)) > 0) {
            throw tenMonAnBiTrung();
        }
        MonAn mon = new MonAn();
        capNhat(mon, request);
        return toDTO(monAnRepository.save(mon));
    }

    @Transactional
    public MonAnDTO capNhat(Integer maMonAn, MonAnRequest request) {
        validate(request);
        MonAn mon = timMon(maMonAn);
        String tenMonAn = request.tenMonAn().strip();
        if (monAnRepository.demTenMonAnChuanHoaKhacMa(
                chuanHoaTenMonAn(tenMonAn), maMonAn) > 0) {
            throw tenMonAnBiTrung();
        }
        capNhat(mon, request);
        return toDTO(monAnRepository.save(mon));
    }

    @Transactional
    public void xoa(Integer maMonAn) {
        MonAn mon = timMon(maMonAn);
        if (chiTietRepository.existsByMonAnMaMonAn(maMonAn)) {
            throw monAnDangSuDung();
        }
        try {
            monAnRepository.delete(mon);
            monAnRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw monAnDangSuDung();
        }
    }

    @Transactional
    public MonAnDTO capNhatTrangThai(Integer maMonAn, Boolean trangThai) {
        if (trangThai == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái món ăn là bắt buộc.");
        }
        MonAn mon = timMon(maMonAn);
        if (Boolean.FALSE.equals(trangThai) && chiTietRepository.existsByMonAnMaMonAn(maMonAn)) {
            mon.setTrangThai(false);
            return toDTO(monAnRepository.save(mon));
        }
        mon.setTrangThai(trangThai);
        return toDTO(monAnRepository.save(mon));
    }

    private MonAn timMon(Integer maMonAn) {
        return monAnRepository.findById(maMonAn)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy món ăn."));
    }

    private void validate(MonAnRequest request) {
        if (request == null
                || request.tenMonAn() == null
                || request.tenMonAn().isBlank()
                || request.tenMonAn().trim().length() > TEN_MON_MAX_LENGTH
                || (request.loaiMon() != null && request.loaiMon().trim().length() > LOAI_MON_MAX_LENGTH)
                || (request.thanhPhan() != null && request.thanhPhan().trim().length() > THANH_PHAN_MAX_LENGTH)
                || !donGiaHopLe(request.donGia())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên món ăn, loại món, thành phần hoặc đơn giá không hợp lệ. Đơn giá bắt buộc, không âm và tối đa 10 chữ số nguyên cùng 2 chữ số thập phân.");
        }
    }

    private boolean donGiaHopLe(BigDecimal donGia) {
        return donGia != null
                && donGia.signum() >= 0
                && donGia.compareTo(MAX_DON_GIA) <= 0
                && donGia.stripTrailingZeros().scale() <= 2;
    }

    private String chuanHoaTenMonAn(String tenMonAn) {
        return tenMonAn.strip().toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException tenMonAnBiTrung() {
        return new ResponseStatusException(HttpStatus.CONFLICT, TEN_MON_AN_DUPLICATE_MESSAGE);
    }

    private ResponseStatusException monAnDangSuDung() {
        return new ResponseStatusException(HttpStatus.CONFLICT, MON_AN_DANG_SU_DUNG_MESSAGE);
    }

    private void capNhat(MonAn mon, MonAnRequest request) {
        mon.setTenMonAn(request.tenMonAn().strip());
        mon.setLoaiMon(blankToNull(request.loaiMon()));
        mon.setThanhPhan(blankToNull(request.thanhPhan()));
        mon.setDonGia(request.donGia().setScale(2, RoundingMode.UNNECESSARY));
        if (request.trangThai() != null) {
            mon.setTrangThai(request.trangThai());
        } else if (mon.getMaMonAn() == null) {
            mon.setTrangThai(true);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private MonAnDTO toDTO(MonAn mon) {
        return new MonAnDTO(
                mon.getMaMonAn(),
                mon.getTenMonAn(),
                mon.getLoaiMon(),
                mon.getThanhPhan(),
                mon.getDonGia(),
                mon.getTrangThai());
    }
}
