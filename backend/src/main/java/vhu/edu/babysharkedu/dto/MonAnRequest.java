package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;

public record MonAnRequest(
        String tenMonAn,
        String loaiMon,
        String thanhPhan,
        BigDecimal donGia,
        Boolean trangThai) {
}
