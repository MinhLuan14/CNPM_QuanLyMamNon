package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record CapNhatProfileRequest(
        @NotBlank(message = "Số điện thoại không được để trống.")
        @Pattern(regexp = "\\s*\\d{10}\\s*", message = "Số điện thoại phải gồm đúng 10 chữ số.")
        String soDienThoai,
        @Pattern(regexp = "\\s*([^@\\s]+@[^@\\s]+\\.[^@\\s]+)?\\s*",
                message = "Email không đúng định dạng.")
        @TrimmedSize(max = 100, message = "Email không được vượt quá 100 ký tự.")
        String email,
        @NotBlank(message = "Địa chỉ liên hệ không được để trống.")
        @TrimmedSize(max = 255, message = "Địa chỉ liên hệ không được vượt quá 255 ký tự.")
        String diaChiLH) {
}
