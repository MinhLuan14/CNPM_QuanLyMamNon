package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record ThucDonRequest(
        @NotNull(message = "Tuần áp dụng là bắt buộc.")
        @Min(value = 1, message = "Tuần áp dụng phải từ 1 đến 53.")
        @Max(value = 53, message = "Tuần áp dụng phải từ 1 đến 53.")
        Integer tuanApDung,
        @NotNull(message = "Tháng áp dụng là bắt buộc.")
        @Min(value = 1, message = "Tháng áp dụng phải từ 1 đến 12.")
        @Max(value = 12, message = "Tháng áp dụng phải từ 1 đến 12.")
        Integer thangApDung,
        @NotNull(message = "Năm áp dụng là bắt buộc.")
        @Min(value = 2000, message = "Năm áp dụng phải từ 2000 đến 2100.")
        @Max(value = 2100, message = "Năm áp dụng phải từ 2000 đến 2100.")
        Integer namApDung,
        @NotNull(message = "Ngày bắt đầu là bắt buộc.")
        LocalDate ngayBatDau,
        @NotNull(message = "Ngày kết thúc là bắt buộc.")
        LocalDate ngayKetThuc,
        @TrimmedSize(max = 255, message = "Ghi chú không được vượt quá 255 ký tự.")
        String ghiChu,
        Boolean trangThai) {
}
