package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.CapNhatPhuHuynhRequest;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;

@ExtendWith(MockitoExtension.class)
class PhuHuynhServiceTest {
    @Mock
    private PhuHuynhRepository phuHuynhRepository;

    @Mock
    private PhuHuynhTreRepository phuHuynhTreRepository;

    private PhuHuynhService service;

    @BeforeEach
    void setUp() {
        service = new PhuHuynhService(phuHuynhRepository, phuHuynhTreRepository);
    }

    @Test
    void capNhatHoSoChiSuaTruongHoSoVaTraThongTinLienKetKhongCoMatKhau() {
        TaiKhoan account = new TaiKhoan();
        account.setMaTaiKhoan(51);
        account.setTenDangNhap("parent51");
        account.setVaiTro("PHUHUYNH");
        account.setTrangThai(false);
        account.setMatKhau("bcrypt-hash");
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(12);
        parent.setTaiKhoan(account);
        when(phuHuynhRepository.findById(12)).thenReturn(Optional.of(parent));
        when(phuHuynhRepository.existsBySoDienThoaiAndMaPhuHuynhNot("0912345678", 12)).thenReturn(false);
        when(phuHuynhTreRepository.findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(12))
                .thenReturn(List.of());
        when(phuHuynhRepository.save(any(PhuHuynh.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.capNhatHoSo(
                12,
                new CapNhatPhuHuynhRequest(
                        "Nguyễn Văn", "Bình", "0912345678", "binh@example.com", "Quận 1"));

        assertEquals("Nguyễn Văn", parent.getHoTenDemPH());
        assertEquals("Bình", parent.getTenPH());
        assertEquals("0912345678", parent.getSoDienThoai());
        assertEquals("Quận 1", parent.getDiaChiLH());
        assertEquals("binh@example.com", parent.getEmail());
        assertEquals("parent51", result.taiKhoan().tenDangNhap());
        assertEquals(false, result.taiKhoan().trangThai());
        assertEquals("PHUHUYNH", result.taiKhoan().vaiTro());
        verify(phuHuynhRepository).save(parent);
    }

    @Test
    void chapNhanEmailTrongKhiTrongVaTuChoiSoDienThoaiTrung() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(12);
        when(phuHuynhRepository.findById(12)).thenReturn(Optional.of(parent));
        when(phuHuynhRepository.existsBySoDienThoaiAndMaPhuHuynhNot("0987654321", 12)).thenReturn(true);

        ResponseStatusException duplicate = assertThrows(
                ResponseStatusException.class,
                () -> service.capNhatHoSo(
                        12, new CapNhatPhuHuynhRequest("Trần Văn", "Nam", "0987654321", "", "Quận 3")));

        assertEquals(HttpStatus.CONFLICT, duplicate.getStatusCode());
        verify(phuHuynhRepository, never()).save(any(PhuHuynh.class));
    }

    @Test
    void luuEmailTrongThanhNull() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(12);
        when(phuHuynhRepository.findById(12)).thenReturn(Optional.of(parent));
        when(phuHuynhRepository.existsBySoDienThoaiAndMaPhuHuynhNot("0987654321", 12)).thenReturn(false);
        when(phuHuynhRepository.save(any(PhuHuynh.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(phuHuynhTreRepository.findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(12))
                .thenReturn(List.of());

        service.capNhatHoSo(
                12, new CapNhatPhuHuynhRequest("Trần Văn", "Nam", "0987654321", "  ", "Quận 3"));

        assertNull(parent.getEmail());
    }

    @Test
    void tuChoiSoDienThoaiSaiDinhDangVaKhongTimThayHoSo() {
        when(phuHuynhRepository.findById(12)).thenReturn(Optional.of(new PhuHuynh()));
        ResponseStatusException invalidPhone = assertThrows(
                ResponseStatusException.class,
                () -> service.capNhatHoSo(
                        12, new CapNhatPhuHuynhRequest("Trần Văn", "Nam", "123", null, "Quận 3")));
        when(phuHuynhRepository.findById(404)).thenReturn(Optional.empty());
        ResponseStatusException missingParent = assertThrows(
                ResponseStatusException.class,
                () -> service.capNhatHoSo(
                        404, new CapNhatPhuHuynhRequest("Trần Văn", "Nam", "0987654321", null, "Quận 3")));

        assertEquals(HttpStatus.BAD_REQUEST, invalidPhone.getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, missingParent.getStatusCode());
        verify(phuHuynhRepository, never()).save(any(PhuHuynh.class));
    }
}
