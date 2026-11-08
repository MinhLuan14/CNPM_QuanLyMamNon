package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record TaoTaiKhoanPhuHuynhRequest(
        @NotBlank(message = "Họ tên đệm phụ huynh không được để trống.")
        @TrimmedSize(max = 255, message = "Họ tên đệm phụ huynh không được vượt quá 255 ký tự.")
        String hoTenDemPH,
        @NotBlank(message = "Tên phụ huynh không được để trống.")
        @TrimmedSize(max = 100, message = "Tên phụ huynh không được vượt quá 100 ký tự.")
        String tenPH,
        @NotBlank(message = "Địa chỉ liên hệ không được để trống.")
        @TrimmedSize(max = 255, message = "Địa chỉ liên hệ không được vượt quá 255 ký tự.")
        String diaChiLH,
        @NotBlank(message = "Số điện thoại phải gồm đúng 10 chữ số.")
        @Pattern(regexp = "\\s*\\d{10}\\s*", message = "Số điện thoại phải gồm đúng 10 chữ số.")
        String soDienThoai,
        @Pattern(regexp = "\\s*([^@\\s]+@[^@\\s]+\\.[^@\\s]+)?\\s*",
                message = "Email không đúng định dạng.")
        @TrimmedSize(max = 100, message = "Email không được vượt quá 100 ký tự.")
        String email,
        Boolean capTaiKhoan,
        @Positive(message = "Mã trẻ phải là số nguyên dương.")
        Integer maTre,
        @TrimmedSize(max = 100, message = "Quan hệ không được vượt quá 100 ký tự.")
        String quanHe) {
}
