package vhu.edu.babysharkedu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.HocPhi;

@Repository
public interface HocPhiRepository extends JpaRepository<HocPhi, Integer> {
    boolean existsByTreEmMaTre(Integer maTre);
}
