package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TaoHocPhiRequest(
        Integer maTre,
        Integer thangApDung,
        Integer namApDung,
        LocalDate hanThanhToan,
        List<ChiTietRequest> chiTiet) {

    public record ChiTietRequest(
            String loaiPhi,
            Integer soLuong,
            BigDecimal donGia,
            String noiDung) {
    }
}