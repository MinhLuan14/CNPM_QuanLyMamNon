package vhu.edu.babysharkedu.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vhu.edu.babysharkedu.model.ChiTietHocPhi;

public interface ChiTietHocPhiRepository extends JpaRepository<ChiTietHocPhi, Integer> {
    List<ChiTietHocPhi> findAllByHocPhiMaHocPhiInOrderByHocPhiMaHocPhiAscMaChiTietHocPhiAsc(
            List<Integer> maHocPhiIds);
}