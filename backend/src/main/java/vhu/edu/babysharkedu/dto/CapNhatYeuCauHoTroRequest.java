package vhu.edu.babysharkedu.dto;

import jakarta.validation.constraints.NotBlank;
import vhu.edu.babysharkedu.validation.TrimmedSize;

public record CapNhatYeuCauHoTroRequest(
        @NotBlank(message = "Trạng thái yêu cầu hỗ trợ không được để trống.")
        @jakarta.validation.constraints.Pattern(
                regexp = "CHO_XU_LY|DANG_XU_LY|CHO_XAC_MINH|DA_XAC_MINH|DA_GIAI_QUYET|TU_CHOI|DA_HUY",
                message = "Trạng thái yêu cầu hỗ trợ không hợp lệ.")
        String trangThai,
        @TrimmedSize(max = 1000, message = "Ghi chú xử lý không được vượt quá 1000 ký tự.")
        String ghiChuXuLy) {
}
