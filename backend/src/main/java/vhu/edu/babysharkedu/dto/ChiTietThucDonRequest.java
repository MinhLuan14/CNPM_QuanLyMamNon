package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ChiTietThucDonRequest(
        LocalDate ngayAn,
        String buaAn,
        BigDecimal donGia,
        String ghiChu,
        Integer maMonAn) {
}
