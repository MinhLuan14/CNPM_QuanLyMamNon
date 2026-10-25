package vhu.edu.babysharkedu.dto;

public record PhuHuynhCapTaiKhoanDTO(
        Integer maPhuHuynh,
        Integer maTaiKhoan,
        String tenDangNhap,
        String vaiTro,
        Boolean trangThai,
        boolean coTaiKhoan,
        String matKhauTamThoi) {
}
