package vhu.edu.babysharkedu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.ChiTietThucDon;

@Repository
public interface ChiTietThucDonRepository extends JpaRepository<ChiTietThucDon, Integer> {
    List<ChiTietThucDon> findAllByThucDonMaThucDonOrderByNgayAnAscBuaAnAscMaChiTietThucDonAsc(
            Integer maThucDon);

    long countByThucDonMaThucDon(Integer maThucDon);

    boolean existsByMonAnMaMonAn(Integer maMonAn);
}
