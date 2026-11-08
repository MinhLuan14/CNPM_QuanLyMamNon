package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record GiaoVienRequest(
        @NotBlank(message = "Họ tên giáo viên không được để trống.")
        @TrimmedSize(max = 356, message = "Họ tên giáo viên không được vượt quá 356 ký tự.")
        String hoTen,
        @PastOrPresent(message = "Ngày sinh giáo viên không được ở tương lai.")
        LocalDate ngaySinh,
        @NotBlank(message = "Số điện thoại phải gồm đúng 10 chữ số.")
        @Pattern(regexp = "\\s*\\d{10}\\s*", message = "Số điện thoại phải gồm đúng 10 chữ số.")
        String soDienThoai,
        @NotBlank(message = "Email giáo viên không được để trống.")
        @Pattern(regexp = "\\s*[^@\\s]+@[^@\\s]+\\.[^@\\s]+\\s*",
                message = "Email không đúng định dạng.")
        @TrimmedSize(max = 100, message = "Email không được vượt quá 100 ký tự.")
        String email,
        @NotBlank(message = "Địa chỉ liên hệ không được để trống.")
        @TrimmedSize(max = 255, message = "Địa chỉ liên hệ không được vượt quá 255 ký tự.")
        String diaChiLH,
        @TrimmedSize(max = 255, message = "Trình độ chuyên môn không được vượt quá 255 ký tự.")
        String trinhDoChuyenMon,
        @Positive(message = "Mã lớp học phải là số nguyên dương.")
        Integer maLopHoc,
        String vaiTro,
        @Positive(message = "Mã lớp học hiện tại phải là số nguyên dương.")
        Integer maLopHocCu) {
}
