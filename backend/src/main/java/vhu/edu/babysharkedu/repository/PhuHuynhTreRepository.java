package vhu.edu.babysharkedu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.PhuHuynhTreId;

@Repository
public interface PhuHuynhTreRepository extends JpaRepository<PhuHuynhTre, PhuHuynhTreId> {
    boolean existsByTreEmMaTre(Integer maTre);
}
