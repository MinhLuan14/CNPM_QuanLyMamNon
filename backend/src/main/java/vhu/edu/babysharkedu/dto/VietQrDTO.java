package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;

public record VietQrDTO(
        String nganHang,
        String soTaiKhoan,
        String tenChuTaiKhoan,
        BigDecimal soTien,
        String noiDungChuyenKhoan,
        String anhQrDataUri) {
}
