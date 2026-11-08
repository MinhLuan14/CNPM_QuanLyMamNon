package vhu.edu.babysharkedu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.PhanCongGiaoVien;
import vhu.edu.babysharkedu.model.PhanCongGiaoVienId;

@Repository
public interface PhanCongGiaoVienRepository extends JpaRepository<PhanCongGiaoVien, PhanCongGiaoVienId> {
    boolean existsByLopHocMaLopHoc(Integer maLopHoc);

    List<PhanCongGiaoVien> findAllByGiaoVienMaGiaoVienOrderByNgayBatDauDesc(Integer maGiaoVien);

    @Query("""
            select phanCong from PhanCongGiaoVien phanCong
            join fetch phanCong.giaoVien giaoVien
            where phanCong.lopHoc.maLopHoc = :maLopHoc
              and (phanCong.ngayBatDau is null or phanCong.ngayBatDau <= :thoiDiem)
              and (phanCong.ngayKetThuc is null or phanCong.ngayKetThuc > :thoiDiem)
            order by phanCong.vaiTro, giaoVien.hoTenDem, giaoVien.tenGiaoVien
            """)
    List<PhanCongGiaoVien> findPhanCongHienTaiByLopHoc(
            @Param("maLopHoc") Integer maLopHoc,
            @Param("thoiDiem") LocalDateTime thoiDiem);
}
