package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PhuHuynhThanhToanDTO(
        Integer maThanhToan,
        Integer maHocPhi,
        String thangNamHocPhi,
        Integer maTre,
        String hoTenTre,
        BigDecimal soTienThanhToan,
        String phuongThucThanhToan,
        String maGiaoDich,
        LocalDateTime thoiGianThanhToan,
        String trangThai,
        String noiDung) {
}
