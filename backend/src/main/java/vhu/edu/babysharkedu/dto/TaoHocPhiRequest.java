package vhu.edu.babysharkedu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record TaoHocPhiRequest(
        @NotNull(message = "Mã trẻ là bắt buộc.")
        @Positive(message = "Mã trẻ phải là số nguyên dương.")
        Integer maTre,
        @NotNull(message = "Tháng áp dụng là bắt buộc.")
        @Min(value = 1, message = "Tháng áp dụng phải từ 1 đến 12.")
        @Max(value = 12, message = "Tháng áp dụng phải từ 1 đến 12.")
        Integer thangApDung,
        @NotNull(message = "Năm áp dụng là bắt buộc.")
        @Min(value = 2000, message = "Năm áp dụng phải từ 2000 đến 2100.")
        @Max(value = 2100, message = "Năm áp dụng phải từ 2000 đến 2100.")
        Integer namApDung,
        @NotNull(message = "Hạn thanh toán là bắt buộc.")
        LocalDate hanThanhToan,
        @NotEmpty(message = "Phiếu thu phải có ít nhất một khoản thu.")
        List<@NotNull(message = "Khoản thu không được để trống.") @Valid ChiTietRequest> chiTiet) {

    public record ChiTietRequest(
            @NotBlank(message = "Loại phí không được để trống.")
            @TrimmedSize(max = 50, message = "Loại phí không được vượt quá 50 ký tự.")
            String loaiPhi,
            @NotNull(message = "Số lượng là bắt buộc.")
            @Positive(message = "Số lượng phải là số nguyên dương.")
            Integer soLuong,
            @NotNull(message = "Đơn giá là bắt buộc.")
            @DecimalMin(value = "0.01", message = "Đơn giá phải lớn hơn 0.")
            @DecimalMax(value = "9999999999.99", message = "Đơn giá vượt giới hạn cho phép.")
            BigDecimal donGia,
            @TrimmedSize(max = 255, message = "Nội dung khoản thu không được vượt quá 255 ký tự.")
            String noiDung) {
    }
}