package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;
import java.util.List;

public record HoSoTreDTO(
        Integer maTre,
        String hoTenDemTre,
        String tenTre,
        String avatarUrl,
        LocalDate ngayThangNamSinh,
        String tenLopHoc,
        List<String> giaoVienPhuTrach,
        String quanHe) {
}
