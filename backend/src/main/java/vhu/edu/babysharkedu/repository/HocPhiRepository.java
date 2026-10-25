package vhu.edu.babysharkedu.repository;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vhu.edu.babysharkedu.model.HocPhi;

public interface HocPhiRepository extends JpaRepository<HocPhi, Integer> {
    boolean existsByTreEmMaTre(Integer maTre);

    @EntityGraph(attributePaths = { "treEm", "treEm.lopHoc" })
    @Query("select hocPhi from HocPhi hocPhi order by hocPhi.namApDung desc, hocPhi.thangApDung desc, hocPhi.maHocPhi desc")
    List<HocPhi> findAllWithTreAndLop();

    @EntityGraph(attributePaths = { "treEm", "treEm.lopHoc" })
    @Query("select hocPhi from HocPhi hocPhi where hocPhi.treEm.maTre in :maTreIds "
            + "order by hocPhi.namApDung desc, hocPhi.thangApDung desc, hocPhi.maHocPhi desc")
    List<HocPhi> findAllWithTreAndLopByTreIds(@Param("maTreIds") List<Integer> maTreIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select hocPhi from HocPhi hocPhi where hocPhi.maHocPhi = :maHocPhi")
    Optional<HocPhi> findWithLockByMaHocPhi(@Param("maHocPhi") Integer maHocPhi);
}
