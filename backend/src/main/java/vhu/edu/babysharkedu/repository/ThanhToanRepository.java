package vhu.edu.babysharkedu.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vhu.edu.babysharkedu.model.ThanhToan;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer> {
    List<ThanhToan> findAllByHocPhiMaHocPhiIn(List<Integer> maHocPhiIds);

    boolean existsByHocPhiMaHocPhi(Integer maHocPhi);

    @Query("SELECT t FROM ThanhToan t JOIN FETCH t.hocPhi h JOIN FETCH h.treEm WHERE t.phuHuynh.maPhuHuynh = :maPhuHuynh ORDER BY t.thoiGianThanhToan DESC")
    List<ThanhToan> findAllByPhuHuynhWithHocPhiAndTreEm(@Param("maPhuHuynh") Integer maPhuHuynh);
}