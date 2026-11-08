package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotNull;

public record CapNhatTrangThaiMonAnRequest(
        @NotNull(message = "Trạng thái món ăn là bắt buộc.")
        Boolean trangThai) {
}
