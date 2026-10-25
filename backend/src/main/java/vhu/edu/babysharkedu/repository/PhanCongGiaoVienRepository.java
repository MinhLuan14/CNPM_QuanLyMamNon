package vhu.edu.babysharkedu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.PhanCongGiaoVien;
import vhu.edu.babysharkedu.model.PhanCongGiaoVienId;

@Repository
public interface PhanCongGiaoVienRepository extends JpaRepository<PhanCongGiaoVien, PhanCongGiaoVienId> {
    boolean existsByLopHocMaLopHoc(Integer maLopHoc);

    List<PhanCongGiaoVien> findAllByGiaoVienMaGiaoVienOrderByNgayBatDauDesc(Integer maGiaoVien);
}
