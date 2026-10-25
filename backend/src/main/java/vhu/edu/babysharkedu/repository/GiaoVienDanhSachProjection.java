package vhu.edu.babysharkedu.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface GiaoVienDanhSachProjection {
    Integer getMaGiaoVien();

    String getHoTenDem();

    String getTenGiaoVien();

    LocalDate getNgaySinh();

    String getSoDienThoai();

    String getDiaChiLH();

    String getEmail();

    String getTrinhDoChuyenMon();

    String getTenDangNhap();

    Boolean getTrangThaiTaiKhoan();

    Integer getMaLopHoc();

    String getTenLopHoc();

    String getVaiTroPhanCong();

    LocalDateTime getNgayBatDau();

    LocalDateTime getNgayKetThuc();
}
