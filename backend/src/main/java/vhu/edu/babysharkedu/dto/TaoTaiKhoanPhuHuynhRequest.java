package vhu.edu.babysharkedu.dto;

public record TaoTaiKhoanPhuHuynhRequest(
        String hoTenDemPH,
        String tenPH,
        String diaChiLH,
        String soDienThoai,
        String email,
        Boolean capTaiKhoan,
        Integer maTre,
        String quanHe) {
}
