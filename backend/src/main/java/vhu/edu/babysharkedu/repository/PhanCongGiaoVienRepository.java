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
            select case when count(phanCong) > 0 then true else false end
            from PhanCongGiaoVien phanCong
            where phanCong.giaoVien.taiKhoan.maTaiKhoan = :maTaiKhoan
              and phanCong.lopHoc.maLopHoc = :maLopHoc
              and (phanCong.ngayBatDau is null or phanCong.ngayBatDau <= :thoiDiem)
              and (phanCong.ngayKetThuc is null or phanCong.ngayKetThuc > :thoiDiem)
            """)
    boolean existsPhanCongHienTaiByTaiKhoanAndLopHoc(
            @Param("maTaiKhoan") Integer maTaiKhoan,
            @Param("maLopHoc") Integer maLopHoc,
            @Param("thoiDiem") LocalDateTime thoiDiem);

    @Query("""
            select distinct phanCong.lopHoc.maLopHoc
            from PhanCongGiaoVien phanCong
            where phanCong.giaoVien.taiKhoan.maTaiKhoan = :maTaiKhoan
              and (phanCong.ngayBatDau is null or phanCong.ngayBatDau <= :thoiDiem)
              and (phanCong.ngayKetThuc is null or phanCong.ngayKetThuc > :thoiDiem)
            """)
    List<Integer> findMaLopHienTaiByTaiKhoan(
            @Param("maTaiKhoan") Integer maTaiKhoan,
            @Param("thoiDiem") LocalDateTime thoiDiem);

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
