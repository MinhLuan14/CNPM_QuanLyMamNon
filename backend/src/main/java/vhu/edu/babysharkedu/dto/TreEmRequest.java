package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;

public record TreEmRequest(
        String hoTenDemTre,
        String tenTre,
        LocalDate ngayThangNamSinh,
        String noiSinh,
        Integer maLopHoc,
        String trangThaiHocTap) {
}
