package vhu.edu.babysharkedu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.TreEm;

@Repository
public interface TreEmRepository extends JpaRepository<TreEm, Integer> {
    List<TreEm> findAllByOrderByMaTre();

    List<TreEm> findAllByLopHocMaLopHocOrderByMaTre(Integer maLopHoc);

    List<TreEm> findAllByLopHocIsNullOrderByMaTre();

    List<TreEm> findAllByHoTenDemTreContainingIgnoreCaseOrTenTreContainingIgnoreCaseOrderByMaTre(
            String hoTenDemTre,
            String tenTre);

    List<TreEm> findAllByLopHocMaLopHoc(Integer maLopHoc);

    long countByLopHocMaLopHoc(Integer maLopHoc);

    boolean existsByLopHocMaLopHoc(Integer maLopHoc);
}
