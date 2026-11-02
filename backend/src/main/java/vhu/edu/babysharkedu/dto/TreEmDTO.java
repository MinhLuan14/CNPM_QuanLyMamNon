package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;

public record TreEmDTO(
        Integer maTre,
        String hoTenDemTre,
        String tenTre,
        LocalDate ngayThangNamSinh,
        String noiSinh,
        Integer maLopHoc,
        String tenLopHoc,
        String trangThaiHocTap,
        String anhDaiDien,
        String tenPhuHuynh,
        String quanHePhuHuynh,
        String soDienThoaiPhuHuynh) {

    public TreEmDTO(
            Integer maTre,
            String hoTenDemTre,
            String tenTre,
            LocalDate ngayThangNamSinh,
            String noiSinh,
            Integer maLopHoc,
            String tenLopHoc,
            String trangThaiHocTap,
            String anhDaiDien) {
        this(maTre, hoTenDemTre, tenTre, ngayThangNamSinh, noiSinh, maLopHoc, tenLopHoc, trangThaiHocTap, anhDaiDien, null, null, null);
    }
}
