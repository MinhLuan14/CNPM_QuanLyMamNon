package vhu.edu.babysharkedu.service;

import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Iterator;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.CapNhatYeuCauHoTroRequest;
import vhu.edu.babysharkedu.dto.MatKhauTamThoiDTO;
import vhu.edu.babysharkedu.dto.TaiKhoanMatKhauTamThoiDTO;
import vhu.edu.babysharkedu.dto.YeuCauHoTroTaiKhoanDTO;
import vhu.edu.babysharkedu.dto.YeuCauHoTroTaiKhoanRequest;
import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.model.YeuCauHoTroTaiKhoan;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.repository.YeuCauHoTroTaiKhoanRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class YeuCauHoTroTaiKhoanService {
    private static final Duration RATE_LIMIT_WINDOW = Duration.ofHours(1);
    private static final int MAX_REQUESTS_PER_PHONE = 5;
    private static final int MAX_REQUESTS_PER_IP = 5;
    private static final List<String> LOAI_YEU_CAU = List.of(
            "QUEN_TEN_DANG_NHAP",
            "QUEN_MAT_KHAU",
            "KHONG_DANG_NHAP_DUOC",
            "HO_TRO_KHAC");
    private static final List<String> TRANG_THAI = List.of(
            "CHO_XU_LY",
            "DANG_XU_LY",
            "CHO_XAC_MINH",
            "DA_XAC_MINH",
            "DA_GIAI_QUYET",
            "TU_CHOI",
            "DA_HUY");

    private final YeuCauHoTroTaiKhoanRepository yeuCauRepository;
    private final PhuHuynhRepository phuHuynhRepository;
    private final GiaoVienRepository giaoVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final TaiKhoanService taiKhoanService;
    private final Map<String, Deque<LocalDateTime>> ipRequestWindows = new HashMap<>();

    public YeuCauHoTroTaiKhoanService(
            YeuCauHoTroTaiKhoanRepository yeuCauRepository,
            PhuHuynhRepository phuHuynhRepository,
            GiaoVienRepository giaoVienRepository,
            TaiKhoanRepository taiKhoanRepository,
            TaiKhoanService taiKhoanService) {
        this.yeuCauRepository = yeuCauRepository;
        this.phuHuynhRepository = phuHuynhRepository;
        this.giaoVienRepository = giaoVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.taiKhoanService = taiKhoanService;
    }

    @Transactional
    public void guiYeuCau(YeuCauHoTroTaiKhoanRequest request, String remoteAddress) {
        validate(request);
        String soDienThoai = chuanHoaSoDienThoai(request.soDienThoai());
        LocalDateTime now = LocalDateTime.now();
        gioiHanTheoIp(remoteAddress, now);
        if (yeuCauRepository.countBySoDienThoaiAndThoiGianTaoAfter(
                soDienThoai, now.minus(RATE_LIMIT_WINDOW)) >= MAX_REQUESTS_PER_PHONE) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
        }

        String accountType = request.loaiTaiKhoan() == null || request.loaiTaiKhoan().isBlank()
                ? "PHUHUYNH"
                : request.loaiTaiKhoan().trim().toUpperCase(Locale.ROOT);
        PhuHuynh phuHuynh = null;
        GiaoVien giaoVien = null;
        if ("PHUHUYNH".equals(accountType)) {
            phuHuynh = phuHuynhRepository.findBySoDienThoai(soDienThoai)
                    .filter(parent -> khopHoSo(
                            parent.getHoTenDemPH() + " " + parent.getTenPH(),
                            parent.getEmail(),
                            request))
                    .orElse(null);
        } else if ("GIAOVIEN".equals(accountType)) {
            giaoVien = giaoVienRepository.findBySoDienThoai(soDienThoai)
                    .filter(teacher -> khopHoSo(
                            teacher.getHoTenDem() + " " + teacher.getTenGiaoVien(),
                            teacher.getEmail(),
                            request))
                    .orElse(null);
        }

        YeuCauHoTroTaiKhoan ticket = new YeuCauHoTroTaiKhoan();
        ticket.setPhuHuynh(phuHuynh);
        ticket.setGiaoVien(giaoVien);
        ticket.setHoTen(request.hoTen().trim());
        ticket.setSoDienThoai(soDienThoai);
        ticket.setEmail(request.email() == null || request.email().isBlank() ? null : request.email().trim());
        ticket.setLoaiYeuCau(request.loaiYeuCau());
        ticket.setLoaiTaiKhoan(accountType);
        ticket.setNoiDung(request.noiDung() == null || request.noiDung().isBlank()
                ? null
                : request.noiDung().trim());
        ticket.setTrangThai("CHO_XU_LY");
        yeuCauRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<YeuCauHoTroTaiKhoanDTO> layTatCa() {
        return yeuCauRepository.findAllByOrderByThoiGianTaoDesc()
                .stream().map(ticket -> toDTO(ticket, false)).toList();
    }

    @Transactional(readOnly = true)
    public YeuCauHoTroTaiKhoanDTO layChiTiet(Integer maYeuCau) {
        return toDTO(timYeuCau(maYeuCau), true);
    }

    @Transactional
    public YeuCauHoTroTaiKhoanDTO capNhat(
            Integer maYeuCau,
            CapNhatYeuCauHoTroRequest request,
            Authentication authentication) {
        if (request == null || request.trangThai() == null || !TRANG_THAI.contains(request.trangThai())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái yêu cầu hỗ trợ không hợp lệ.");
        }
        if (request.ghiChuXuLy() != null && request.ghiChuXuLy().trim().length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ghi chú xử lý không được vượt quá 1000 ký tự.");
        }

        YeuCauHoTroTaiKhoan ticket = timYeuCauKhoa(maYeuCau);
        if (laTrangThaiKetThuc(ticket.getTrangThai()) && !ticket.getTrangThai().equals(request.trangThai())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Yêu cầu đã kết thúc; không thể thay đổi trạng thái.");
        }
        TaiKhoan staff = timNhanVien(authentication);
        ticket.setTrangThai(request.trangThai());
        ticket.setNhanVienXuLy(staff);
        themGhiChu(ticket, staff.getTenDangNhap(), request.ghiChuXuLy());
        return toDTO(yeuCauRepository.save(ticket), true);
    }

    @Transactional
    public MatKhauTamThoiDTO capLaiMatKhau(Integer maYeuCau, Authentication authentication) {
        YeuCauHoTroTaiKhoan ticket = timYeuCauKhoa(maYeuCau);
        if (!"DA_XAC_MINH".equals(ticket.getTrangThai())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Cần xác minh danh tính phụ huynh trước khi cấp lại mật khẩu.");
        }
        if (!List.of("QUEN_MAT_KHAU", "KHONG_DANG_NHAP_DUOC").contains(ticket.getLoaiYeuCau())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Loại yêu cầu này không hỗ trợ cấp lại mật khẩu.");
        }
        TaiKhoan linkedAccount = ticket.getPhuHuynh() != null
                ? ticket.getPhuHuynh().getTaiKhoan()
                : ticket.getGiaoVien() != null ? ticket.getGiaoVien().getTaiKhoan() : null;
        if (linkedAccount == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản khớp với hồ sơ đã xác minh.");
        }
        if (!Boolean.TRUE.equals(linkedAccount.getTrangThai())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Tài khoản đang bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        TaiKhoan staff = timNhanVien(authentication);
        TaiKhoanMatKhauTamThoiDTO account =
                taiKhoanService.capLaiMatKhauTamThoi(linkedAccount.getMaTaiKhoan());
        ticket.setTrangThai("DA_GIAI_QUYET");
        ticket.setNhanVienXuLy(staff);
        themGhiChu(ticket, staff.getTenDangNhap(), "Đã cấp mật khẩu tạm thời sau khi nhân viên xác minh.");
        yeuCauRepository.save(ticket);
        return new MatKhauTamThoiDTO(
                ticket.getMaYeuCau(), account.tenDangNhap(), account.matKhauTamThoi());
    }

    private boolean khopHoSo(
            String registeredName,
            String registeredEmail,
            YeuCauHoTroTaiKhoanRequest request) {
        return chuanHoaTen(registeredName).equals(chuanHoaTen(request.hoTen()))
                && (request.email() == null || request.email().isBlank()
                        || (registeredEmail != null
                                && registeredEmail.trim().equalsIgnoreCase(request.email().trim())));
    }

    private synchronized void gioiHanTheoIp(String ip, LocalDateTime now) {
        if (ip == null || ip.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xác định nguồn gửi yêu cầu.");
        }
        LocalDateTime start = now.minus(RATE_LIMIT_WINDOW);
        Iterator<Map.Entry<String, Deque<LocalDateTime>>> iterator = ipRequestWindows.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Deque<LocalDateTime>> entry = iterator.next();
            entry.getValue().removeIf(timestamp -> timestamp.isBefore(start));
            if (entry.getValue().isEmpty()) {
                iterator.remove();
            }
        }
        Deque<LocalDateTime> requests = ipRequestWindows.computeIfAbsent(ip, ignored -> new ArrayDeque<>());
        if (requests.size() >= MAX_REQUESTS_PER_IP) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
        }
        if (requests.isEmpty() && ipRequestWindows.size() > 10_000) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Hiện không thể tiếp nhận thêm yêu cầu từ nguồn này.");
        }
        requests.addLast(now);
    }

    private void validate(YeuCauHoTroTaiKhoanRequest request) {
        if (request == null
                || request.hoTen() == null || request.hoTen().isBlank() || request.hoTen().trim().length() > 356
                || request.soDienThoai() == null
                || !request.soDienThoai().replaceAll("[\\s()+.-]", "").matches("\\d{10,15}")
                || request.loaiYeuCau() == null || !LOAI_YEU_CAU.contains(request.loaiYeuCau())
                || (request.loaiTaiKhoan() != null && !request.loaiTaiKhoan().isBlank()
                        && !List.of("PHUHUYNH", "GIAOVIEN").contains(
                                request.loaiTaiKhoan().trim().toUpperCase(Locale.ROOT)))
                || (request.email() != null && !request.email().isBlank()
                        && (request.email().trim().length() > 100
                                || !request.email().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")))
                || (request.noiDung() != null && request.noiDung().length() > 1000)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng kiểm tra họ tên, số điện thoại, email, loại yêu cầu và nội dung mô tả.");
        }
    }

    private String chuanHoaSoDienThoai(String phone) {
        return phone.replaceAll("\\D", "");
    }

    private String chuanHoaTen(String value) {
        String noDau = value.replace('đ', 'd').replace('Đ', 'D');
        return Normalizer.normalize(noDau, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9]", "")
                .toLowerCase(Locale.ROOT);
    }

    private boolean laTrangThaiKetThuc(String status) {
        return List.of("DA_GIAI_QUYET", "TU_CHOI", "DA_HUY").contains(status);
    }

    private TaiKhoan timNhanVien(Authentication authentication) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof TaiKhoanPrincipal principal)
                || !List.of("ADMIN", "GIAOVIEN").contains(principal.getVaiTro())) {
            throw new AccessDeniedException("Bạn không có quyền xử lý yêu cầu hỗ trợ.");
        }
        return taiKhoanRepository.findById(principal.getMaTaiKhoan())
                .orElseThrow(() -> new AccessDeniedException("Không tìm thấy tài khoản nhân viên xử lý."));
    }

    private YeuCauHoTroTaiKhoan timYeuCau(Integer maYeuCau) {
        return yeuCauRepository.findById(maYeuCau)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu hỗ trợ."));
    }

    private YeuCauHoTroTaiKhoan timYeuCauKhoa(Integer maYeuCau) {
        return yeuCauRepository.findWithLockByMaYeuCau(maYeuCau)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu hỗ trợ."));
    }

    private void themGhiChu(YeuCauHoTroTaiKhoan ticket, String username, String note) {
        if (note == null || note.isBlank()) {
            return;
        }
        String entry = LocalDateTime.now() + " - " + username + ": " + note.trim();
        String history = ticket.getGhiChuXuLy();
        String combined = history == null || history.isBlank() ? entry : history + "\n" + entry;
        if (combined.length() > 4000) {
            combined = combined.substring(combined.length() - 4000);
        }
        ticket.setGhiChuXuLy(combined);
    }

    private YeuCauHoTroTaiKhoanDTO toDTO(YeuCauHoTroTaiKhoan ticket, boolean showFullPhone) {
        return new YeuCauHoTroTaiKhoanDTO(
                ticket.getMaYeuCau(),
                ticket.getPhuHuynh() == null ? null : ticket.getPhuHuynh().getMaPhuHuynh(),
                ticket.getGiaoVien() == null ? null : ticket.getGiaoVien().getMaGiaoVien(),
                ticket.getLoaiTaiKhoan(),
                ticket.getHoTen(),
                showFullPhone ? ticket.getSoDienThoai() : cheSoDienThoai(ticket.getSoDienThoai()),
                ticket.getEmail(),
                ticket.getLoaiYeuCau(),
                ticket.getNoiDung(),
                ticket.getTrangThai(),
                ticket.getThoiGianTao(),
                ticket.getThoiGianCapNhat(),
                ticket.getNhanVienXuLy() == null ? null : ticket.getNhanVienXuLy().getTenDangNhap(),
                ticket.getGhiChuXuLy());
    }

    private String cheSoDienThoai(String phone) {
        if (phone == null || phone.length() < 4) {
            return "****";
        }
        return "*".repeat(phone.length() - 4) + phone.substring(phone.length() - 4);
    }
}
