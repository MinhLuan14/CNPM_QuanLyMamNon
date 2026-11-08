package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.LopHoc;
import vhu.edu.babysharkedu.model.PhanCongGiaoVien;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

class GiaoVienThucDonServiceTest {
    private GiaoVienRepository giaoVienRepository;
    private PhanCongGiaoVienRepository phanCongRepository;
    private ThucDonService thucDonService;
    private GiaoVienThucDonService service;

    @BeforeEach
    void setUp() {
        giaoVienRepository = mock(GiaoVienRepository.class);
        phanCongRepository = mock(PhanCongGiaoVienRepository.class);
        thucDonService = mock(ThucDonService.class);
        service = new GiaoVienThucDonService(giaoVienRepository, phanCongRepository, thucDonService);
    }

    @Test
    void returnsPublishedSchoolMenusForCurrentlyAssignedClass() {
        TaiKhoanPrincipal principal = mock(TaiKhoanPrincipal.class);
        GiaoVien teacher = new GiaoVien();
        teacher.setMaGiaoVien(7);
        LopHoc classroom = new LopHoc();
        classroom.setMaLopHoc(12);
        PhanCongGiaoVien assignment = new PhanCongGiaoVien();
        assignment.setLopHoc(classroom);
        assignment.setNgayBatDau(LocalDateTime.now().minusDays(1));
        assignment.setNgayKetThuc(LocalDateTime.now().plusDays(1));
        when(principal.getVaiTro()).thenReturn("GIAOVIEN");
        when(principal.getMaTaiKhoan()).thenReturn(3);
        when(giaoVienRepository.findByTaiKhoanMaTaiKhoan(3)).thenReturn(Optional.of(teacher));
        when(phanCongRepository.findAllByGiaoVienMaGiaoVienOrderByNgayBatDauDesc(7))
                .thenReturn(List.of(assignment));
        when(thucDonService.layTatCaDaCongKhai()).thenReturn(List.of());

        assertEquals(List.of(), service.layTheoLop(principal, 12));
        verify(thucDonService).layTatCaDaCongKhai();
    }

    @Test
    void rejectsClassNotCurrentlyAssignedToTeacher() {
        TaiKhoanPrincipal principal = mock(TaiKhoanPrincipal.class);
        GiaoVien teacher = new GiaoVien();
        teacher.setMaGiaoVien(7);
        when(principal.getVaiTro()).thenReturn("GIAOVIEN");
        when(principal.getMaTaiKhoan()).thenReturn(3);
        when(giaoVienRepository.findByTaiKhoanMaTaiKhoan(3)).thenReturn(Optional.of(teacher));
        when(phanCongRepository.findAllByGiaoVienMaGiaoVienOrderByNgayBatDauDesc(7))
                .thenReturn(List.of());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.layTheoLop(principal, 12));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void rejectsAssignmentThatHasEnded() {
        TaiKhoanPrincipal principal = mock(TaiKhoanPrincipal.class);
        GiaoVien teacher = new GiaoVien();
        teacher.setMaGiaoVien(7);
        LopHoc classroom = new LopHoc();
        classroom.setMaLopHoc(12);
        PhanCongGiaoVien assignment = new PhanCongGiaoVien();
        assignment.setLopHoc(classroom);
        assignment.setNgayKetThuc(LocalDateTime.now().minusSeconds(1));
        when(principal.getVaiTro()).thenReturn("GIAOVIEN");
        when(principal.getMaTaiKhoan()).thenReturn(3);
        when(giaoVienRepository.findByTaiKhoanMaTaiKhoan(3)).thenReturn(Optional.of(teacher));
        when(phanCongRepository.findAllByGiaoVienMaGiaoVienOrderByNgayBatDauDesc(7))
                .thenReturn(List.of(assignment));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.layTheoLop(principal, 12));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void rejectsNonTeacherPrincipal() {
        TaiKhoanPrincipal principal = mock(TaiKhoanPrincipal.class);
        when(principal.getVaiTro()).thenReturn("PHUHUYNH");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.layTheoLop(principal, 12));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }
}
