package vhu.edu.babysharkedu.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vhu.edu.babysharkedu.model.KhoiPhucMatKhauToken;

@Repository
public interface KhoiPhucMatKhauTokenRepository extends JpaRepository<KhoiPhucMatKhauToken, Long> {
    Optional<KhoiPhucMatKhauToken> findByTokenHash(String tokenHash);

    long deleteByTokenHashIn(List<String> tokenHashes);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from KhoiPhucMatKhauToken token where token.tokenHash = :tokenHash")
    Optional<KhoiPhucMatKhauToken> findWithLockByTokenHash(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("update KhoiPhucMatKhauToken token set token.thoiGianSuDung = :usedAt "
            + "where token.taiKhoan.maTaiKhoan = :maTaiKhoan and token.thoiGianSuDung is null")
    int invalidateUnusedByAccountId(
            @Param("maTaiKhoan") Integer maTaiKhoan,
            @Param("usedAt") LocalDateTime usedAt);

    long deleteByThoiGianHetHanBefore(LocalDateTime expiredBefore);
}
