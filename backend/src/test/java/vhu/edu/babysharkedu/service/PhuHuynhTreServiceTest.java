package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.PhuHuynhTreRequest;
import vhu.edu.babysharkedu.dto.DoiTreLienKetRequest;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.PhuHuynhTreId;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@ExtendWith(MockitoExtension.class)
class PhuHuynhTreServiceTest {
    @Mock
    private PhuHuynhTreRepository phuHuynhTreRepository;

    @Mock
    private PhuHuynhRepository phuHuynhRepository;

    @Mock
    private TreEmRepository treEmRepository;

    private PhuHuynhTreService service;

    @BeforeEach
    void setUp() {
        service = new PhuHuynhTreService(phuHuynhTreRepository, phuHuynhRepository, treEmRepository);
    }

    @Test
    void taoLienKetThanhCong() {
        PhuHuynh parent = parent(10, 20);
        TreEm child = new TreEm();
        child.setMaTre(30);
        child.setHoTenDemTre("Nguyen Van");
        child.setTenTre("An");
        when(phuHuynhRepository.findById(10)).thenReturn(Optional.of(parent));
        when(treEmRepository.findById(30)).thenReturn(Optional.of(child));
        when(phuHuynhTreRepository.existsById(any())).thenReturn(false);
        when(phuHuynhTreRepository.save(any(PhuHuynhTre.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.taoLienKet(new PhuHuynhTreRequest(10, 30, "Mẹ"));

        assertEquals(10, response.maPhuHuynh());
        assertEquals(30, response.maTre());
        assertEquals("Mẹ", response.quanHe());
    }

    @Test
    void khongTaoLienKetKhiHoSoPhuHuynhKhongTonTai() {
        when(phuHuynhRepository.findById(10)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoLienKet(new PhuHuynhTreRequest(10, 30, "Mẹ")));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(treEmRepository, never()).findById(30);
    }

    @Test
    void tuChoiLienKetTrung() {
        when(phuHuynhRepository.findById(10)).thenReturn(Optional.of(parent(10, 20)));
        TreEm child = new TreEm();
        child.setMaTre(30);
        when(treEmRepository.findById(30)).thenReturn(Optional.of(child));
        when(phuHuynhTreRepository.existsById(any())).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoLienKet(new PhuHuynhTreRequest(10, 30, "Mẹ")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(phuHuynhTreRepository, never()).save(any());
    }

    @Test
    void doiTreLienKetThanhCongVaHuyLienKetCu() {
        PhuHuynh parent = parent(10, 20);
        TreEm oldChild = new TreEm();
        oldChild.setMaTre(30);
        TreEm newChild = new TreEm();
        newChild.setMaTre(31);
        newChild.setTenTre("Mai");
        PhuHuynhTre oldLink = new PhuHuynhTre();
        oldLink.setId(id(10, 30));
        oldLink.setPhuHuynh(parent);
        oldLink.setTreEm(oldChild);
        oldLink.setQuanHe("Mẹ");

        when(phuHuynhTreRepository.findById(id(10, 30))).thenReturn(Optional.of(oldLink));
        when(treEmRepository.findById(31)).thenReturn(Optional.of(newChild));
        when(phuHuynhTreRepository.existsById(id(10, 31))).thenReturn(false);
        when(phuHuynhTreRepository.saveAndFlush(any(PhuHuynhTre.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var updated = service.doiTreLienKet(10, 30, new DoiTreLienKetRequest(31, "Bố"));

        assertEquals(10, updated.maPhuHuynh());
        assertEquals(31, updated.maTre());
        assertEquals("Bố", updated.quanHe());
        verify(phuHuynhTreRepository).delete(oldLink);
    }

    @Test
    void khongDoiLienKetNeuTreMoiDaLienKet() {
        PhuHuynhTre oldLink = new PhuHuynhTre();
        oldLink.setId(id(10, 30));
        when(phuHuynhTreRepository.findById(id(10, 30))).thenReturn(Optional.of(oldLink));
        when(treEmRepository.findById(31)).thenReturn(Optional.of(new TreEm()));
        when(phuHuynhTreRepository.existsById(id(10, 31))).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.doiTreLienKet(10, 30, new DoiTreLienKetRequest(31, "Bố")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(phuHuynhTreRepository, never()).saveAndFlush(any());
        verify(phuHuynhTreRepository, never()).delete(any(PhuHuynhTre.class));
    }

    @Test
    void phuHuynhKhongXemDuocLienKetCuaPhuHuynhKhac() {
        var taiKhoanRepository = org.mockito.Mockito.mock(vhu.edu.babysharkedu.repository.TaiKhoanRepository.class);
        var passwordEncoder = org.mockito.Mockito.mock(
                org.springframework.security.crypto.password.PasswordEncoder.class);
        TaiKhoanPrincipal principal = new TaiKhoanPrincipal(parent(11, 99).getTaiKhoan(), new TaiKhoanService(
                taiKhoanRepository,
                passwordEncoder,
                new TaiKhoanCapPhatService(taiKhoanRepository, passwordEncoder)));
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(99)).thenReturn(Optional.of(parent(11, 99)));

        assertThrows(AccessDeniedException.class, () -> service.layTheoPhuHuynh(10, authentication));
    }

    private PhuHuynh parent(Integer id, Integer accountId) {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(accountId);
        account.setVaiTro("PHUHUYNH");
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(id);
        parent.setHoTenDemPH("Nguyen Van");
        parent.setTenPH("Binh");
        parent.setTaiKhoan(account);
        return parent;
    }

    private PhuHuynhTreId id(Integer maPhuHuynh, Integer maTre) {
        PhuHuynhTreId id = new PhuHuynhTreId();
        id.setMaPhuHuynh(maPhuHuynh);
        id.setMaTre(maTre);
        return id;
    }
}
