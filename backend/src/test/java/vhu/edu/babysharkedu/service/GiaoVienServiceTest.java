package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.GiaoVienRequest;
import vhu.edu.babysharkedu.dto.PhanCongGiaoVienRequest;
import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.LopHoc;
import vhu.edu.babysharkedu.model.PhanCongGiaoVien;
import vhu.edu.babysharkedu.model.PhanCongGiaoVienId;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.GiaoVienDanhSachProjection;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.LopHocRepository;
import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;

@ExtendWith(MockitoExtension.class)
class GiaoVienServiceTest {
    @Mock
    private GiaoVienRepository giaoVienRepository;

    @Mock
    private LopHocRepository lopHocRepository;

    @Mock
    private PhanCongGiaoVienRepository phanCongGiaoVienRepository;

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    private BCryptPasswordEncoder passwordEncoder;
    private GiaoVienService service;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        service = new GiaoVienService(
                giaoVienRepository,
                lopHocRepository,
                phanCongGiaoVienRepository,
                new TaiKhoanCapPhatService(taiKhoanRepository, passwordEncoder));
    }

    @Test
    void themGiaoVienTaoTaiKhoanBcryptVaTraThongTinKhongCoHash() {
        when(giaoVienRepository.existsBySoDienThoai("0912345678")).thenReturn(false);
        when(taiKhoanRepository.existsByTenDangNhapIgnoreCase("nguyenvanangv5678")).thenReturn(false);
        when(taiKhoanRepository.save(any(TaiKhoan.class))).thenAnswer(invocation -> {
            TaiKhoan account = invocation.getArgument(0);
            account.setMaTaiKhoan(52);
            return account;
        });
        when(giaoVienRepository.saveAndFlush(any(GiaoVien.class))).thenAnswer(invocation -> {
            GiaoVien teacher = invocation.getArgument(0);
            teacher.setMaGiaoVien(12);
            return teacher;
        });
        GiaoVienDanhSachProjection row = teacherRow(12, null);
        when(giaoVienRepository.findWithAssignmentsByMaGiaoVien(12)).thenReturn(List.of(row));

        var response = service.them(validRequest(null, null));

        assertEquals("nguyenvanangv5678", response.tenDangNhap());
        assertEquals(response.tenDangNhap(), response.giaoVien().tenDangNhap());
        assertNotNull(response.matKhauTamThoi());
        ArgumentCaptor<TaiKhoan> accountCaptor = ArgumentCaptor.forClass(TaiKhoan.class);
        verify(taiKhoanRepository).save(accountCaptor.capture());
        TaiKhoan savedAccount = accountCaptor.getValue();
        assertEquals("GIAOVIEN", savedAccount.getVaiTro());
        assertTrue(passwordEncoder.matches(response.matKhauTamThoi(), savedAccount.getMatKhau()));
    }

    @Test
    void tuChoiNgaySinhTuongLaiTruocKhiGhiDuLieu() {
        GiaoVienRequest request = new GiaoVienRequest(
                "Nguyễn Văn An",
                LocalDate.now().plusDays(1),
                "0912345678",
                "an@example.com",
                "Thành phố Hồ Chí Minh",
                null,
                null,
                null,
                null);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.them(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(taiKhoanRepository, never()).save(any());
        verify(giaoVienRepository, never()).saveAndFlush(any());
    }

    @Test
    void tuChoiSoDienThoaiGiaoVienBiTrung() {
        when(giaoVienRepository.existsBySoDienThoai("0912345678")).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.them(validRequest(null, null)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(taiKhoanRepository, never()).save(any());
    }

    @Test
    void taoPhanCongLopDaChonTrongCungTransaction() {
        when(giaoVienRepository.existsBySoDienThoai("0912345678")).thenReturn(false);
        when(taiKhoanRepository.existsByTenDangNhapIgnoreCase("nguyenvanangv5678")).thenReturn(false);
        when(taiKhoanRepository.save(any(TaiKhoan.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(giaoVienRepository.saveAndFlush(any(GiaoVien.class))).thenAnswer(invocation -> {
            GiaoVien teacher = invocation.getArgument(0);
            teacher.setMaGiaoVien(12);
            return teacher;
        });
        when(lopHocRepository.findById(3)).thenReturn(Optional.of(new LopHoc()));
        when(phanCongGiaoVienRepository.save(any(PhanCongGiaoVien.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        GiaoVienDanhSachProjection row = teacherRow(12, 3);
        when(giaoVienRepository.findWithAssignmentsByMaGiaoVien(12)).thenReturn(List.of(row));

        service.them(validRequest(3, "Giáo viên hỗ trợ"));

        ArgumentCaptor<PhanCongGiaoVien> assignmentCaptor = ArgumentCaptor.forClass(PhanCongGiaoVien.class);
        verify(phanCongGiaoVienRepository).save(assignmentCaptor.capture());
        assertEquals(12, assignmentCaptor.getValue().getId().getMaGiaoVien());
        assertEquals(3, assignmentCaptor.getValue().getId().getMaLopHoc());
        assertEquals("Giáo viên hỗ trợ", assignmentCaptor.getValue().getVaiTro());
        assertNotNull(assignmentCaptor.getValue().getNgayBatDau());
    }

    @Test
    void capNhatHoSoKhongThayDoiTaiKhoanHoacPhanCong() {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(52);
        account.setTenDangNhap("giaovien52");
        account.setVaiTro("GIAOVIEN");
        account.setTrangThai(false);
        GiaoVien existing = new GiaoVien();
        existing.setMaGiaoVien(12);
        existing.setHoTenDem("Nguyễn Văn");
        existing.setTenGiaoVien("An");
        existing.setSoDienThoai("0912345678");
        existing.setEmail("an@example.com");
        existing.setDiaChiLH("Địa chỉ cũ");
        existing.setTaiKhoan(account);
        when(giaoVienRepository.findById(12)).thenReturn(Optional.of(existing));
        when(giaoVienRepository.existsBySoDienThoaiAndMaGiaoVienNot("0987654321", 12)).thenReturn(false);
        when(giaoVienRepository.save(existing)).thenReturn(existing);
        GiaoVienDanhSachProjection row = teacherRow(12, null);
        when(giaoVienRepository.findWithAssignmentsByMaGiaoVien(12)).thenReturn(List.of(row));

        service.capNhat(12, new GiaoVienRequest(
                "Trần Thị Bình",
                LocalDate.of(1992, 3, 4),
                "0987654321",
                "binh@example.com",
                "Địa chỉ mới",
                "Cử nhân",
                null,
                null,
                null));

        assertEquals("Trần Thị", existing.getHoTenDem());
        assertEquals("Bình", existing.getTenGiaoVien());
        assertEquals("0987654321", existing.getSoDienThoai());
        assertEquals(account, existing.getTaiKhoan());
        assertFalse(existing.getTaiKhoan().getTrangThai());
        verify(taiKhoanRepository, never()).save(any());
        verify(phanCongGiaoVienRepository, never()).save(any());
    }

    @Test
    void capNhatGiaoVienThemPhanCongLopMoiVaKetThucLopCuTrongCungNghiepVu() {
        GiaoVien existing = existingTeacher();
        PhanCongGiaoVien oldAssignment = assignment(12, 3, "Giáo viên chủ nhiệm");
        when(giaoVienRepository.findById(12)).thenReturn(Optional.of(existing));
        when(giaoVienRepository.existsBySoDienThoaiAndMaGiaoVienNot("0987654321", 12)).thenReturn(false);
        when(giaoVienRepository.save(existing)).thenReturn(existing);
        when(phanCongGiaoVienRepository.findById(assignmentId(12, 3)))
                .thenReturn(Optional.of(oldAssignment));
        when(phanCongGiaoVienRepository.findById(assignmentId(12, 5)))
                .thenReturn(Optional.empty());
        when(lopHocRepository.findById(5)).thenReturn(Optional.of(new LopHoc()));
        when(phanCongGiaoVienRepository.save(any(PhanCongGiaoVien.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        GiaoVienDanhSachProjection row = teacherRow(12, 5);
        when(giaoVienRepository.findWithAssignmentsByMaGiaoVien(12))
                .thenReturn(List.of(row));

        service.capNhat(12, new GiaoVienRequest(
                "Trần Thị Bình",
                LocalDate.of(1992, 3, 4),
                "0987654321",
                "binh@example.com",
                "Địa chỉ mới",
                "Cử nhân",
                5,
                "Giáo viên hỗ trợ",
                3));

        assertNotNull(oldAssignment.getNgayKetThuc());
        ArgumentCaptor<PhanCongGiaoVien> assignmentCaptor = ArgumentCaptor.forClass(PhanCongGiaoVien.class);
        verify(phanCongGiaoVienRepository, org.mockito.Mockito.times(2)).save(assignmentCaptor.capture());
        assertTrue(assignmentCaptor.getAllValues().stream()
                .anyMatch(assignment -> assignment.getId().getMaLopHoc() == 5));
        assertTrue(assignmentCaptor.getAllValues().stream()
                .anyMatch(assignment -> assignment.getId().getMaLopHoc() == 3));
    }

    @Test
    void capNhatThongTinKhongThayDoiLopGiuseNguyenPhanCong() {
        GiaoVien existing = existingTeacher();
        when(giaoVienRepository.findById(12)).thenReturn(Optional.of(existing));
        when(giaoVienRepository.existsBySoDienThoaiAndMaGiaoVienNot("0987654321", 12)).thenReturn(false);
        when(giaoVienRepository.save(existing)).thenReturn(existing);
        when(phanCongGiaoVienRepository.findById(assignmentId(12, 3)))
                .thenReturn(Optional.of(assignment(12, 3, "Giáo viên chủ nhiệm")));
        GiaoVienDanhSachProjection row = teacherRow(12, 3);
        when(giaoVienRepository.findWithAssignmentsByMaGiaoVien(12))
                .thenReturn(List.of(row));

        service.capNhat(12, new GiaoVienRequest(
                "Trần Thị Bình",
                LocalDate.of(1992, 3, 4),
                "0987654321",
                "binh@example.com",
                "Địa chỉ mới",
                "Cử nhân",
                3,
                "Giáo viên chủ nhiệm",
                3));
        verify(phanCongGiaoVienRepository, never()).save(any());
        verify(phanCongGiaoVienRepository, never()).save(any());
    }

    private GiaoVien existingTeacher() {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(52);
        account.setTenDangNhap("giaovien52");
        account.setVaiTro("GIAOVIEN");
        GiaoVien teacher = new GiaoVien();
        teacher.setMaGiaoVien(12);
        teacher.setHoTenDem("Nguyễn Văn");
        teacher.setTenGiaoVien("An");
        teacher.setSoDienThoai("0912345678");
        teacher.setEmail("an@example.com");
        teacher.setDiaChiLH("Địa chỉ cũ");
        teacher.setTaiKhoan(account);
        return teacher;
    }

    private PhanCongGiaoVien assignment(Integer maGiaoVien, Integer maLopHoc, String vaiTro) {
        PhanCongGiaoVien assignment = new PhanCongGiaoVien();
        assignment.setId(assignmentId(maGiaoVien, maLopHoc));
        assignment.setNgayBatDau(LocalDateTime.now().minusDays(2));
        assignment.setVaiTro(vaiTro);
        return assignment;
    }

    private PhanCongGiaoVienId assignmentId(Integer maGiaoVien, Integer maLopHoc) {
        PhanCongGiaoVienId id = new PhanCongGiaoVienId();
        id.setMaGiaoVien(maGiaoVien);
        id.setMaLopHoc(maLopHoc);
        return id;
    }

    private GiaoVienRequest validRequest(Integer maLopHoc, String vaiTro) {
        return new GiaoVienRequest(
                "Nguyễn Văn An",
                LocalDate.of(1990, 1, 1),
                "0912345678",
                "an@example.com",
                "Thành phố Hồ Chí Minh",
                "Cử nhân",
                maLopHoc,
                vaiTro,
                null);
    }

    private GiaoVienDanhSachProjection teacherRow(Integer maGiaoVien, Integer maLopHoc) {
        GiaoVienDanhSachProjection row = mock(GiaoVienDanhSachProjection.class);
        when(row.getMaGiaoVien()).thenReturn(maGiaoVien);
        when(row.getHoTenDem()).thenReturn("Nguyễn Văn");
        when(row.getTenGiaoVien()).thenReturn("An");
        when(row.getSoDienThoai()).thenReturn("0912345678");
        when(row.getEmail()).thenReturn("an@example.com");
        when(row.getDiaChiLH()).thenReturn("Thành phố Hồ Chí Minh");
        when(row.getTenDangNhap()).thenReturn("nguyenvanangv5678");
        when(row.getTrangThaiTaiKhoan()).thenReturn(true);
        when(row.getMaLopHoc()).thenReturn(maLopHoc);
        if (maLopHoc != null) {
            when(row.getTenLopHoc()).thenReturn("Lớp Mầm 1");
            when(row.getVaiTroPhanCong()).thenReturn("Giáo viên hỗ trợ");
        }
        return row;
    }
}
