package vhu.edu.babysharkedu.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PHANCONG_GIAOVIEN")
@Getter
@Setter
@NoArgsConstructor
public class PhanCongGiaoVien {
    @EmbeddedId
    private PhanCongGiaoVienId id;

    @MapsId("maGiaoVien")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maGiaoVien", nullable = false)
    private GiaoVien giaoVien;

    @MapsId("maLopHoc")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maLopHoc", nullable = false)
    private LopHoc lopHoc;

    @Column(name = "ngayBatDau")
    private LocalDateTime ngayBatDau;

    @Column(name = "ngayKetThuc")
    private LocalDateTime ngayKetThuc;

    @Column(name = "vaiTro", length = 100)
    private String vaiTro;
}
