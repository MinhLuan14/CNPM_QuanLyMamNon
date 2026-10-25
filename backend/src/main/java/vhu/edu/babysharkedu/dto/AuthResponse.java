package vhu.edu.babysharkedu.dto;

public record AuthResponse(
        Integer maTaiKhoan,
        String tenDangNhap,
        String vaiTro,
        boolean mustChangePassword) {
}
