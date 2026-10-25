package vhu.edu.babysharkedu.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;
import vhu.edu.babysharkedu.service.TaiKhoanService;

class MustChangePasswordFilterTest {
    private final TaiKhoanRepository taiKhoanRepository = org.mockito.Mockito.mock(TaiKhoanRepository.class);
    private final MustChangePasswordFilter filter = new MustChangePasswordFilter(taiKhoanRepository);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void chặnApiNghiepVuKhiCanDoiMatKhau() throws Exception {
        var principal = principal();
        when(taiKhoanRepository.findById(12)).thenReturn(Optional.of(account(true)));
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockHttpServletRequest request = request("GET", "/api/parents");
        var chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(403, response.getStatus());
        assertNull(chain.getRequest());
        assertTrue(principal.isMustChangePassword());
    }

    @Test
    void choPhepDoiMatKhauVaDangXuatKhiCanDoiMatKhau() throws Exception {
        var principal = principal();
        when(taiKhoanRepository.findById(12)).thenReturn(Optional.of(account(true)));
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockHttpServletRequest request = request("POST", "/api/auth/change-password");
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        assertSame(request, chain.getRequest());
        assertTrue(principal.isMustChangePassword());

        MockHttpServletRequest logoutRequest = request("POST", "/api/auth/logout");
        MockHttpServletResponse logoutResponse = new MockHttpServletResponse();
        MockFilterChain logoutChain = new MockFilterChain();
        filter.doFilter(logoutRequest, logoutResponse, logoutChain);
        assertEquals(200, logoutResponse.getStatus());
        assertSame(logoutRequest, logoutChain.getRequest());
    }

    @Test
    void trangThaiTaiKhoanMoiDuocCapNhatVaoPrincipalVaApiDuocTiepTuc() throws Exception {
        var principal = principal();
        when(taiKhoanRepository.findById(12)).thenReturn(Optional.of(account(false)));
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockHttpServletRequest request = request("GET", "/api/parents");
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        assertSame(request, chain.getRequest());
        assertFalse(principal.isMustChangePassword());
    }

    private MockHttpServletRequest request(String method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRequestURI(path);
        return request;
    }

    private TaiKhoan account(boolean mustChangePassword) {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(12);
        account.setMustChangePassword(mustChangePassword);
        return account;
    }

    private TaiKhoanPrincipal principal() {
        TaiKhoan account = account(false);
        account.setTenDangNhap("parent12");
        account.setVaiTro("PHUHUYNH");
        account.setTrangThai(true);
        return new TaiKhoanPrincipal(account, org.mockito.Mockito.mock(TaiKhoanService.class));
    }

}
