package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PhuHuynhHocPhiDTO(
        Integer maHocPhi,
        Integer thangApDung,
        Integer namApDung,
        LocalDateTime ngayLap,
        LocalDateTime hanThanhToan,
        BigDecimal tongTien,
        BigDecimal daThanhToan,
        BigDecimal conLai,
        String trangThai,
        boolean daCoGiaoDich,
        Integer maTre,
        String hoTenTre,
        String tenLopHoc,
        List<ChiTietDTO> chiTiet,
        ThanhToanDTO thanhToan) {

    public record ChiTietDTO(
            Integer maChiTietHocPhi,
            String loaiPhi,
            String noiDung,
            Integer soLuong,
            BigDecimal donGia,
            BigDecimal thanhTien) {
    }

    public record ThanhToanDTO(
            Integer maThanhToan,
            BigDecimal soTienThanhToan,
            String phuongThucThanhToan,
            String maGiaoDich,
            LocalDateTime thoiGianThanhToan,
            String trangThai,
            String noiDung) {
    }
}
