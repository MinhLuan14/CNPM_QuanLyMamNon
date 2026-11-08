package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record DoiTreLienKetRequest(
        @NotNull(message = "Mã trẻ mới là bắt buộc.")
        @Positive(message = "Mã trẻ mới phải là số nguyên dương.")
        Integer maTre,
        @TrimmedSize(max = 100, message = "Quan hệ không được vượt quá 100 ký tự.")
        String quanHe) {
}
