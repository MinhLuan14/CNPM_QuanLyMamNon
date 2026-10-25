package vhu.edu.babysharkedu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.PhuHuynhTreId;

public interface PhuHuynhTreRepository extends JpaRepository<PhuHuynhTre, PhuHuynhTreId> {
    boolean existsByTreEmMaTre(Integer maTre);

    boolean existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(Integer maPhuHuynh, Integer maTre);

    List<PhuHuynhTre> findAllByOrderByPhuHuynhMaPhuHuynhAscTreEmMaTreAsc();

    List<PhuHuynhTre> findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(Integer maPhuHuynh);

    List<PhuHuynhTre> findAllByTreEmMaTreOrderByPhuHuynhMaPhuHuynhAsc(Integer maTre);

    @Query("select lienKet from PhuHuynhTre lienKet join fetch lienKet.phuHuynh where lienKet.treEm.maTre in :maTreIds")
    List<PhuHuynhTre> findAllWithPhuHuynhByTreIds(@Param("maTreIds") List<Integer> maTreIds);
}
