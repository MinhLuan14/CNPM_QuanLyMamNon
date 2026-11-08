package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;

public record DangNhapRequest(
        @NotBlank(message = "Tên đăng nhập không được để trống.")
        String tenDangNhap,
        @NotBlank(message = "Mật khẩu không được để trống.")
        String matKhau) {
}
