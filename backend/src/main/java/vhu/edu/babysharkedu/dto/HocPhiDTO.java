package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record HocPhiDTO(
        Integer maHocPhi,
        Integer thangApDung,
        Integer namApDung,
        LocalDateTime ngayLap,
        LocalDateTime hanThanhToan,
        BigDecimal tongTien,
        String trangThai,
        Integer maTre,
        String hoTenTre,
        Integer maLopHoc,
        String tenLopHoc,
        List<ChiTietDTO> chiTiet,
        ThanhToanDTO thanhToan,
        List<PhuHuynhDTO> phuHuynhLienKet) {

    public record ChiTietDTO(
            Integer maChiTietHocPhi,
            String loaiPhi,
            Integer soLuong,
            BigDecimal donGia,
            String noiDung,
            BigDecimal thanhTien) {
    }

    public record ThanhToanDTO(
            Integer maThanhToan,
            BigDecimal soTienThanhToan,
            String phuongThucThanhToan,
            String maGiaoDich,
            LocalDateTime thoiGianThanhToan,
            String trangThai,
            String noiDung,
            Integer maPhuHuynh,
            String hoTenPhuHuynh) {
    }

    public record PhuHuynhDTO(Integer maPhuHuynh, String hoTen, String quanHe) {
    }
}