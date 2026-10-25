package vhu.edu.babysharkedu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PHUHUYNH")
@Getter
@Setter
@NoArgsConstructor
public class PhuHuynh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maPhuHuynh")
    private Integer maPhuHuynh;

    @Column(name = "hoTenDemPH", nullable = false, length = 255)
    private String hoTenDemPH;

    @Column(name = "tenPH", nullable = false, length = 100)
    private String tenPH;

    @Column(name = "diaChiLH", nullable = false, length = 255)
    private String diaChiLH;

    @Column(name = "soDienThoai", nullable = false, unique = true, length = 10)
    private String soDienThoai;

    @Column(name = "email", length = 100)
    private String email;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTaiKhoan", nullable = true, unique = true)
    private TaiKhoan taiKhoan;
}
