package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;

public record GiaoVienRequest(
        String hoTen,
        LocalDate ngaySinh,
        String soDienThoai,
        String email,
        String diaChiLH,
        String trinhDoChuyenMon,
        Integer maLopHoc,
        String vaiTro,
        Integer maLopHocCu) {
}
