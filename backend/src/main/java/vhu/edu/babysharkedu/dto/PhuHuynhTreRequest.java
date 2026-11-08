package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record PhuHuynhTreRequest(
        @NotNull(message = "Mã phụ huynh là bắt buộc.")
        @Positive(message = "Mã phụ huynh phải là số nguyên dương.")
        Integer maPhuHuynh,
        @NotNull(message = "Mã trẻ là bắt buộc.")
        @Positive(message = "Mã trẻ phải là số nguyên dương.")
        Integer maTre,
        @TrimmedSize(max = 100, message = "Quan hệ không được vượt quá 100 ký tự.")
        String quanHe) {
}
