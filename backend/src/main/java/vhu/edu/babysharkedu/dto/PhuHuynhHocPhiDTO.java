package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PhuHuynhHocPhiDTO(
        Integer maHocPhi,
        Integer thangApDung,
        Integer namApDung,
        LocalDateTime hanThanhToan,
        BigDecimal tongTien,
        BigDecimal daThanhToan,
        BigDecimal conLai,
        String trangThai,
        boolean daCoGiaoDich,
        Integer maTre,
        String hoTenTre,
        String tenLopHoc,
        List<ChiTietDTO> chiTiet) {

    public record ChiTietDTO(
            Integer maChiTietHocPhi,
            String loaiPhi,
            String noiDung,
            BigDecimal thanhTien) {
    }
}
