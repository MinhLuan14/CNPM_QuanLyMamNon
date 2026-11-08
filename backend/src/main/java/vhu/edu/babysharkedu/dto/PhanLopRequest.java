package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PhanLopRequest(
        @NotNull(message = "Mã lớp học là bắt buộc.")
        @Positive(message = "Mã lớp học phải là số nguyên dương.")
        Integer maLopHoc) {
}
