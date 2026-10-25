package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.YeuCauHoTroTaiKhoanRequest;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.YeuCauHoTroTaiKhoan;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.repository.YeuCauHoTroTaiKhoanRepository;

@ExtendWith(MockitoExtension.class)
class YeuCauHoTroTaiKhoanServiceTest {
    @Mock
    private YeuCauHoTroTaiKhoanRepository yeuCauRepository;

    @Mock
    private PhuHuynhRepository phuHuynhRepository;

    @Mock
    private GiaoVienRepository giaoVienRepository;

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @Mock
    private TaiKhoanService taiKhoanService;

    private YeuCauHoTroTaiKhoanService service;

    @BeforeEach
    void setUp() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        taiKhoanService = new TaiKhoanService(
                taiKhoanRepository,
                encoder,
                new TaiKhoanCapPhatService(taiKhoanRepository, encoder));
        service = new YeuCauHoTroTaiKhoanService(
                yeuCauRepository, phuHuynhRepository, giaoVienRepository, taiKhoanRepository, taiKhoanService);
    }

    @Test
    void guiYeuCauKhongTietLoTaiKhoanKhiHoSoKhongKhop() {
        when(yeuCauRepository.countBySoDienThoaiAndThoiGianTaoAfter(
                any(String.class), any())).thenReturn(0L);
        PhuHuynh parent = new PhuHuynh();
        parent.setHoTenDemPH("Nguyễn Văn");
        parent.setTenPH("Minh");
        when(phuHuynhRepository.findBySoDienThoai("0912345678")).thenReturn(Optional.of(parent));

        service.guiYeuCau(
                new YeuCauHoTroTaiKhoanRequest(
                        "Nguyễn Văn An", "0912 345 678", null, "QUEN_TEN_DANG_NHAP", null),
                "127.0.0.1");

        ArgumentCaptor<YeuCauHoTroTaiKhoan> ticketCaptor =
                ArgumentCaptor.forClass(YeuCauHoTroTaiKhoan.class);
        verify(yeuCauRepository).save(ticketCaptor.capture());
        assertNull(ticketCaptor.getValue().getPhuHuynh());
        assertEquals("CHO_XU_LY", ticketCaptor.getValue().getTrangThai());
    }

    @Test
    void gioiHanYeuCauLienTucTheoIp() {
        when(yeuCauRepository.countBySoDienThoaiAndThoiGianTaoAfter(
                any(String.class), any())).thenReturn(0L);

        for (int index = 0; index < 5; index++) {
            service.guiYeuCau(
                    new YeuCauHoTroTaiKhoanRequest(
                            "Nguyễn Văn Minh", "0912345678", null, "QUEN_MAT_KHAU", null),
                    "127.0.0.2");
        }

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.guiYeuCau(
                        new YeuCauHoTroTaiKhoanRequest(
                                "Nguyễn Văn Minh", "0912345678", null, "QUEN_MAT_KHAU", null),
                        "127.0.0.2"));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exception.getStatusCode());
        verify(yeuCauRepository, org.mockito.Mockito.times(5)).save(any(YeuCauHoTroTaiKhoan.class));
    }

    @Test
    void khongCapLaiMatKhauTruocKhiXacMinh() {
        YeuCauHoTroTaiKhoan ticket = new YeuCauHoTroTaiKhoan();
        ticket.setMaYeuCau(19);
        ticket.setTrangThai("CHO_XU_LY");
        ticket.setLoaiYeuCau("QUEN_MAT_KHAU");
        when(yeuCauRepository.findWithLockByMaYeuCau(19)).thenReturn(Optional.of(ticket));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.capLaiMatKhau(19, null));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(taiKhoanRepository, never()).save(any());
    }

    @Test
    void guiYeuCauHoTroGiaoVienLienKetDungHoSoDaDoiChieu() {
        when(yeuCauRepository.countBySoDienThoaiAndThoiGianTaoAfter(
                any(String.class), any())).thenReturn(0L);
        vhu.edu.babysharkedu.model.GiaoVien teacher = new vhu.edu.babysharkedu.model.GiaoVien();
        teacher.setHoTenDem("Nguyễn Văn");
        teacher.setTenGiaoVien("Minh");
        teacher.setSoDienThoai("0912345678");
        when(giaoVienRepository.findBySoDienThoai("0912345678")).thenReturn(Optional.of(teacher));

        service.guiYeuCau(
                new YeuCauHoTroTaiKhoanRequest(
                        "Nguyễn Văn Minh", "0912345678", null, "QUEN_MAT_KHAU", null, "GIAOVIEN"),
                "127.0.0.3");

        ArgumentCaptor<YeuCauHoTroTaiKhoan> ticketCaptor =
                ArgumentCaptor.forClass(YeuCauHoTroTaiKhoan.class);
        verify(yeuCauRepository).save(ticketCaptor.capture());
        assertEquals(teacher, ticketCaptor.getValue().getGiaoVien());
        assertEquals("GIAOVIEN", ticketCaptor.getValue().getLoaiTaiKhoan());
        assertNull(ticketCaptor.getValue().getPhuHuynh());
    }
}
