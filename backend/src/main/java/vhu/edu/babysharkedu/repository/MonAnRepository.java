package vhu.edu.babysharkedu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vhu.edu.babysharkedu.model.MonAn;

@Repository
public interface MonAnRepository extends JpaRepository<MonAn, Integer> {
    @Query(value = """
            select count(*)
            from dbo.MONAN with (TABLOCKX, HOLDLOCK)
            where lower(ltrim(rtrim(tenMonAn))) = :tenMonAnChuanHoa
            """, nativeQuery = true)
    long demTenMonAnChuanHoa(@Param("tenMonAnChuanHoa") String tenMonAnChuanHoa);

    @Query(value = """
            select count(*)
            from dbo.MONAN with (TABLOCKX, HOLDLOCK)
            where lower(ltrim(rtrim(tenMonAn))) = :tenMonAnChuanHoa
              and maMonAn <> :maMonAn
            """, nativeQuery = true)
    long demTenMonAnChuanHoaKhacMa(
            @Param("tenMonAnChuanHoa") String tenMonAnChuanHoa,
            @Param("maMonAn") Integer maMonAn);

    @Query("""
            select mon from MonAn mon
            where (:keyword is null or lower(mon.tenMonAn) like lower(concat('%', :keyword, '%')))
              and (:loaiMon is null or mon.loaiMon = :loaiMon)
              and (:trangThai is null or mon.trangThai = :trangThai)
            order by mon.tenMonAn, mon.maMonAn
            """)
    List<MonAn> timKiem(
            @Param("keyword") String keyword,
            @Param("loaiMon") String loaiMon,
            @Param("trangThai") Boolean trangThai);
}
