package vhu.edu.babysharkedu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.ThucDon;

@Repository
public interface ThucDonRepository extends JpaRepository<ThucDon, Integer> {
}
