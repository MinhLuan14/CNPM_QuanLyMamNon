package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record LopHocRequest(
        @NotBlank(message = "Tên lớp học không được để trống.")
        @TrimmedSize(max = 50, message = "Tên lớp học không được vượt quá 50 ký tự.")
        String tenLopHoc,
        @NotNull(message = "Phòng học là bắt buộc.")
        @Positive(message = "Phòng học phải là số nguyên dương.")
        Integer phongHoc,
        @Positive(message = "Số lượng tối đa phải là số nguyên dương.")
        Integer soLuongToiDa,
        @TrimmedSize(min = 1, max = 20, message = "Độ tuổi không được để trống và tối đa 20 ký tự.")
        String doTuoi) {
}
