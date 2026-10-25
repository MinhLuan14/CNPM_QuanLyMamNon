package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;

public record MonAnDTO(
        Integer maMonAn,
        String tenMonAn,
        String loaiMon,
        String thanhPhan,
        BigDecimal donGia,
        Boolean trangThai) {
}
