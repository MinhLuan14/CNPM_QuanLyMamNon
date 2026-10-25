package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.HocPhiRepository;
import vhu.edu.babysharkedu.repository.LopHocRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@ExtendWith(MockitoExtension.class)
class TreEmServiceAuthorizationTest {
    @Mock
    private TreEmRepository treEmRepository;

    @Mock
    private PhuHuynhRepository phuHuynhRepository;

    @Mock
    private PhuHuynhTreRepository phuHuynhTreRepository;

    @Test
    void phuHuynhKhongXemDuocChiTietTreChuaLienKet() {
        LopHocRepository lopHocRepository = mock(LopHocRepository.class);
        HocPhiRepository hocPhiRepository = mock(HocPhiRepository.class);
        TaiKhoanRepository taiKhoanRepository = mock(TaiKhoanRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        TreEmService service = new TreEmService(
                treEmRepository,
                lopHocRepository,
                hocPhiRepository,
                phuHuynhTreRepository,
                phuHuynhRepository);

        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(99);
        account.setVaiTro("PHUHUYNH");
        TaiKhoanPrincipal principal = new TaiKhoanPrincipal(
                account, new TaiKhoanService(
                        taiKhoanRepository,
                        passwordEncoder,
                        new TaiKhoanCapPhatService(taiKhoanRepository, passwordEncoder)));
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        TreEm child = new TreEm();
        child.setMaTre(34);
        when(treEmRepository.findById(34)).thenReturn(Optional.of(child));
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(12);
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(99)).thenReturn(Optional.of(parent));
        when(phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(12, 34)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> service.layChiTiet(34, authentication));
    }
}
