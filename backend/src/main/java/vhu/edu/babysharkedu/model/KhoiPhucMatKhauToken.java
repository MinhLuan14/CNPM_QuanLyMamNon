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
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TAIKHOAN_KHOIPHUCHOI")
@Getter
@Setter
@NoArgsConstructor
public class KhoiPhucMatKhauToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maToken")
    private Long maToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTaiKhoan", nullable = false)
    private TaiKhoan taiKhoan;

    @Column(name = "tokenHash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "thoiGianTao", nullable = false)
    private LocalDateTime thoiGianTao;

    @Column(name = "thoiGianHetHan", nullable = false)
    private LocalDateTime thoiGianHetHan;

    @Column(name = "thoiGianSuDung")
    private LocalDateTime thoiGianSuDung;
}
