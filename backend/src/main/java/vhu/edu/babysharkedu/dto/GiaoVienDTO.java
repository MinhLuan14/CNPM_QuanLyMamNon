package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;
import java.util.List;

public record GiaoVienDTO(
        Integer maGiaoVien,
        String hoTen,
        LocalDate ngaySinh,
        String soDienThoai,
        String email,
        String diaChiLH,
        String trinhDoChuyenMon,
        String tenDangNhap,
        Boolean trangThaiTaiKhoan,
        boolean dangPhanCong,
        List<PhanCongGiaoVienDTO> phanCong,
        String anhDaiDien) {
}
