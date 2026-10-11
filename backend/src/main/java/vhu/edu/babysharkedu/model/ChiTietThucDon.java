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
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "CHITIETTHUCDON")
@Getter
@Setter
@NoArgsConstructor
public class ChiTietThucDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maChiTietThucDon")
    private Integer maChiTietThucDon;

    @Column(name = "ngayAn")
    private LocalDateTime ngayAn;

    @Column(name = "buaAn", length = 30)
    private String buaAn;

    @Column(name = "donGia", precision = 10, scale = 2)
    private BigDecimal donGia;

    @Column(name = "ghiChu", length = 255)
    private String ghiChu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maThucDon", nullable = false)
    private ThucDon thucDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maMonAn", nullable = false)
    private MonAn monAn;
}
