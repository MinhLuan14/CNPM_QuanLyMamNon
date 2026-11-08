package vhu.edu.babysharkedu.dto;

import vhu.edu.babysharkedu.validation.TrimmedSize;

public record CapNhatQuanHeRequest(
        @TrimmedSize(max = 100, message = "Quan hệ không được vượt quá 100 ký tự.")
        String quanHe) {
}
