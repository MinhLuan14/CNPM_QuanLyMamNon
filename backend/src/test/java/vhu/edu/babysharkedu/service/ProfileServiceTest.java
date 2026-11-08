package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.CapNhatProfileRequest;
import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.LopHoc;
import vhu.edu.babysharkedu.model.PhanCongGiaoVien;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {
    @Mock
    private PhuHuynhRepository phuHuynhRepository;
    @Mock
    private PhuHuynhTreRepository phuHuynhTreRepository;
    @Mock
    private GiaoVienRepository giaoVienRepository;
    @Mock
    private PhanCongGiaoVienRepository phanCongGiaoVienRepository;

    private ProfileService service;

    @BeforeEach
    void setUp() {
        service = new ProfileService(
                phuHuynhRepository,
                phuHuynhTreRepository,
                giaoVienRepository,
                phanCongGiaoVienRepository);
    }

    @Test
    void profilePhuHuynhTraVeDuLieuGanVoiTaiKhoanDangDangNhap() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(12);
        parent.setHoTenDemPH("Nguyễn Văn");
        parent.setTenPH("An");
        parent.setSoDienThoai("0912345678");
        parent.setTaiKhoan(account(52, "parent", "PHUHUYNH"));
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(52)).thenReturn(Optional.of(parent));
        when(phuHuynhTreRepository.findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(12)).thenReturn(List.of());

        var result = service.layProfile(principal(52, "PHUHUYNH"));

        assertEquals("parent", result.tenDangNhap());
        assertEquals(12, result.maHoSo());
        assertEquals("Nguyễn Văn An", result.hoTen());
        assertEquals(List.of(), result.treEm());
    }

    @Test
    void menuAccessAllowsOnlyChildrenLinkedToSignedInParent() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(12);
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(52)).thenReturn(Optional.of(parent));
        when(phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(12, 31)).thenReturn(true);
        when(phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(12, 32)).thenReturn(false);

        service.kiemTraTreDuocLienKet(principal(52, "PHUHUYNH"), 31);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.kiemTraTreDuocLienKet(principal(52, "PHUHUYNH"), 32));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void menuAccessRejectsNonParentPrincipal() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.kiemTraTreDuocLienKet(principal(52, "GIAOVIEN"), 31));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void hoSoCacBeChiTraVeTreDaLienKetVaGiaoVienDangPhuTrach() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(12);
        parent.setHoTenDemPH("Nguyễn Văn");
        parent.setTenPH("An");
        parent.setSoDienThoai("0912345678");
        parent.setDiaChiLH("Địa chỉ phụ huynh");
        parent.setEmail("parent@example.com");

        LopHoc classroom = new LopHoc();
        classroom.setMaLopHoc(5);
        classroom.setTenLopHoc("Mầm A");
        TreEm child = new TreEm();
        child.setMaTre(31);
        child.setHoTenDemTre("Trần Minh");
        child.setTenTre("Bình");
        child.setAnhDaiDien("uploads/child/photo.jpg");
        child.setNgayThangNamSinh(LocalDate.of(2022, 8, 17));
        child.setLopHoc(classroom);
        PhuHuynhTre link = new PhuHuynhTre();
        link.setPhuHuynh(parent);
        link.setTreEm(child);
        link.setQuanHe("Bố");

        TreEm unassignedChild = new TreEm();
        unassignedChild.setMaTre(32);
        unassignedChild.setHoTenDemTre("Lê Minh");
        unassignedChild.setTenTre("Chi");
        unassignedChild.setNgayThangNamSinh(LocalDate.of(2023, 3, 10));
        PhuHuynhTre unassignedLink = new PhuHuynhTre();
        unassignedLink.setPhuHuynh(parent);
        unassignedLink.setTreEm(unassignedChild);

        GiaoVien teacher = new GiaoVien();
        teacher.setHoTenDem("Lê Thị");
        teacher.setTenGiaoVien("Mai");
        PhanCongGiaoVien assignment = new PhanCongGiaoVien();
        assignment.setGiaoVien(teacher);

        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(52)).thenReturn(Optional.of(parent));
        when(phuHuynhTreRepository.findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(12))
                .thenReturn(List.of(link, unassignedLink));
        when(phanCongGiaoVienRepository.findPhanCongHienTaiByLopHoc(
                org.mockito.ArgumentMatchers.eq(5), any()))
                .thenReturn(List.of(assignment));

        var result = service.layHoSoCacBe(principal(52, "PHUHUYNH"));

        assertEquals("Nguyễn Văn", result.phuHuynh().hoTenDemPH());
        assertEquals("parent@example.com", result.phuHuynh().email());
        assertEquals(2, result.treEm().size());
        assertEquals(31, result.treEm().get(0).maTre());
        assertEquals("/api/tre-em/31/anh-dai-dien", result.treEm().get(0).avatarUrl());
        assertEquals("Mầm A", result.treEm().get(0).tenLopHoc());
        assertEquals(List.of("Lê Thị Mai"), result.treEm().get(0).giaoVienPhuTrach());
        assertEquals("Bố", result.treEm().get(0).quanHe());
        assertEquals(32, result.treEm().get(1).maTre());
        assertNull(result.treEm().get(1).tenLopHoc());
        assertEquals(List.of(), result.treEm().get(1).giaoVienPhuTrach());
    }

    @Test
    void hoSoCacBeChiDanhChoTaiKhoanPhuHuynh() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.layHoSoCacBe(principal(52, "GIAOVIEN")));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void profileGiaoVienTraVeTaiKhoanVaThongTinSchemaThucTe() {
        GiaoVien teacher = new GiaoVien();
        teacher.setMaGiaoVien(8);
        teacher.setHoTenDem("Trần Thị");
        teacher.setTenGiaoVien("Mai");
        teacher.setSoDienThoai("0987654321");
        teacher.setEmail("mai@example.com");
        teacher.setTaiKhoan(account(53, "teacher", "GIAOVIEN"));
        when(giaoVienRepository.findByTaiKhoanMaTaiKhoan(53)).thenReturn(Optional.of(teacher));
        when(phanCongGiaoVienRepository.findAllByGiaoVienMaGiaoVienOrderByNgayBatDauDesc(8))
                .thenReturn(List.of());

        var result = service.layProfile(principal(53, "GIAOVIEN"));

        assertEquals("GIAOVIEN", result.vaiTro());
        assertEquals("teacher", result.tenDangNhap());
        assertEquals("Trần Thị Mai", result.hoTen());
        assertEquals(List.of(), result.phanCong());
    }

    @Test
    void capNhatProfileKhongChapNhanSoDienThoaiCuaHoSoKhac() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(12);
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(52)).thenReturn(Optional.of(parent));
        when(phuHuynhRepository.existsBySoDienThoaiAndMaPhuHuynhNot("0911111111", 12)).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.capNhatProfile(
                        principal(52, "PHUHUYNH"),
                        new CapNhatProfileRequest("0911111111", null, "Địa chỉ")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(phuHuynhRepository, never()).save(any(PhuHuynh.class));
    }

    private TaiKhoanPrincipal principal(Integer id, String role) {
        return new TaiKhoanPrincipal(account(id, "user", role), new TaiKhoanService(
                org.mockito.Mockito.mock(vhu.edu.babysharkedu.repository.TaiKhoanRepository.class),
                new BCryptPasswordEncoder(),
                org.mockito.Mockito.mock(TaiKhoanCapPhatService.class)));
    }

    private TaiKhoan account(Integer id, String username, String role) {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(id);
        account.setTenDangNhap(username);
        account.setMatKhau("unused");
        account.setVaiTro(role);
        account.setTrangThai(true);
        return account;
    }
}
