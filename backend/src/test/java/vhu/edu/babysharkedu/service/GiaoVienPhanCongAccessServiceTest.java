package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@ExtendWith(MockitoExtension.class)
class GiaoVienPhanCongAccessServiceTest {
    @Mock
    private PhanCongGiaoVienRepository phanCongGiaoVienRepository;

    @Test
    void allowsTeacherWithCurrentAssignment() {
        GiaoVienPhanCongAccessService service = new GiaoVienPhanCongAccessService(phanCongGiaoVienRepository);
        Authentication authentication = authenticationFor("GIAOVIEN", 31);
        when(phanCongGiaoVienRepository.existsPhanCongHienTaiByTaiKhoanAndLopHoc(
                eq(31), eq(8), any(LocalDateTime.class))).thenReturn(true);

        assertDoesNotThrow(() -> service.requireClassAccess(authentication, 8));
    }

    @Test
    void deniesTeacherWithoutCurrentAssignment() {
        GiaoVienPhanCongAccessService service = new GiaoVienPhanCongAccessService(phanCongGiaoVienRepository);
        Authentication authentication = authenticationFor("GIAOVIEN", 31);
        when(phanCongGiaoVienRepository.existsPhanCongHienTaiByTaiKhoanAndLopHoc(
                eq(31), eq(8), any(LocalDateTime.class))).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> service.requireClassAccess(authentication, 8));
    }

    @Test
    void allowsAdminWithoutTeacherAssignmentLookup() {
        GiaoVienPhanCongAccessService service = new GiaoVienPhanCongAccessService(phanCongGiaoVienRepository);
        Authentication authentication = authenticationFor("ADMIN", 4);

        assertDoesNotThrow(() -> service.requireClassAccess(authentication, 8));
        verify(phanCongGiaoVienRepository, never())
                .existsPhanCongHienTaiByTaiKhoanAndLopHoc(any(), any(), any());
    }

    private Authentication authenticationFor(String role, Integer accountId) {
        TaiKhoanPrincipal principal = mock(TaiKhoanPrincipal.class);
        when(principal.getVaiTro()).thenReturn(role);
        if ("GIAOVIEN".equals(role)) {
            when(principal.getMaTaiKhoan()).thenReturn(accountId);
        }
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        return authentication;
    }
}
