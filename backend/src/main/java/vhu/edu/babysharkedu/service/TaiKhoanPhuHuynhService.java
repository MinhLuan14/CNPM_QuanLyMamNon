package vhu.edu.babysharkedu.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.KiemTraTenDangNhapDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhCapTaiKhoanDTO;
import vhu.edu.babysharkedu.dto.TaoTaiKhoanPhuHuynhRequest;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.PhuHuynhTreId;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.TaiKhoanRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;

@Service
public class TaiKhoanPhuHuynhService {
    private static final int TEN_DANG_NHAP_MAX_LENGTH = 50;
    private final TaiKhoanRepository taiKhoanRepository;
    private final PhuHuynhRepository phuHuynhRepository;
    private final TreEmRepository treEmRepository;
    private final PhuHuynhTreRepository phuHuynhTreRepository;
    private final TaiKhoanCapPhatService taiKhoanCapPhatService;

    public TaiKhoanPhuHuynhService(
            TaiKhoanRepository taiKhoanRepository,
            PhuHuynhRepository phuHuynhRepository,
            TreEmRepository treEmRepository,
            PhuHuynhTreRepository phuHuynhTreRepository,
            TaiKhoanCapPhatService taiKhoanCapPhatService) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.phuHuynhRepository = phuHuynhRepository;
        this.treEmRepository = treEmRepository;
        this.phuHuynhTreRepository = phuHuynhTreRepository;
        this.taiKhoanCapPhatService = taiKhoanCapPhatService;
    }

    @Transactional
    public PhuHuynhCapTaiKhoanDTO taoHoSo(
            TaoTaiKhoanPhuHuynhRequest request,
            boolean batBuocCapTaiKhoan) {
        validateHoSo(request);
        String soDienThoai = request.soDienThoai().trim();
        if (phuHuynhRepository.existsBySoDienThoai(soDienThoai)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại phụ huynh đã được sử dụng.");
        }

        TreEm treEm = request.maTre() == null
                ? null
                : treEmRepository.findById(request.maTre())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ trẻ."));
        if (treEm != null && (request.quanHe() == null
                || request.quanHe().isBlank()
                || request.quanHe().trim().length() > 100)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng chọn mối quan hệ với trẻ, tối đa 100 ký tự.");
        }

        boolean capTaiKhoan = batBuocCapTaiKhoan || Boolean.TRUE.equals(request.capTaiKhoan());
        TaiKhoan taiKhoan = null;
        String matKhauTamThoi = null;
        if (capTaiKhoan) {
            TaiKhoanCapPhatResult taiKhoanCapPhat = taoTaiKhoan(
                    request.hoTenDemPH().trim(),
                    request.tenPH().trim(),
                    soDienThoai);
            taiKhoan = taiKhoanCapPhat.taiKhoan();
            matKhauTamThoi = taiKhoanCapPhat.matKhauTamThoi();
            if (taiKhoan.getMaTaiKhoan() == null) {
                throw new IllegalStateException("Database không trả về mã tài khoản vừa tạo.");
            }
        }

        PhuHuynh phuHuynh = new PhuHuynh();
        phuHuynh.setHoTenDemPH(request.hoTenDemPH().trim());
        phuHuynh.setTenPH(request.tenPH().trim());
        phuHuynh.setDiaChiLH(request.diaChiLH().trim());
        phuHuynh.setSoDienThoai(soDienThoai);
        phuHuynh.setEmail(chuanHoaEmail(request.email()));
        phuHuynh.setTaiKhoan(taiKhoan);
        phuHuynh = phuHuynhRepository.saveAndFlush(phuHuynh);

        if (treEm != null) {
            lienKetTre(phuHuynh, treEm, request.quanHe());
        }

        return toDTO(phuHuynh, matKhauTamThoi);
    }

    @Transactional
    public PhuHuynhCapTaiKhoanDTO capTaiKhoan(Integer maPhuHuynh) {
        PhuHuynh phuHuynh = phuHuynhRepository.findWithLockByMaPhuHuynh(maPhuHuynh)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ phụ huynh."));
        if (phuHuynh.getTaiKhoan() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phụ huynh đã được cấp tài khoản.");
        }

        TaiKhoanCapPhatResult taiKhoanCapPhat = taoTaiKhoan(phuHuynh);
        String matKhauTamThoi = taiKhoanCapPhat.matKhauTamThoi();
        TaiKhoan taiKhoan = taiKhoanCapPhat.taiKhoan();
        phuHuynh.setTaiKhoan(taiKhoan);
        phuHuynhRepository.save(phuHuynh);
        return toDTO(phuHuynh, matKhauTamThoi);
    }

    @Transactional
    public PhuHuynhCapTaiKhoanDTO capLaiMatKhauTamThoi(Integer maPhuHuynh) {
        PhuHuynh phuHuynh = phuHuynhRepository.findWithLockByMaPhuHuynh(maPhuHuynh)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ phụ huynh."));
        if (phuHuynh.getTaiKhoan() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phụ huynh chưa được cấp tài khoản.");
        }

        TaiKhoan taiKhoan = phuHuynh.getTaiKhoan();
        String matKhauTamThoi = taiKhoanCapPhatService.capNhatMatKhauTamThoi(taiKhoan);
        return toDTO(phuHuynh, matKhauTamThoi);
    }

    @Transactional(readOnly = true)
    public KiemTraTenDangNhapDTO kiemTraTenDangNhap(String tenDangNhap) {
        if (tenDangNhap == null || tenDangNhap.isBlank()
                || tenDangNhap.trim().length() > TEN_DANG_NHAP_MAX_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Tên đăng nhập không được để trống và tối đa 50 ký tự.");
        }
        String normalized = tenDangNhap.trim().toLowerCase(Locale.ROOT);
        return new KiemTraTenDangNhapDTO(
                normalized, taiKhoanRepository.existsByTenDangNhapIgnoreCase(normalized));
    }

    @Transactional
    public void capNhatTrangThai(Integer maTaiKhoan, Boolean trangThai) {
        if (trangThai == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái tài khoản là bắt buộc.");
        }
        TaiKhoan taiKhoan = taiKhoanRepository.findById(maTaiKhoan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản."));
        taiKhoan.setTrangThai(trangThai);
        taiKhoanRepository.save(taiKhoan);
    }

    private TaiKhoanCapPhatResult taoTaiKhoan(
            String hoTenDem,
            String ten,
            String soDienThoai) {
        String hoTen = hoTenDem + ten;
        String tenDangNhap = taiKhoanCapPhatService.taoTenDangNhap(
                hoTen, soDienThoai);
        return taiKhoanCapPhatService.taoTaiKhoan(tenDangNhap, "PHUHUYNH");
    }

    private TaiKhoanCapPhatResult taoTaiKhoan(PhuHuynh phuHuynh) {
        String hoTen = phuHuynh.getHoTenDemPH() + phuHuynh.getTenPH();
        String tenDangNhap = taiKhoanCapPhatService.taoTenDangNhap(
                hoTen, String.valueOf(phuHuynh.getMaPhuHuynh()));
        return taiKhoanCapPhatService.taoTaiKhoan(tenDangNhap, "PHUHUYNH");
    }

    private void lienKetTre(PhuHuynh phuHuynh, TreEm treEm, String quanHe) {
        PhuHuynhTreId id = new PhuHuynhTreId();
        id.setMaPhuHuynh(phuHuynh.getMaPhuHuynh());
        id.setMaTre(treEm.getMaTre());
        if (phuHuynhTreRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Liên kết phụ huynh - trẻ đã tồn tại.");
        }

        PhuHuynhTre lienKet = new PhuHuynhTre();
        lienKet.setId(id);
        lienKet.setPhuHuynh(phuHuynh);
        lienKet.setTreEm(treEm);
        lienKet.setQuanHe(quanHe == null || quanHe.isBlank() ? null : quanHe.trim());
        phuHuynhTreRepository.save(lienKet);
    }

    private void validateHoSo(TaoTaiKhoanPhuHuynhRequest request) {
        if (request == null
                || request.hoTenDemPH() == null || request.hoTenDemPH().isBlank()
                || request.hoTenDemPH().trim().length() > 255
                || request.tenPH() == null || request.tenPH().isBlank()
                || request.tenPH().trim().length() > 100
                || request.diaChiLH() == null || request.diaChiLH().isBlank()
                || request.diaChiLH().trim().length() > 255
                || request.soDienThoai() == null
                || !request.soDienThoai().trim().matches("\\d{10}")
                || (request.email() != null && !request.email().isBlank()
                        && (request.email().trim().length() > 100
                                || !request.email().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Họ tên, địa chỉ và số điện thoại 10 chữ số là bắt buộc; email (nếu có) phải hợp lệ.");
        }
    }

    private String chuanHoaEmail(String email) {
        return email == null || email.isBlank() ? null : email.trim();
    }

    private PhuHuynhCapTaiKhoanDTO toDTO(PhuHuynh phuHuynh, String matKhauTamThoi) {
        TaiKhoan taiKhoan = phuHuynh.getTaiKhoan();
        return new PhuHuynhCapTaiKhoanDTO(
                phuHuynh.getMaPhuHuynh(),
                taiKhoan == null ? null : taiKhoan.getMaTaiKhoan(),
                taiKhoan == null ? null : taiKhoan.getTenDangNhap(),
                taiKhoan == null ? null : taiKhoan.getVaiTro(),
                taiKhoan == null ? null : taiKhoan.getTrangThai(),
                taiKhoan != null,
                matKhauTamThoi);
    }
}
