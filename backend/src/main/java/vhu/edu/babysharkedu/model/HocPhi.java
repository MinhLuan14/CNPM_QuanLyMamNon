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
@Table(name = "HOCPHI")
@Getter
@Setter
@NoArgsConstructor
public class HocPhi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maHocPhi")
    private Integer maHocPhi;

    @Column(name = "thangApDung", nullable = false)
    private Integer thangApDung;

    @Column(name = "namApDung", nullable = false)
    private Integer namApDung;

    @Column(name = "ngayLap", nullable = false)
    private LocalDateTime ngayLap;

    @Column(name = "hanThanhToan", nullable = false)
    private LocalDateTime hanThanhToan;

    @Column(name = "tongTien", nullable = false, precision = 12, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "trangThai", nullable = false, length = 100)
    private String trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTre", nullable = false)
    private TreEm treEm;
}
