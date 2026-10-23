package vhu.edu.babysharkedu.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class MaHoaMatKhau {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String matKhau = "12345";
        String matKhauDaMaHoa = encoder.encode(matKhau);

        System.out.println("Mật khẩu gốc: " + matKhau);
        System.out.println("Mật khẩu đã mã hóa: " + matKhauDaMaHoa);
    }
}
