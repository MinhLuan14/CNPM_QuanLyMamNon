package vhu.edu.babysharkedu.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PHUHUYNH_TRE")
@Getter
@Setter
@NoArgsConstructor
public class PhuHuynhTre {
    @EmbeddedId
    private PhuHuynhTreId id;

    @MapsId("maPhuHuynh")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maPhuHuynh", nullable = false)
    private PhuHuynh phuHuynh;

    @MapsId("maTre")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTre", nullable = false)
    private TreEm treEm;

    @Column(name = "quanHe", length = 100)
    private String quanHe;
}
