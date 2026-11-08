package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;

public record KiemTraTenDangNhapRequest(
        @NotBlank(message = "Tên đăng nhập không được để trống.")
        String tenDangNhap) {
}
