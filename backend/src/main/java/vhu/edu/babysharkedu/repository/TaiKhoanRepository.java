package vhu.edu.babysharkedu.repository;

import java.util.Optional;
import java.util.List;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.TaiKhoan;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    @Query(value = """
            SELECT
                tk.maTaiKhoan AS maTaiKhoan,
                tk.tenDangNhap AS tenDangNhap,
                COALESCE(
                    NULLIF(LTRIM(RTRIM(CONCAT(ph.hoTenDemPH, ' ', ph.tenPH))), ''),
                    NULLIF(LTRIM(RTRIM(CONCAT(gv.hoTenDem, ' ', gv.tenGiaoVien))), ''),
                    N'Chưa liên kết hồ sơ'
                ) AS hoTenChuTaiKhoan,
                COALESCE(ph.email, gv.email) AS email,
                tk.vaiTro AS vaiTro,
                tk.trangThai AS trangThai
            FROM dbo.TAIKHOAN tk
            LEFT JOIN dbo.PHUHUYNH ph ON ph.maTaiKhoan = tk.maTaiKhoan
            LEFT JOIN dbo.GIAOVIEN gv ON gv.maTaiKhoan = tk.maTaiKhoan
            ORDER BY tk.maTaiKhoan
            """, nativeQuery = true)
    List<TaiKhoanDanhSachProjection> findAllForAccountManagement();

    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select tk from TaiKhoan tk where tk.maTaiKhoan = :maTaiKhoan")
    Optional<TaiKhoan> findWithLockByMaTaiKhoan(@Param("maTaiKhoan") Integer maTaiKhoan);

    boolean existsByTenDangNhap(String tenDangNhap);

    boolean existsByTenDangNhapIgnoreCase(String tenDangNhap);
}
