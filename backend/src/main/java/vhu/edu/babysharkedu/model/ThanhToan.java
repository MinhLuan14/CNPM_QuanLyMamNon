package vhu.edu.babysharkedu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.OneToOne;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "THANHTOAN")
@Getter
@Setter
@NoArgsConstructor
public class ThanhToan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maThanhToan")
    private Integer maThanhToan;

    @Column(name = "soTienThanhToan", precision = 12, scale = 2)
    private BigDecimal soTienThanhToan;

    @Column(name = "phuongThucThanhToan", length = 50)
    private String phuongThucThanhToan;

    @Column(name = "maGiaoDich", length = 100)
    private String maGiaoDich;

    @Column(name = "thoiGianThanhToan")
    private LocalDateTime thoiGianThanhToan;

    @Column(name = "trangThai", length = 30)
    private String trangThai;

    @Column(name = "noiDung", length = 255)
    private String noiDung;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maHocPhi", nullable = false, unique = true)
    private HocPhi hocPhi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maPhuHuynh", nullable = false)
    private PhuHuynh phuHuynh;
}
