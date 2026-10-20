package vhu.edu.babysharkedu.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vhu.edu.babysharkedu.dto.AuthResponse;
import vhu.edu.babysharkedu.dto.DangNhapRequest;
import vhu.edu.babysharkedu.dto.DoiMatKhauRequest;
import vhu.edu.babysharkedu.dto.MessageResponse;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;
import vhu.edu.babysharkedu.service.TaiKhoanService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final SecurityContextRepository securityContextRepository;
    private final TaiKhoanService taiKhoanService;

    public AuthController(
            SecurityContextRepository securityContextRepository,
            TaiKhoanService taiKhoanService) {
        this.securityContextRepository = securityContextRepository;
        this.taiKhoanService = taiKhoanService;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @PostMapping("/login")
    public AuthResponse dangNhap(
            @RequestBody DangNhapRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        TaiKhoanPrincipal principal = taiKhoanService.dangNhap(request.tenDangNhap(), request.matKhau());
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities());

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return toResponse(principal);
    }

    @GetMapping("/me")
    public AuthResponse dangNhapHienTai(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof TaiKhoanPrincipal principal)) {
            throw new AuthenticationServiceException("Phiên đăng nhập không hợp lệ.");
        }
        return toResponse(principal);
    }

    @PostMapping("/change-password")
    public MessageResponse doiMatKhau(
            @RequestBody DoiMatKhauRequest request,
            Authentication authentication) {
        TaiKhoanPrincipal principal = (TaiKhoanPrincipal) authentication.getPrincipal();
        taiKhoanService.doiMatKhau(
                principal.getMaTaiKhoan(),
                request.matKhauHienTai(),
                request.matKhauMoi());
        return new MessageResponse("Đổi mật khẩu thành công.");
    }

    @PostMapping("/logout")
    public MessageResponse dangXuat(
            HttpServletRequest request,
            HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return new MessageResponse("Đã đăng xuất.");
    }

    private AuthResponse toResponse(TaiKhoanPrincipal principal) {
        return new AuthResponse(principal.getMaTaiKhoan(), principal.getUsername(), principal.getVaiTro());
    }
}
