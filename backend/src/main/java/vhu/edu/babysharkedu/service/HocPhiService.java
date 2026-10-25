package vhu.edu.babysharkedu.service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vhu.edu.babysharkedu.dto.GhiNhanThanhToanRequest;
import vhu.edu.babysharkedu.dto.HocPhiDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhHocPhiDTO;
import vhu.edu.babysharkedu.dto.TaoHocPhiRequest;
import vhu.edu.babysharkedu.dto.VietQrDTO;
import vhu.edu.babysharkedu.model.ChiTietHocPhi;
import vhu.edu.babysharkedu.model.HocPhi;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.ThanhToan;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.ChiTietHocPhiRepository;
import vhu.edu.babysharkedu.repository.HocPhiRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.ThanhToanRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class HocPhiService {
    private static final BigDecimal MAX_MONEY = new BigDecimal("9999999999.99");
    private static final String PAYMENT_SUCCESS = "Thành công";

    private final HocPhiRepository hocPhiRepository;
    private final ChiTietHocPhiRepository chiTietRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final TreEmRepository treEmRepository;
    private final PhuHuynhRepository phuHuynhRepository;
    private final PhuHuynhTreRepository phuHuynhTreRepository;
    private final VietQrService vietQrService;

    public HocPhiService(
            HocPhiRepository hocPhiRepository,
            ChiTietHocPhiRepository chiTietRepository,
            ThanhToanRepository thanhToanRepository,
            TreEmRepository treEmRepository,
            PhuHuynhRepository phuHuynhRepository,
            PhuHuynhTreRepository phuHuynhTreRepository,
            VietQrService vietQrService) {
        this.hocPhiRepository = hocPhiRepository;
        this.chiTietRepository = chiTietRepository;
        this.thanhToanRepository = thanhToanRepository;
        this.treEmRepository = treEmRepository;
        this.phuHuynhRepository = phuHuynhRepository;
        this.phuHuynhTreRepository = phuHuynhTreRepository;
        this.vietQrService = vietQrService;
    }

    @Transactional(readOnly = true)
    public List<HocPhiDTO> layTatCa() {
        List<HocPhi> invoices = hocPhiRepository.findAllWithTreAndLop();
        if (invoices.isEmpty())
            return List.of();

        List<Integer> invoiceIds = new ArrayList<>();
        for (HocPhi invoice : invoices)
            invoiceIds.add(invoice.getMaHocPhi());
        List<Integer> childIds = invoices.stream().map(invoice -> invoice.getTreEm().getMaTre()).distinct().toList();
        Map<Integer, List<HocPhiDTO.ChiTietDTO>> detailsByInvoice = chiTietRepository
                .findAllByHocPhiMaHocPhiInOrderByHocPhiMaHocPhiAscMaChiTietHocPhiAsc(invoiceIds)
                .stream()
                .collect(Collectors.groupingBy(
                        detail -> detail.getHocPhi().getMaHocPhi(),
                        HashMap::new,
                        Collectors.mapping(this::toChiTietDTO, Collectors.toList())));
        Map<Integer, HocPhiDTO.ThanhToanDTO> paymentsByInvoice = thanhToanRepository
                .findAllByHocPhiMaHocPhiIn(invoiceIds)
                .stream()
                .collect(Collectors.toMap(
                        payment -> payment.getHocPhi().getMaHocPhi(),
                        this::toThanhToanDTO));
        Map<Integer, List<HocPhiDTO.PhuHuynhDTO>> parentsByChild = phuHuynhTreRepository
                .findAllWithPhuHuynhByTreIds(childIds)
                .stream()
                .collect(Collectors.groupingBy(
                        link -> link.getTreEm().getMaTre(),
                        HashMap::new,
                        Collectors.mapping(this::toPhuHuynhDTO, Collectors.toList())));

        return invoices.stream().map(invoice -> toDTO(
                invoice,
                detailsByInvoice.getOrDefault(invoice.getMaHocPhi(), List.of()),
                paymentsByInvoice.get(invoice.getMaHocPhi()),
                parentsByChild.getOrDefault(invoice.getTreEm().getMaTre(), List.of()))).toList();
    }

    @Transactional(readOnly = true)
    public List<PhuHuynhHocPhiDTO> layTheoPhuHuynh(TaiKhoanPrincipal principal) {
        PhuHuynh parent = timPhuHuynh(principal);
        List<Integer> childIds = phuHuynhTreRepository
                .findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(parent.getMaPhuHuynh())
                .stream()
                .map(link -> link.getTreEm().getMaTre())
                .distinct()
                .toList();
        if (childIds.isEmpty()) {
            return List.of();
        }

        List<HocPhi> invoices = hocPhiRepository.findAllWithTreAndLopByTreIds(childIds);
        if (invoices.isEmpty()) {
            return List.of();
        }
        List<Integer> invoiceIds = invoices.stream().map(HocPhi::getMaHocPhi).toList();
        Map<Integer, List<PhuHuynhHocPhiDTO.ChiTietDTO>> detailsByInvoice = chiTietRepository
                .findAllByHocPhiMaHocPhiInOrderByHocPhiMaHocPhiAscMaChiTietHocPhiAsc(invoiceIds)
                .stream()
                .collect(Collectors.groupingBy(
                        detail -> detail.getHocPhi().getMaHocPhi(),
                        HashMap::new,
                        Collectors.mapping(detail -> new PhuHuynhHocPhiDTO.ChiTietDTO(
                                detail.getMaChiTietHocPhi(),
                                detail.getLoaiPhi(),
                                detail.getNoiDung(),
                                detail.getThanhTien()), Collectors.toList())));
        Map<Integer, ThanhToan> paymentsByInvoice = thanhToanRepository
                .findAllByHocPhiMaHocPhiIn(invoiceIds)
                .stream()
                .collect(Collectors.toMap(payment -> payment.getHocPhi().getMaHocPhi(), payment -> payment));

        return invoices.stream().map(invoice -> {
            ThanhToan payment = paymentsByInvoice.get(invoice.getMaHocPhi());
            BigDecimal paidAmount = payment != null && PAYMENT_SUCCESS.equals(payment.getTrangThai())
                    ? payment.getSoTienThanhToan()
                    : BigDecimal.ZERO;
            if (paidAmount == null) {
                paidAmount = BigDecimal.ZERO;
            }
            BigDecimal remainingAmount = invoice.getTongTien().subtract(paidAmount).max(BigDecimal.ZERO);
            TreEm child = invoice.getTreEm();
            return new PhuHuynhHocPhiDTO(
                    invoice.getMaHocPhi(),
                    invoice.getThangApDung(),
                    invoice.getNamApDung(),
                    invoice.getHanThanhToan(),
                    invoice.getTongTien(),
                    paidAmount,
                    remainingAmount,
                    invoice.getTrangThai(),
                    payment != null,
                    child.getMaTre(),
                    (child.getHoTenDemTre() + " " + child.getTenTre()).trim(),
                    child.getLopHoc() == null ? null : child.getLopHoc().getTenLopHoc(),
                    detailsByInvoice.getOrDefault(invoice.getMaHocPhi(), List.of()));
        }).toList();
    }

    @Transactional(readOnly = true)
    public VietQrDTO taoQrChoPhuHuynh(Integer maHocPhi, TaiKhoanPrincipal principal) {
        PhuHuynh parent = timPhuHuynh(principal);
        HocPhi invoice = hocPhiRepository.findById(maHocPhi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiếu thu."));
        Integer childId = invoice.getTreEm().getMaTre();
        if (!phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(
                parent.getMaPhuHuynh(), childId)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập phiếu thu này.");
        }

        List<ThanhToan> recordedPayments = thanhToanRepository.findAllByHocPhiMaHocPhiIn(List.of(maHocPhi));
        BigDecimal paidAmount = recordedPayments.stream()
                .filter(payment -> PAYMENT_SUCCESS.equals(payment.getTrangThai()))
                .map(ThanhToan::getSoTienThanhToan)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingAmount = invoice.getTongTien().subtract(paidAmount).max(BigDecimal.ZERO);
        if (remainingAmount.signum() <= 0 || "Đã thanh toán".equals(invoice.getTrangThai())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phiếu thu đã được thanh toán đầy đủ.");
        }
        if (!recordedPayments.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phiếu thu đã có giao dịch ghi nhận. Vui lòng liên hệ nhà trường để đối chiếu khoản còn lại.");
        }

        return vietQrService.taoMaQr(
                remainingAmount,
                taoNoiDungChuyenKhoan(invoice));
    }

    @Transactional
    public HocPhiDTO tao(TaoHocPhiRequest request) {
        validateInvoiceRequest(request);
        TreEm child = treEmRepository.findById(request.maTre())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy trẻ."));

        List<ChiTietHocPhi> details = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO.setScale(2);
        for (TaoHocPhiRequest.ChiTietRequest item : request.chiTiet()) {
            validateInvoiceLine(item);
            BigDecimal lineTotal = item.donGia().multiply(BigDecimal.valueOf(item.soLuong())).setScale(2);
            if (lineTotal.compareTo(MAX_MONEY) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thành tiền vượt giới hạn lưu trữ.");
            }
            total = total.add(lineTotal);
            ChiTietHocPhi detail = new ChiTietHocPhi();
            detail.setLoaiPhi(item.loaiPhi().trim());
            detail.setSoLuong(item.soLuong());
            detail.setDonGia(item.donGia());
            detail.setNoiDung(item.noiDung() == null || item.noiDung().isBlank() ? null : item.noiDung().trim());
            detail.setThanhTien(lineTotal);
            details.add(detail);
        }
        if (total.compareTo(MAX_MONEY) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tổng hóa đơn vượt giới hạn lưu trữ.");
        }

        HocPhi invoice = new HocPhi();
        invoice.setThangApDung(request.thangApDung());
        invoice.setNamApDung(request.namApDung());
        invoice.setNgayLap(LocalDateTime.now());
        invoice.setHanThanhToan(request.hanThanhToan().atTime(23, 59, 59));
        invoice.setTongTien(total);
        invoice.setTrangThai("Chưa thanh toán");
        invoice.setTreEm(child);
        HocPhi savedInvoice = hocPhiRepository.saveAndFlush(invoice);
        for (ChiTietHocPhi detail : details)
            detail.setHocPhi(savedInvoice);
        chiTietRepository.saveAll(details);

        return layTatCa().stream()
                .filter(saved -> saved.maHocPhi().equals(savedInvoice.getMaHocPhi()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    @Transactional
    public void ghiNhanThanhToan(Integer maHocPhi, GhiNhanThanhToanRequest request) {
        validatePaymentRequest(request);
        HocPhi invoice = hocPhiRepository.findWithLockByMaHocPhi(maHocPhi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiếu thu."));
        if (thanhToanRepository.existsByHocPhiMaHocPhi(maHocPhi)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Phiếu thu đã có giao dịch; không thể ghi nhận thêm lần nữa.");
        }
        if (request.soTienThanhToan().compareTo(invoice.getTongTien()) != 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Schema hiện tại chỉ hỗ trợ một giao dịch cho mỗi phiếu thu; số tiền phải bằng toàn bộ số dư.");
        }
        Integer childId = invoice.getTreEm().getMaTre();
        if (!phuHuynhTreRepository.existsByPhuHuynhMaPhuHuynhAndTreEmMaTre(request.maPhuHuynh(), childId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Phụ huynh được chọn không liên kết với trẻ này.");
        }
        PhuHuynh parent = phuHuynhRepository.findById(request.maPhuHuynh())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phụ huynh."));

        ThanhToan payment = new ThanhToan();
        payment.setHocPhi(invoice);
        payment.setPhuHuynh(parent);
        payment.setSoTienThanhToan(request.soTienThanhToan());
        payment.setPhuongThucThanhToan(request.phuongThucThanhToan().trim());
        payment.setMaGiaoDich(blankToNull(request.maGiaoDich()));
        payment.setThoiGianThanhToan(LocalDateTime.now());
        payment.setTrangThai(PAYMENT_SUCCESS);
        payment.setNoiDung(blankToNull(request.noiDung()));
        thanhToanRepository.saveAndFlush(payment);
        invoice.setTrangThai("Đã thanh toán");
        hocPhiRepository.save(invoice);
    }

    private void validateInvoiceRequest(TaoHocPhiRequest request) {
        if (request == null
                || request.maTre() == null
                || request.thangApDung() == null || request.thangApDung() < 1 || request.thangApDung() > 12
                || request.namApDung() == null || request.namApDung() < 2000 || request.namApDung() > 2100
                || request.hanThanhToan() == null
                || request.chiTiet() == null || request.chiTiet().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin phiếu thu không hợp lệ.");
        }
    }

    private void validateInvoiceLine(TaoHocPhiRequest.ChiTietRequest item) {
        if (item == null || item.loaiPhi() == null || item.loaiPhi().isBlank() || item.loaiPhi().trim().length() > 50
                || item.soLuong() == null || item.soLuong() < 1
                || item.donGia() == null || item.donGia().signum() <= 0 || item.donGia().compareTo(MAX_MONEY) > 0
                || item.donGia().stripTrailingZeros().scale() > 2
                || item.noiDung() != null && item.noiDung().trim().length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chi tiết khoản thu không hợp lệ.");
        }
    }

    private void validatePaymentRequest(GhiNhanThanhToanRequest request) {
        if (request == null || request.soTienThanhToan() == null
                || request.soTienThanhToan().signum() <= 0
                || request.soTienThanhToan().compareTo(MAX_MONEY) > 0
                || request.soTienThanhToan().stripTrailingZeros().scale() > 2
                || request.phuongThucThanhToan() == null || request.phuongThucThanhToan().isBlank()
                || request.phuongThucThanhToan().trim().length() > 50
                || request.maPhuHuynh() == null
                || request.maGiaoDich() != null && request.maGiaoDich().trim().length() > 100
                || request.noiDung() != null && request.noiDung().trim().length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin thanh toán không hợp lệ.");
        }
    }

    private HocPhiDTO toDTO(
            HocPhi invoice,
            List<HocPhiDTO.ChiTietDTO> details,
            HocPhiDTO.ThanhToanDTO payment,
            List<HocPhiDTO.PhuHuynhDTO> parents) {
        TreEm child = invoice.getTreEm();
        String childName = (child.getHoTenDemTre() + " " + child.getTenTre()).trim();
        return new HocPhiDTO(
                invoice.getMaHocPhi(),
                invoice.getThangApDung(),
                invoice.getNamApDung(),
                invoice.getNgayLap(),
                invoice.getHanThanhToan(),
                invoice.getTongTien(),
                invoice.getTrangThai(),
                child.getMaTre(),
                childName,
                child.getLopHoc() == null ? null : child.getLopHoc().getMaLopHoc(),
                child.getLopHoc() == null ? null : child.getLopHoc().getTenLopHoc(),
                details,
                payment,
                parents);
    }

    private HocPhiDTO.ChiTietDTO toChiTietDTO(ChiTietHocPhi detail) {
        return new HocPhiDTO.ChiTietDTO(
                detail.getMaChiTietHocPhi(),
                detail.getLoaiPhi(),
                detail.getSoLuong(),
                detail.getDonGia(),
                detail.getNoiDung(),
                detail.getThanhTien());
    }

    private HocPhiDTO.ThanhToanDTO toThanhToanDTO(ThanhToan payment) {
        PhuHuynh parent = payment.getPhuHuynh();
        return new HocPhiDTO.ThanhToanDTO(
                payment.getMaThanhToan(),
                payment.getSoTienThanhToan(),
                payment.getPhuongThucThanhToan(),
                payment.getMaGiaoDich(),
                payment.getThoiGianThanhToan(),
                payment.getTrangThai(),
                payment.getNoiDung(),
                parent.getMaPhuHuynh(),
                (parent.getHoTenDemPH() + " " + parent.getTenPH()).trim());
    }

    private HocPhiDTO.PhuHuynhDTO toPhuHuynhDTO(PhuHuynhTre link) {
        PhuHuynh parent = link.getPhuHuynh();
        return new HocPhiDTO.PhuHuynhDTO(
                parent.getMaPhuHuynh(),
                (parent.getHoTenDemPH() + " " + parent.getTenPH()).trim(),
                link.getQuanHe());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private PhuHuynh timPhuHuynh(TaiKhoanPrincipal principal) {
        return phuHuynhRepository.findByTaiKhoanMaTaiKhoan(principal.getMaTaiKhoan())
                .orElseThrow(() -> new AccessDeniedException(
                        "Tài khoản chưa được gắn với hồ sơ phụ huynh."));
    }

    private String taoNoiDungChuyenKhoan(HocPhi invoice) {
        String reference = "HP-" + invoice.getMaHocPhi();
        TreEm child = invoice.getTreEm();
        String childName = child.getHoTenDemTre() + " " + child.getTenTre();
        String normalizedName = Normalizer.normalize(childName, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", " ")
                .trim();
        int nameLimit = Math.max(0, 50 - reference.length() - 1);
        if (normalizedName.length() > nameLimit) {
            normalizedName = normalizedName.substring(0, nameLimit).trim();
        }
        return normalizedName.isEmpty() ? reference : reference + " " + normalizedName;
    }
}