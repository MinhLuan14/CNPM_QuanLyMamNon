package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record TreEmRequest(
        @NotBlank(message = "Họ tên đệm của trẻ không được để trống.")
        @TrimmedSize(max = 255, message = "Họ tên đệm của trẻ không được vượt quá 255 ký tự.")
        String hoTenDemTre,
        @NotBlank(message = "Tên trẻ không được để trống.")
        @TrimmedSize(max = 100, message = "Tên trẻ không được vượt quá 100 ký tự.")
        String tenTre,
        @NotNull(message = "Ngày sinh của trẻ là bắt buộc.")
        @PastOrPresent(message = "Ngày sinh của trẻ không được ở tương lai.")
        LocalDate ngayThangNamSinh,
        @NotBlank(message = "Nơi sinh không được để trống.")
        @TrimmedSize(max = 100, message = "Nơi sinh không được vượt quá 100 ký tự.")
        String noiSinh,
        @Positive(message = "Mã lớp học phải là số nguyên dương.")
        Integer maLopHoc,
        @Pattern(regexp = "\\s*(Đang học|Tạm nghỉ|Đã nghỉ)\\s*",
                message = "Trạng thái phải là Đang học, Tạm nghỉ hoặc Đã nghỉ.")
        String trangThaiHocTap) {
}
