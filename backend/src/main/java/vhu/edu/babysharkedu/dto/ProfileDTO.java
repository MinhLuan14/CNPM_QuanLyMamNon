package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;
import java.util.List;

public record ProfileDTO(
        String vaiTro,
        Integer maHoSo,
        String tenDangNhap,
        Boolean trangThaiTaiKhoan,
        String hoTen,
        LocalDate ngaySinh,
        String soDienThoai,
        String email,
        String diaChiLH,
        String trinhDoChuyenMon,
        List<PhuHuynhTreDTO> treEm,
        List<PhanCongGiaoVienDTO> phanCong) {
}
