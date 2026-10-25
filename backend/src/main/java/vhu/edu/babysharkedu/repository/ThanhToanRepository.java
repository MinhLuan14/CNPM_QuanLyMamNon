package vhu.edu.babysharkedu.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vhu.edu.babysharkedu.model.ThanhToan;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer> {
    List<ThanhToan> findAllByHocPhiMaHocPhiIn(List<Integer> maHocPhiIds);

    boolean existsByHocPhiMaHocPhi(Integer maHocPhi);
}