package vhu.edu.babysharkedu.repository;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vhu.edu.babysharkedu.model.LuotYeuCauKhoiPhuc;

@Repository
public interface LuotYeuCauKhoiPhucRepository extends JpaRepository<LuotYeuCauKhoiPhuc, Long> {
    long countByEmailHashAndThoiGianYeuCauAfter(String emailHash, LocalDateTime after);

    long countByIpHashAndThoiGianYeuCauAfter(String ipHash, LocalDateTime after);

    long deleteByThoiGianYeuCauBefore(LocalDateTime before);
}
