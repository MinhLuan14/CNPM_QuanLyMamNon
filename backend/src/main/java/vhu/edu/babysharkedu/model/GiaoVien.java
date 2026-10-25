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
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "GIAOVIEN")
@Getter
@Setter
@NoArgsConstructor
public class GiaoVien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maGiaoVien")
    private Integer maGiaoVien;

    @Column(name = "hoTenDem", nullable = false, length = 255)
    private String hoTenDem;

    @Column(name = "tenGiaoVien", nullable = false, length = 100)
    private String tenGiaoVien;

    @Column(name = "soDienThoai", nullable = false, unique = true, length = 10)
    private String soDienThoai;

    @Column(name = "diaChiLH", nullable = false, length = 255)
    private String diaChiLH;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "ngaySinh")
    private LocalDate ngaySinh;

    @Column(name = "trinhDoChuyenMon", length = 255)
    private String trinhDoChuyenMon;

    @Column(name = "anhDaiDien", length = 255)
    private String anhDaiDien;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTaiKhoan", nullable = false, unique = true)
    private TaiKhoan taiKhoan;
}
