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
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "CHITIETHOCPHI")
@Getter
@Setter
@NoArgsConstructor
public class ChiTietHocPhi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maChiTietHocPhi")
    private Integer maChiTietHocPhi;

    @Column(name = "loaiPhi", length = 50)
    private String loaiPhi;

    @Column(name = "soLuong")
    private Integer soLuong;

    @Column(name = "donGia", precision = 12, scale = 2)
    private BigDecimal donGia;

    @Column(name = "noiDung", length = 255)
    private String noiDung;

    @Column(name = "thanhTien", precision = 12, scale = 2)
    private BigDecimal thanhTien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maHocPhi", nullable = false)
    private HocPhi hocPhi;
}
