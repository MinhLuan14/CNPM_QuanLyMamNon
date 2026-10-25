package vhu.edu.babysharkedu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TAIKHOAN")
@Getter
@Setter
@NoArgsConstructor
public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maTaiKhoan")
    private Integer maTaiKhoan;

    @Column(name = "tenDangNhap", nullable = false, unique = true, length = 50)
    private String tenDangNhap;

    @Column(name = "matKhau", nullable = false, length = 255)
    private String matKhau;

    @Column(name = "vaiTro", nullable = false, length = 50)
    private String vaiTro;

    @Column(name = "trangThai", nullable = false, columnDefinition = "bit default 1")
    private Boolean trangThai = true;

    @Column(name = "mustChangePassword", nullable = false, columnDefinition = "bit default 0")
    private Boolean mustChangePassword = false;
}
