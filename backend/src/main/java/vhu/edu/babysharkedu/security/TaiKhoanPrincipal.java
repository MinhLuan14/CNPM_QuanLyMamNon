package vhu.edu.babysharkedu.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.service.TaiKhoanService;

public class TaiKhoanPrincipal implements UserDetails {
    private final TaiKhoan taiKhoan;
    private final String vaiTro;
    private boolean mustChangePassword;

    public TaiKhoanPrincipal(TaiKhoan taiKhoan, TaiKhoanService taiKhoanService) {
        this.taiKhoan = taiKhoan;
        this.vaiTro = taiKhoanService.chuanHoaVaiTro(taiKhoan.getVaiTro());
        this.mustChangePassword = Boolean.TRUE.equals(taiKhoan.getMustChangePassword());
    }

    public Integer getMaTaiKhoan() {
        return taiKhoan.getMaTaiKhoan();
    }

    public String getVaiTro() {
        return vaiTro;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + vaiTro));
    }

    @Override
    public String getPassword() {
        return taiKhoan.getMatKhau();
    }

    @Override
    public String getUsername() {
        return taiKhoan.getTenDangNhap();
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(taiKhoan.getTrangThai());
    }
}
