package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PhanCongGiaoVienRequest(
        @NotNull(message = "Mã lớp học là bắt buộc.")
        @Positive(message = "Mã lớp học phải là số nguyên dương.")
        Integer maLopHoc,
        @NotBlank(message = "Vai trò phân công không được để trống.")
        @Pattern(regexp = "\\s*(Giáo viên chủ nhiệm|Giáo viên phó / phụ trách|Giáo viên năng khiếu|Tổ trưởng chuyên môn|Giáo viên hỗ trợ)\\s*",
                message = "Vai trò phân công không hợp lệ.")
        String vaiTro) {
}
