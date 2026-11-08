package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record GhiNhanThanhToanRequest(
        @NotNull(message = "Số tiền thanh toán là bắt buộc.")
        @DecimalMin(value = "0.01", message = "Số tiền thanh toán phải lớn hơn 0.")
        @DecimalMax(value = "9999999999.99", message = "Số tiền thanh toán vượt giới hạn cho phép.")
        BigDecimal soTienThanhToan,
        @NotBlank(message = "Phương thức thanh toán không được để trống.")
        @TrimmedSize(max = 50, message = "Phương thức thanh toán không được vượt quá 50 ký tự.")
        String phuongThucThanhToan,
        @NotNull(message = "Mã phụ huynh là bắt buộc.")
        @Positive(message = "Mã phụ huynh phải là số nguyên dương.")
        Integer maPhuHuynh,
        @TrimmedSize(max = 100, message = "Mã giao dịch không được vượt quá 100 ký tự.")
        String maGiaoDich,
        @TrimmedSize(max = 255, message = "Nội dung thanh toán không được vượt quá 255 ký tự.")
        String noiDung) {
}