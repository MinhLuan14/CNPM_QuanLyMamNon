package vhu.edu.babysharkedu.config;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

final class MustChangePasswordFilter extends OncePerRequestFilter {
    private final TaiKhoanRepository taiKhoanRepository;

    MustChangePasswordFilter(TaiKhoanRepository taiKhoanRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (request.getRequestURI().startsWith("/api/")
                && authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof TaiKhoanPrincipal principal) {
            TaiKhoan account = taiKhoanRepository.findById(principal.getMaTaiKhoan()).orElse(null);
            if (account == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            boolean mustChangePassword = Boolean.TRUE.equals(account.getMustChangePassword());
            principal.setMustChangePassword(mustChangePassword);
            if (mustChangePassword && !isAllowedWhilePasswordChangeRequired(request)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write(
                        "{\"message\":\"Bạn phải đổi mật khẩu tạm thời trước khi sử dụng hệ thống.\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean isAllowedWhilePasswordChangeRequired(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        return ("POST".equals(method)
                        && ("/api/auth/change-password".equals(path) || "/api/auth/logout".equals(path)))
                || ("GET".equals(method)
                        && ("/api/auth/me".equals(path) || "/api/auth/csrf".equals(path)));
    }
}
