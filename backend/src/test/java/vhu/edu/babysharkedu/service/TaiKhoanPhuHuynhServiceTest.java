package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.inOrder;

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

import vhu.edu.babysharkedu.dto.TaoTaiKhoanPhuHuynhRequest;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;

@ExtendWith(MockitoExtension.class)
class TaiKhoanPhuHuynhServiceTest {
    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @Mock
    private PhuHuynhRepository phuHuynhRepository;

    @Mock
    private TreEmRepository treEmRepository;

    @Mock
    private PhuHuynhTreRepository phuHuynhTreRepository;

    private BCryptPasswordEncoder passwordEncoder;
    private TaiKhoanPhuHuynhService service;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        service = new TaiKhoanPhuHuynhService(
                taiKhoanRepository,
                phuHuynhRepository,
                treEmRepository,
                phuHuynhTreRepository,
                new TaiKhoanCapPhatService(taiKhoanRepository, passwordEncoder));
    }

    @Test
    void taoTaiKhoanVaHoSoSinhTenDangNhapTiengVietVaMatKhauBcrypt() {
        when(phuHuynhRepository.existsBySoDienThoai("0912345678")).thenReturn(false);
        when(taiKhoanRepository.existsByTenDangNhapIgnoreCase("nguyenvanminh0912345678")).thenReturn(false);
        when(taiKhoanRepository.save(any(TaiKhoan.class))).thenAnswer(invocation -> {
            TaiKhoan account = invocation.getArgument(0);
            account.setMaTaiKhoan(52);
            return account;
        });
        when(phuHuynhRepository.saveAndFlush(any(PhuHuynh.class))).thenAnswer(invocation -> {
            PhuHuynh parent = invocation.getArgument(0);
            parent.setMaPhuHuynh(12);
            return parent;
        });

        var response = service.taoHoSo(
                new TaoTaiKhoanPhuHuynhRequest(
                        "Nguyễn Văn", "Minh", "Hà Nội", "0912345678", null, true, null, null),
                false);

        assertEquals("PHUHUYNH", response.vaiTro());
        assertEquals("nguyenvanminh0912345678", response.tenDangNhap());
        assertEquals(12, response.maPhuHuynh());
        assertEquals(52, response.maTaiKhoan());
        assertTrue(response.matKhauTamThoi().length() >= 12);
        ArgumentCaptor<TaiKhoan> accountCaptor = ArgumentCaptor.forClass(TaiKhoan.class);
        verify(taiKhoanRepository).save(accountCaptor.capture());
        TaiKhoan savedAccount = accountCaptor.getValue();
        assertEquals("PHUHUYNH", savedAccount.getVaiTro());
        assertNotNull(savedAccount.getMatKhau());
        assertFalse(savedAccount.getMatKhau().equals(response.matKhauTamThoi()));
        assertTrue(passwordEncoder.matches(response.matKhauTamThoi(), savedAccount.getMatKhau()));

        ArgumentCaptor<PhuHuynh> parentCaptor = ArgumentCaptor.forClass(PhuHuynh.class);
        verify(phuHuynhRepository).saveAndFlush(parentCaptor.capture());
        assertEquals(savedAccount, parentCaptor.getValue().getTaiKhoan());
        var orderedOperations = inOrder(taiKhoanRepository, phuHuynhRepository);
        orderedOperations.verify(taiKhoanRepository).save(any(TaiKhoan.class));
        orderedOperations.verify(phuHuynhRepository).saveAndFlush(any(PhuHuynh.class));

        when(taiKhoanRepository.findByTenDangNhap(savedAccount.getTenDangNhap()))
                .thenReturn(Optional.of(savedAccount));
        TaiKhoanService loginService = new TaiKhoanService(
                taiKhoanRepository,
                passwordEncoder,
                new TaiKhoanCapPhatService(taiKhoanRepository, passwordEncoder));
        assertEquals(
                "PHUHUYNH",
                loginService.dangNhap(savedAccount.getTenDangNhap(), response.matKhauTamThoi()).getVaiTro());
    }

    @Test
    void tuDongThemHauToKhiTenDangNhapDaTonTaiKhongPhanBietHoaThuong() {
        when(phuHuynhRepository.existsBySoDienThoai("0912345678")).thenReturn(false);
        when(taiKhoanRepository.existsByTenDangNhapIgnoreCase("nguyenvanminh0912345678")).thenReturn(true);
        when(taiKhoanRepository.existsByTenDangNhapIgnoreCase("nguyenvanminh0912345678_1")).thenReturn(false);
        when(taiKhoanRepository.save(any(TaiKhoan.class))).thenAnswer(invocation -> {
            TaiKhoan account = invocation.getArgument(0);
            account.setMaTaiKhoan(52);
            return account;
        });
        when(phuHuynhRepository.saveAndFlush(any(PhuHuynh.class))).thenAnswer(invocation -> {
            PhuHuynh parent = invocation.getArgument(0);
            parent.setMaPhuHuynh(12);
            return parent;
        });

        var response = service.taoHoSo(
                new TaoTaiKhoanPhuHuynhRequest(
                        "Nguyễn Văn", "Minh", "Hà Nội", "0912345678", null, true, null, null),
                false);

        assertEquals("nguyenvanminh0912345678_1", response.tenDangNhap());
    }

    @Test
    void taoHoSoVaTaiKhoanThanhCongLaMotTransactionVaTraMatKhauDungMotLan() {
        when(phuHuynhRepository.existsBySoDienThoai("0912345678")).thenReturn(false);
        when(taiKhoanRepository.existsByTenDangNhapIgnoreCase("nguyenvanbinh0912345678")).thenReturn(false);
        when(taiKhoanRepository.save(any(TaiKhoan.class))).thenAnswer(invocation -> {
            TaiKhoan account = invocation.getArgument(0);
            account.setMaTaiKhoan(5);
            return account;
        });
        when(phuHuynhRepository.saveAndFlush(any(PhuHuynh.class))).thenAnswer(invocation -> {
            PhuHuynh parent = invocation.getArgument(0);
            parent.setMaPhuHuynh(7);
            return parent;
        });

        var result = service.taoHoSo(
                new TaoTaiKhoanPhuHuynhRequest(
                        "Nguyen Van", "Binh", "Ha Noi", "0912345678", null, true, null, null),
                true);

        assertEquals(7, result.maPhuHuynh());
        assertEquals(5, result.maTaiKhoan());
        assertNotNull(result.matKhauTamThoi());
        verify(phuHuynhRepository).saveAndFlush(any(PhuHuynh.class));
    }

    @Test
    void taoHoSoKhongTaiKhoanVaCoLienKetTre() {
        when(phuHuynhRepository.existsBySoDienThoai("0912345678")).thenReturn(false);
        TreEm child = new TreEm();
        child.setMaTre(23);
        when(treEmRepository.findById(23)).thenReturn(Optional.of(child));
        when(phuHuynhRepository.saveAndFlush(any(PhuHuynh.class))).thenAnswer(invocation -> {
            PhuHuynh parent = invocation.getArgument(0);
            parent.setMaPhuHuynh(12);
            return parent;
        });
        when(phuHuynhTreRepository.save(any(PhuHuynhTre.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.taoHoSo(
                new TaoTaiKhoanPhuHuynhRequest(
                        "Nguyễn Văn", "Minh", "Hà Nội", "0912345678", null, false, 23, "Mẹ"),
                false);

        assertFalse(response.coTaiKhoan());
        assertEquals(12, response.maPhuHuynh());
        ArgumentCaptor<PhuHuynh> parentCaptor = ArgumentCaptor.forClass(PhuHuynh.class);
        verify(phuHuynhRepository).saveAndFlush(parentCaptor.capture());
        assertNull(parentCaptor.getValue().getTaiKhoan());
        ArgumentCaptor<PhuHuynhTre> linkCaptor = ArgumentCaptor.forClass(PhuHuynhTre.class);
        verify(phuHuynhTreRepository).save(linkCaptor.capture());
        assertEquals(12, linkCaptor.getValue().getId().getMaPhuHuynh());
        assertEquals(23, linkCaptor.getValue().getId().getMaTre());
        assertEquals("Mẹ", linkCaptor.getValue().getQuanHe());
        verify(taiKhoanRepository, never()).save(any(TaiKhoan.class));
    }

    @Test
    void taoHoSoKhongTaiKhoanVaKhongLienKetTre() {
        when(phuHuynhRepository.existsBySoDienThoai("0912345678")).thenReturn(false);
        when(phuHuynhRepository.saveAndFlush(any(PhuHuynh.class))).thenAnswer(invocation -> {
            PhuHuynh parent = invocation.getArgument(0);
            parent.setMaPhuHuynh(12);
            return parent;
        });

        var response = service.taoHoSo(
                new TaoTaiKhoanPhuHuynhRequest(
                        "Nguyễn Văn", "Minh", "Hà Nội", "0912345678", null, false, null, null),
                false);

        assertFalse(response.coTaiKhoan());
        verify(phuHuynhTreRepository, never()).save(any(PhuHuynhTre.class));
        verify(taiKhoanRepository, never()).save(any(TaiKhoan.class));
    }

    @Test
    void khongTaoTaiKhoanNeuTreDuocChonKhongTonTai() {
        when(phuHuynhRepository.existsBySoDienThoai("0912345678")).thenReturn(false);
        when(treEmRepository.findById(404)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoHoSo(
                        new TaoTaiKhoanPhuHuynhRequest(
                                "Nguyễn Văn", "Minh", "Hà Nội", "0912345678", null, true, 404, "Mẹ"),
                        false));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(taiKhoanRepository, never()).save(any(TaiKhoan.class));
        verify(phuHuynhRepository, never()).saveAndFlush(any(PhuHuynh.class));
    }

    @Test
    void taoHoSoKhongTaiKhoanVanTuChoiTrungSoDienThoai() {
        when(phuHuynhRepository.existsBySoDienThoai("0912345678")).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoHoSo(
                        new TaoTaiKhoanPhuHuynhRequest(
                                "Nguyễn Văn", "Minh", "Hà Nội", "0912345678", null, false, null, null),
                        false));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(phuHuynhRepository, never()).saveAndFlush(any(PhuHuynh.class));
        verify(taiKhoanRepository, never()).save(any(TaiKhoan.class));
    }

    @Test
    void trungSoDienThoaiKhongTaoTaiKhoan() {
        when(phuHuynhRepository.existsBySoDienThoai("0912345678")).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoHoSo(
                        new TaoTaiKhoanPhuHuynhRequest(
                                "Nguyen Van", "Binh", "Ha Noi", "0912345678", null, true, null, null),
                        false));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(taiKhoanRepository, never()).save(any(TaiKhoan.class));
        verify(phuHuynhRepository, never()).saveAndFlush(any(PhuHuynh.class));
    }

    @Test
    void khongTheCapTaiKhoanLanHai() {
        PhuHuynh existingParent = new PhuHuynh();
        existingParent.setMaPhuHuynh(7);
        existingParent.setTaiKhoan(new TaiKhoan());
        when(phuHuynhRepository.findWithLockByMaPhuHuynh(7)).thenReturn(Optional.of(existingParent));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.capTaiKhoan(7));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(taiKhoanRepository, never()).save(any(TaiKhoan.class));
    }

    @Test
    void capTaiKhoanHoSoDaCoKhongTaoHoSoMoi() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(7);
        parent.setHoTenDemPH("Nguyen Van");
        parent.setTenPH("Binh");
        when(phuHuynhRepository.findWithLockByMaPhuHuynh(7)).thenReturn(Optional.of(parent));
        when(taiKhoanRepository.existsByTenDangNhapIgnoreCase("nguyenvanbinh7")).thenReturn(false);
        when(taiKhoanRepository.save(any(TaiKhoan.class))).thenAnswer(invocation -> {
            TaiKhoan account = invocation.getArgument(0);
            account.setMaTaiKhoan(5);
            return account;
        });
        when(phuHuynhRepository.save(any(PhuHuynh.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.capTaiKhoan(7);

        assertEquals(7, response.maPhuHuynh());
        assertEquals(5, response.maTaiKhoan());
        assertEquals("nguyenvanbinh7", response.tenDangNhap());
        assertEquals("PHUHUYNH", response.vaiTro());
        assertTrue(response.trangThai());
        assertNotNull(response.matKhauTamThoi());
        verify(phuHuynhRepository, never()).saveAndFlush(any(PhuHuynh.class));
        verify(phuHuynhRepository).save(parent);
    }

    @Test
    void capTaiKhoanHoSoKhongTonTaiTra404VaKhongTaoTaiKhoan() {
        when(phuHuynhRepository.findWithLockByMaPhuHuynh(404)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.capTaiKhoan(404));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(taiKhoanRepository, never()).save(any(TaiKhoan.class));
    }
}
