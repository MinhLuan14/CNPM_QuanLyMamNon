package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record KhoiPhucTaiKhoanRequest(
        @NotBlank(message = "Email không được để trống.")
        @Pattern(regexp = "\\s*[^@\\s]+@[^@\\s]+\\.[^@\\s]+\\s*",
                message = "Email không đúng định dạng.")
        @TrimmedSize(max = 100, message = "Email không được vượt quá 100 ký tự.")
        String email,
        @NotBlank(message = "Loại tài khoản không được để trống.")
        @Pattern(regexp = "(?i)\\s*(PHUHUYNH|GIAOVIEN)\\s*",
                message = "Loại tài khoản phải là PHUHUYNH hoặc GIAOVIEN.")
        String loaiTaiKhoan) {
}
