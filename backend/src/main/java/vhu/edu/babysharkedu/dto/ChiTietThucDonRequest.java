package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record ChiTietThucDonRequest(
        @NotNull(message = "Ngày ăn là bắt buộc.")
        LocalDate ngayAn,
        @NotBlank(message = "Bữa ăn không được để trống.")
        @TrimmedSize(max = 30, message = "Tên bữa ăn không được vượt quá 30 ký tự.")
        String buaAn,
        BigDecimal donGia,
        @TrimmedSize(max = 255, message = "Ghi chú không được vượt quá 255 ký tự.")
        String ghiChu,
        @NotNull(message = "Mã món ăn là bắt buộc.")
        @Positive(message = "Mã món ăn phải là số nguyên dương.")
        Integer maMonAn) {
}
