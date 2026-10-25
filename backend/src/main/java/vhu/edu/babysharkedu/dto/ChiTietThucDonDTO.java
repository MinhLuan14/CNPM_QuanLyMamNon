package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ChiTietThucDonDTO(
        Integer maChiTietThucDon,
        LocalDate ngayAn,
        String buaAn,
        BigDecimal donGia,
        String ghiChu,
        MonAnDTO monAn) {
}
