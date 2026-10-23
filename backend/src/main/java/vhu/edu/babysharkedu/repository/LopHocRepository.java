package vhu.edu.babysharkedu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.LopHoc;

@Repository
public interface LopHocRepository extends JpaRepository<LopHoc, Integer> {
}
