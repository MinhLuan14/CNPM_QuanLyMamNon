package vhu.edu.babysharkedu.model;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TAIKHOAN_KHOIPHUCHOI_YEUCAU")
@Getter
@Setter
@NoArgsConstructor
public class LuotYeuCauKhoiPhuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maLuot")
    private Long maLuot;

    @Column(name = "emailHash", nullable = false, length = 64)
    private String emailHash;

    @Column(name = "ipHash", nullable = false, length = 64)
    private String ipHash;

    @Column(name = "thoiGianYeuCau", nullable = false)
    private LocalDateTime thoiGianYeuCau;
}
