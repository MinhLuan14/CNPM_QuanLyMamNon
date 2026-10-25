package vhu.edu.babysharkedu.dto;

public record YeuCauHoTroTaiKhoanRequest(
        String hoTen,
        String soDienThoai,
        String email,
        String loaiYeuCau,
        String noiDung,
        String loaiTaiKhoan) {
    public YeuCauHoTroTaiKhoanRequest(
            String hoTen,
            String soDienThoai,
            String email,
            String loaiYeuCau,
            String noiDung) {
        this(hoTen, soDienThoai, email, loaiYeuCau, noiDung, "PHUHUYNH");
    }
}
