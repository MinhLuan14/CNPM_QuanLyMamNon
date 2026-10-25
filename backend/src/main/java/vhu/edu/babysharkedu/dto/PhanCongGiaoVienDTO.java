package vhu.edu.babysharkedu.dto;

import java.time.LocalDateTime;

public record PhanCongGiaoVienDTO(
        Integer maLopHoc,
        String tenLopHoc,
        String vaiTro,
        LocalDateTime ngayBatDau,
        LocalDateTime ngayKetThuc,
        boolean dangPhuTrach) {
}
