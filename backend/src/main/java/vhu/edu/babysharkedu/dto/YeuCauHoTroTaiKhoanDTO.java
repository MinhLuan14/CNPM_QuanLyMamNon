package vhu.edu.babysharkedu.dto;

import java.time.LocalDateTime;

public record YeuCauHoTroTaiKhoanDTO(
        Integer maYeuCau,
        Integer maPhuHuynh,
        Integer maGiaoVien,
        String loaiTaiKhoan,
        String hoTen,
        String soDienThoai,
        String email,
        String loaiYeuCau,
        String noiDung,
        String trangThai,
        LocalDateTime thoiGianTao,
        LocalDateTime thoiGianCapNhat,
        String nhanVienXuLy,
        String ghiChuXuLy) {
}
