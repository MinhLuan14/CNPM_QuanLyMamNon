package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;

public record GhiNhanThanhToanRequest(
        BigDecimal soTienThanhToan,
        String phuongThucThanhToan,
        Integer maPhuHuynh,
        String maGiaoDich,
        String noiDung) {
}