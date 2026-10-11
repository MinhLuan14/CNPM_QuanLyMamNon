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
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TREEM")
@Getter
@Setter
@NoArgsConstructor
public class TreEm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maTre")
    private Integer maTre;

    @Column(name = "hoTenDemTre", nullable = false, length = 255)
    private String hoTenDemTre;

    @Column(name = "tenTre", nullable = false, length = 100)
    private String tenTre;

    @Column(name = "ngayThangNamSinh", nullable = false)
    private LocalDate ngayThangNamSinh;

    @Column(name = "noiSinh", nullable = false, length = 100)
    private String noiSinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maLopHoc", nullable = false)
    private LopHoc lopHoc;
}
