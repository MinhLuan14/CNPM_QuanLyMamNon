package vhu.edu.babysharkedu.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.YeuCauHoTroTaiKhoan;

@Repository
public interface YeuCauHoTroTaiKhoanRepository extends JpaRepository<YeuCauHoTroTaiKhoan, Integer> {
    long countBySoDienThoaiAndThoiGianTaoAfter(String soDienThoai, LocalDateTime thoiGian);

    List<YeuCauHoTroTaiKhoan> findAllByOrderByThoiGianTaoDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select yc from YeuCauHoTroTaiKhoan yc where yc.maYeuCau = :maYeuCau")
    Optional<YeuCauHoTroTaiKhoan> findWithLockByMaYeuCau(@Param("maYeuCau") Integer maYeuCau);
}
