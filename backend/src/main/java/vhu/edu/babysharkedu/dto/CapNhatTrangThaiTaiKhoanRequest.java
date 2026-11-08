package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotNull;

public record CapNhatTrangThaiTaiKhoanRequest(
        @NotNull(message = "Trạng thái tài khoản là bắt buộc.")
        Boolean trangThai) {
}
