package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import vhu.edu.babysharkedu.dto.GhiNhanThanhToanRequest;
import vhu.edu.babysharkedu.dto.VietQrDTO;
import vhu.edu.babysharkedu.dto.TaoHocPhiRequest;
import vhu.edu.babysharkedu.model.HocPhi;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.ThanhToan;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.ChiTietHocPhiRepository;
import vhu.edu.babysharkedu.repository.HocPhiRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.ThanhToanRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

class HocPhiServiceTest {
    private HocPhiRepository hocPhiRepository;
    private ChiTietHocPhiRepository chiTietRepository;
    private ThanhToanRepository thanhToanRepository;
    private TreEmRepository treEmRepository;
    private PhuHuynhRepository phuHuynhRepository;
    private PhuHuynhTreRepository phuHuynhTreRepository;
    private HocPhiService service;
    private VietQrService vietQrService;
    private HocPhi invoice;

    @BeforeEach
    void setUp() {
        hocPhiRepository = mock(HocPhiRepository.class);
        chiTietRepository = mock(ChiTietHocPhiRepository.class);
        thanhToanRepository = mock(ThanhToanRepository.class);
        treEmRepository = mock(TreEmRepository.class);
        phuHuynhRepository = mock(PhuHuynhRepository.class);
        phuHuynhTreRepository = mock(PhuHuynhTreRepository.class);
        vietQrService = mock(VietQrService.class);
        service = new HocPhiService(
                hocPhiRepository,
                chiTietRepository,
                thanhToanRepository,
                treEmRepository,
                phuHuynhRepository,
                phuHuynhTreRepository,
                vietQrService);

        TreEm child = new TreEm();
        child.setMaTre(7);
        invoice = new HocPhi();
        invoice.setMaHocPhi(10);
        invoice.setTongTien(new BigDecimal("1250000.00"));
        invoice.setTreEm(child);
        when(hocPhiRepository.findWithLockByMaHocPhi(10)).thenReturn(Optional.of(invoice));
        when(hocPhiRepository.findById(10)).thenReturn(Optional.of(invoice));
        when(thanhToanRepository.existsByHocPhiMaHocPhi(10)).thenReturn(false);
    }

    @Test
    void rejectsPartialPaymentBecauseSchemaAllowsOnlyOnePaymentPerInvoice() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.ghiNhanThanhToan(10, paymentRequest("500000.00", 4)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(thanhToanRepository, never()).saveAndFlush(any(ThanhToan.class));
    }

    @Test
    void rejectsSecondPaymentForAnInvoice() {
        when(thanhToanRepository.existsByHocPhiMaHocPhi(10)).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.ghiNhanThanhToan(10, paymentRequest("1250000.00", 4)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(phuHuynhTreRepository, never()).existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(4, 7);
    }

    @Test
    void recordsFullPaymentOnlyForLinkedParent() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(4);
        parent.setHoTenDemPH("Nguyễn Văn");
        parent.setTenPH("An");
        when(phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(4, 7)).thenReturn(true);
        when(phuHuynhRepository.findById(4)).thenReturn(Optional.of(parent));
        when(thanhToanRepository.saveAndFlush(any(ThanhToan.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(hocPhiRepository.save(invoice)).thenReturn(invoice);

        service.ghiNhanThanhToan(10, paymentRequest("1250000.00", 4));

        verify(thanhToanRepository).saveAndFlush(any(ThanhToan.class));
        verify(hocPhiRepository).save(invoice);
        assertEquals("Đã thanh toán", invoice.getTrangThai());
    }

    @Test
    void rejectsZeroPaymentBeforeLoadingInvoice() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.ghiNhanThanhToan(10, paymentRequest("0.00", 4)));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(hocPhiRepository, never()).findWithLockByMaHocPhi(10);
    }

    @Test
    void rejectsZeroValueFeeLineBeforeSavingInvoice() {
        TreEm child = new TreEm();
        child.setMaTre(7);
        when(treEmRepository.findById(7)).thenReturn(Optional.of(child));
        TaoHocPhiRequest request = new TaoHocPhiRequest(
                7,
                10,
                2026,
                LocalDate.parse("2026-10-31"),
                java.util.List.of(new TaoHocPhiRequest.ChiTietRequest(
                        "Tiền ăn", 1, BigDecimal.ZERO, null)));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.tao(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(hocPhiRepository, never()).saveAndFlush(any(HocPhi.class));
    }

    @Test
    void createsQrForLinkedParentUsingDatabaseAmountWithoutRecordingPayment() {
        invoice.setMaHocPhi(2);
        invoice.setTongTien(new BigDecimal("2100000.00"));
        invoice.getTreEm().setHoTenDemTre("Phạm Gia");
        invoice.getTreEm().setTenTre("Hân");
        when(hocPhiRepository.findById(2)).thenReturn(Optional.of(invoice));
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(4);
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(91)).thenReturn(Optional.of(parent));
        when(phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(4, 7)).thenReturn(true);
        when(vietQrService.taoMaQr(new BigDecimal("2100000.00"), "HP-2 PHAM GIA HAN"))
                .thenReturn(new VietQrDTO(
                        "MB Bank",
                        "123456789",
                        "BABYSHARK",
                        new BigDecimal("2100000.00"),
                        "HP-2 PHAM GIA HAN",
                        "data:image/png;base64,valid"));

        VietQrDTO result = service.taoQrChoPhuHuynh(2, parentPrincipal(91));

        assertEquals(new BigDecimal("2100000.00"), result.soTien());
        assertTrue(result.noiDungChuyenKhoan().contains("HP-2"));
        verify(vietQrService).taoMaQr(new BigDecimal("2100000.00"), "HP-2 PHAM GIA HAN");
        verify(thanhToanRepository, never()).saveAndFlush(any(ThanhToan.class));
        verify(hocPhiRepository, never()).save(any(HocPhi.class));
    }

    @Test
    void refusesQrWhenInvoiceBelongsToAnotherParent() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(4);
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(91)).thenReturn(Optional.of(parent));
        when(phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(4, 7)).thenReturn(false);

        assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () -> service.taoQrChoPhuHuynh(10, parentPrincipal(91)));

        verify(vietQrService, never()).taoMaQr(any(), any());
    }

    @Test
    void refusesQrForFullyPaidInvoice() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(4);
        invoice.setTrangThai("Đã thanh toán");
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(91)).thenReturn(Optional.of(parent));
        when(phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(4, 7)).thenReturn(true);
        when(thanhToanRepository.findAllByHocPhiMaHocPhiIn(List.of(10))).thenReturn(List.of());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoQrChoPhuHuynh(10, parentPrincipal(91)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(vietQrService, never()).taoMaQr(any(), any());
    }

    @Test
    void returnsNotFoundForMissingInvoice() {
        PhuHuynh parent = new PhuHuynh();
        parent.setMaPhuHuynh(4);
        when(phuHuynhRepository.findByTaiKhoanMaTaiKhoan(91)).thenReturn(Optional.of(parent));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoQrChoPhuHuynh(999, parentPrincipal(91)));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(vietQrService, never()).taoMaQr(any(), any());
    }

    private GhiNhanThanhToanRequest paymentRequest(String amount, Integer parentId) {
        return new GhiNhanThanhToanRequest(
                new BigDecimal(amount),
                "Tiền mặt",
                parentId,
                null,
                null);
    }

    private TaiKhoanPrincipal parentPrincipal(Integer accountId) {
        vhu.edu.babysharkedu.model.TaiKhoan account = new vhu.edu.babysharkedu.model.TaiKhoan();
        account.setMaTaiKhoan(accountId);
        account.setVaiTro("PHUHUYNH");
        vhu.edu.babysharkedu.service.TaiKhoanService accountService =
                mock(vhu.edu.babysharkedu.service.TaiKhoanService.class);
        when(accountService.chuanHoaVaiTro("PHUHUYNH")).thenReturn("PHUHUYNH");
        return new TaiKhoanPrincipal(account, accountService);
    }
}
