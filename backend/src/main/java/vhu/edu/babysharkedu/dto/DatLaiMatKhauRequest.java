package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DatLaiMatKhauRequest(
        @NotBlank(message = "Mã xác nhận không được để trống.")
        String token,
        @NotBlank(message = "Mật khẩu mới không được để trống.")
        @Size(min = 8, max = 72, message = "Mật khẩu mới phải có ít nhất 8 ký tự và tối đa 72 ký tự.")
        String matKhauMoi,
        @NotBlank(message = "Vui lòng xác nhận mật khẩu mới.")
        String xacNhanMatKhauMoi) {
}
