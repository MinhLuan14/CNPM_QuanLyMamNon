package vhu.edu.babysharkedu.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.GiaoVien;

@Repository
public interface GiaoVienRepository extends JpaRepository<GiaoVien, Integer> {
    Optional<GiaoVien> findByTaiKhoanMaTaiKhoan(Integer maTaiKhoan);
    Optional<GiaoVien> findBySoDienThoai(String soDienThoai);
    List<GiaoVien> findAllByEmailIgnoreCase(String email);

    boolean existsBySoDienThoai(String soDienThoai);

    boolean existsBySoDienThoaiAndMaGiaoVienNot(String soDienThoai, Integer maGiaoVien);

    boolean existsByAnhDaiDien(String anhDaiDien);

    @Query(value = """
            SELECT
                gv.maGiaoVien AS maGiaoVien,
                gv.hoTenDem AS hoTenDem,
                gv.tenGiaoVien AS tenGiaoVien,
                gv.ngaySinh AS ngaySinh,
                gv.soDienThoai AS soDienThoai,
                gv.diaChiLH AS diaChiLH,
                gv.email AS email,
                gv.trinhDoChuyenMon AS trinhDoChuyenMon,
                tk.tenDangNhap AS tenDangNhap,
                tk.trangThai AS trangThaiTaiKhoan,
                pc.maLopHoc AS maLopHoc,
                lh.tenLopHoc AS tenLopHoc,
                pc.vaiTro AS vaiTroPhanCong,
                pc.ngayBatDau AS ngayBatDau,
                pc.ngayKetThuc AS ngayKetThuc
            FROM dbo.GIAOVIEN gv
            INNER JOIN dbo.TAIKHOAN tk ON tk.maTaiKhoan = gv.maTaiKhoan
            LEFT JOIN dbo.PHANCONG_GIAOVIEN pc ON pc.maGiaoVien = gv.maGiaoVien
            LEFT JOIN dbo.LOPHOC lh ON lh.maLopHoc = pc.maLopHoc
            ORDER BY gv.maGiaoVien, pc.ngayBatDau DESC, pc.maLopHoc
            """, nativeQuery = true)
    List<GiaoVienDanhSachProjection> findAllWithAssignments();

    @Query(value = """
            SELECT
                gv.maGiaoVien AS maGiaoVien,
                gv.hoTenDem AS hoTenDem,
                gv.tenGiaoVien AS tenGiaoVien,
                gv.ngaySinh AS ngaySinh,
                gv.soDienThoai AS soDienThoai,
                gv.diaChiLH AS diaChiLH,
                gv.email AS email,
                gv.trinhDoChuyenMon AS trinhDoChuyenMon,
                tk.tenDangNhap AS tenDangNhap,
                tk.trangThai AS trangThaiTaiKhoan,
                pc.maLopHoc AS maLopHoc,
                lh.tenLopHoc AS tenLopHoc,
                pc.vaiTro AS vaiTroPhanCong,
                pc.ngayBatDau AS ngayBatDau,
                pc.ngayKetThuc AS ngayKetThuc
            FROM dbo.GIAOVIEN gv
            INNER JOIN dbo.TAIKHOAN tk ON tk.maTaiKhoan = gv.maTaiKhoan
            LEFT JOIN dbo.PHANCONG_GIAOVIEN pc ON pc.maGiaoVien = gv.maGiaoVien
            LEFT JOIN dbo.LOPHOC lh ON lh.maLopHoc = pc.maLopHoc
            WHERE gv.maGiaoVien = :maGiaoVien
            ORDER BY pc.ngayBatDau DESC, pc.maLopHoc
            """, nativeQuery = true)
    List<GiaoVienDanhSachProjection> findWithAssignmentsByMaGiaoVien(@Param("maGiaoVien") Integer maGiaoVien);
}
