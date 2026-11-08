package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CapNhatTrangThaiTreRequest(
        @NotBlank(message = "Trạng thái học tập không được để trống.")
        @Pattern(regexp = "\\s*(Đang học|Tạm nghỉ|Đã nghỉ)\\s*",
                message = "Trạng thái phải là Đang học, Tạm nghỉ hoặc Đã nghỉ.")
        String trangThaiHocTap) {
}
