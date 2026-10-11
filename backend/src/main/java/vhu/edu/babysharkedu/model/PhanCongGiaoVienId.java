package vhu.edu.babysharkedu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class PhanCongGiaoVienId implements Serializable {
    @Column(name = "maGiaoVien")
    private Integer maGiaoVien;

    @Column(name = "maLopHoc")
    private Integer maLopHoc;
}
