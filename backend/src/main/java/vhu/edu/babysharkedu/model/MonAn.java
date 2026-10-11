package vhu.edu.babysharkedu.model;

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
@Table(name = "MONAN")
@Getter
@Setter
@NoArgsConstructor
public class MonAn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maMonAn")
    private Integer maMonAn;

    @Column(name = "tenMonAn", length = 100)
    private String tenMonAn;

    @Column(name = "loaiMon", length = 50)
    private String loaiMon;

    @Column(name = "thanhPhan", length = 500)
    private String thanhPhan;

    @Column(name = "trangThai")
    private Boolean trangThai;
}
