package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record MonAnRequest(
        @NotBlank(message = "Tên món ăn không được để trống.")
        @TrimmedSize(max = 100, message = "Tên món ăn không được vượt quá 100 ký tự.")
        String tenMonAn,
        @TrimmedSize(max = 50, message = "Loại món không được vượt quá 50 ký tự.")
        String loaiMon,
        @TrimmedSize(max = 255, message = "Thành phần không được vượt quá 255 ký tự.")
        String thanhPhan,
        @NotNull(message = "Đơn giá là bắt buộc.")
        @DecimalMin(value = "0.00", message = "Đơn giá không được âm.")
        @DecimalMax(value = "9999999999.99", message = "Đơn giá vượt giới hạn cho phép.")
        BigDecimal donGia,
        Boolean trangThai) {
}
