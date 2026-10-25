package vhu.edu.babysharkedu.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "YEUCAU_HOTRO_TAIKHOAN")
@Getter
@Setter
@NoArgsConstructor
public class YeuCauHoTroTaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maYeuCau")
    private Integer maYeuCau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maPhuHuynh")
    private PhuHuynh phuHuynh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maGiaoVien")
    private GiaoVien giaoVien;

    @Column(name = "hoTen", nullable = false, length = 356)
    private String hoTen;

    @Column(name = "soDienThoai", nullable = false, length = 20)
    private String soDienThoai;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "loaiYeuCau", nullable = false, length = 40)
    private String loaiYeuCau;

    @Column(name = "loaiTaiKhoan", nullable = false, length = 20)
    private String loaiTaiKhoan = "PHUHUYNH";

    @Column(name = "noiDung", length = 1000)
    private String noiDung;

    @Column(name = "trangThai", nullable = false, length = 20)
    private String trangThai;

    @Column(name = "thoiGianTao", nullable = false)
    private LocalDateTime thoiGianTao;

    @Column(name = "thoiGianCapNhat", nullable = false)
    private LocalDateTime thoiGianCapNhat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTaiKhoanXuLy")
    private TaiKhoan nhanVienXuLy;

    @Column(name = "ghiChuXuLy", length = 4000)
    private String ghiChuXuLy;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        thoiGianTao = now;
        thoiGianCapNhat = now;
    }

    @PreUpdate
    void onUpdate() {
        thoiGianCapNhat = LocalDateTime.now();
    }
}
