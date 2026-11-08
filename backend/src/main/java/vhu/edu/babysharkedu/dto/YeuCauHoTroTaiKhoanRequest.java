package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record YeuCauHoTroTaiKhoanRequest(
        @NotBlank(message = "Họ tên không được để trống.")
        @TrimmedSize(max = 356, message = "Họ tên không được vượt quá 356 ký tự.")
        String hoTen,
        @NotBlank(message = "Số điện thoại không được để trống.")
        @Pattern(regexp = "(?=(?:[^0-9]*[0-9]){10,15}[^0-9]*$)[0-9\\s()+.\\-]+",
                message = "Số điện thoại phải có từ 10 đến 15 chữ số; chỉ được dùng dấu cách và ký tự +, (, ), ., -.")
        String soDienThoai,
        @Pattern(regexp = "\\s*([^@\\s]+@[^@\\s]+\\.[^@\\s]+)?\\s*",
                message = "Email không đúng định dạng.")
        @TrimmedSize(max = 100, message = "Email không được vượt quá 100 ký tự.")
        String email,
        @NotBlank(message = "Loại yêu cầu không được để trống.")
        @Pattern(regexp = "QUEN_TEN_DANG_NHAP|QUEN_MAT_KHAU|KHONG_DANG_NHAP_DUOC|HO_TRO_KHAC",
                message = "Loại yêu cầu hỗ trợ không hợp lệ.")
        String loaiYeuCau,
        @TrimmedSize(max = 1000, message = "Nội dung yêu cầu không được vượt quá 1000 ký tự.")
        String noiDung,
        @Pattern(regexp = "(?i)\\s*(|PHUHUYNH|GIAOVIEN)\\s*",
                message = "Loại tài khoản phải là PHUHUYNH hoặc GIAOVIEN.")
        String loaiTaiKhoan) {
    public YeuCauHoTroTaiKhoanRequest(
            String hoTen,
            String soDienThoai,
            String email,
            String loaiYeuCau,
            String noiDung) {
        this(hoTen, soDienThoai, email, loaiYeuCau, noiDung, "PHUHUYNH");
    }
}
