package vhu.edu.babysharkedu.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.service.TaiKhoanService;

@Service
public class TaiKhoanUserDetailsService implements UserDetailsService {
    private final TaiKhoanRepository taiKhoanRepository;
    private final TaiKhoanService taiKhoanService;

    public TaiKhoanUserDetailsService(TaiKhoanRepository taiKhoanRepository, TaiKhoanService taiKhoanService) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.taiKhoanService = taiKhoanService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return taiKhoanRepository.findByTenDangNhap(username)
                .map(taiKhoan -> new TaiKhoanPrincipal(taiKhoan, taiKhoanService))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản."));
    }
}
