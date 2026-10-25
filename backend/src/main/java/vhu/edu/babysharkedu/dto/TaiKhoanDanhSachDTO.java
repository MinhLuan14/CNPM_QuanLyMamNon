package vhu.edu.babysharkedu.dto;

import java.time.LocalDateTime;

public record TaiKhoanDanhSachDTO(
        Integer maTaiKhoan,
        String tenDangNhap,
        String hoTenChuTaiKhoan,
        String email,
        String vaiTro,
        LocalDateTime lanDangNhapGanNhat,
        Boolean trangThai) {
}
