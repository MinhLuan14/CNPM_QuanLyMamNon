package vhu.edu.babysharkedu.dto;

public record DoiMatKhauRequest(String matKhauHienTai, String matKhauMoi, String xacNhanMatKhauMoi) {
    public DoiMatKhauRequest(String matKhauHienTai, String matKhauMoi) {
        this(matKhauHienTai, matKhauMoi, matKhauMoi);
    }
}
