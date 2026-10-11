package vhu.edu.babysharkedu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "THUCDON")
@Getter
@Setter
@NoArgsConstructor
public class ThucDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maThucDon")
    private Integer maThucDon;

    @Column(name = "tuanApDung")
    private Integer tuanApDung;

    @Column(name = "thangApDung")
    private Integer thangApDung;

    @Column(name = "namApDung")
    private Integer namApDung;

    @Column(name = "ngayBatDau")
    private LocalDateTime ngayBatDau;

    @Column(name = "ngayKetThuc")
    private LocalDateTime ngayKetThuc;

    @Column(name = "ghiChu", length = 255)
    private String ghiChu;

    @Column(name = "trangThai")
    private Boolean trangThai;
}
