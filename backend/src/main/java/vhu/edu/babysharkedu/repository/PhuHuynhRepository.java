package vhu.edu.babysharkedu.repository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import vhu.edu.babysharkedu.model.PhuHuynh;

@Repository
public interface PhuHuynhRepository extends JpaRepository<PhuHuynh, Integer> {
    boolean existsBySoDienThoai(String soDienThoai);

    boolean existsBySoDienThoaiAndMaPhuHuynhNot(String soDienThoai, Integer maPhuHuynh);

    Optional<PhuHuynh> findBySoDienThoai(String soDienThoai);

    List<PhuHuynh> findAllByEmailIgnoreCase(String email);

    Optional<PhuHuynh> findByTaiKhoanMaTaiKhoan(Integer maTaiKhoan);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select ph from PhuHuynh ph where ph.maPhuHuynh = :maPhuHuynh")
    Optional<PhuHuynh> findWithLockByMaPhuHuynh(@Param("maPhuHuynh") Integer maPhuHuynh);

    List<PhuHuynh> findAllByOrderByMaPhuHuynhAsc();

    List<PhuHuynh> findAllByTaiKhoanIsNullOrderByMaPhuHuynhAsc();
}
