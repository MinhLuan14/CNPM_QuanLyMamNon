package vhu.edu.babysharkedu.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.PhuHuynhHoSoDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhTreDTO;
import vhu.edu.babysharkedu.dto.CapNhatPhuHuynhRequest;
import vhu.edu.babysharkedu.dto.TaiKhoanPhuHuynhDTO;
import vhu.edu.babysharkedu.dto.ThongTinLienKetPhuHuynhDTO;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.TaiKhoan;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class PhuHuynhService {
    private final PhuHuynhRepository phuHuynhRepository;
    private final PhuHuynhTreRepository phuHuynhTreRepository;

    public PhuHuynhService(
            PhuHuynhRepository phuHuynhRepository,
            PhuHuynhTreRepository phuHuynhTreRepository) {
        this.phuHuynhRepository = phuHuynhRepository;
        this.phuHuynhTreRepository = phuHuynhTreRepository;
    }

    @Transactional(readOnly = true)
    public List<PhuHuynhHoSoDTO> layChuaCoTaiKhoan() {
        return phuHuynhRepository.findAllByTaiKhoanIsNullOrderByMaPhuHuynhAsc()
                .stream().map(this::toHoSoDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ThongTinLienKetPhuHuynhDTO> layTatCa() {
        return phuHuynhRepository.findAllByOrderByMaPhuHuynhAsc()
                .stream().map(this::toThongTinLienKetDTO).toList();
    }

    @Transactional(readOnly = true)
    public TaiKhoanPhuHuynhDTO layTinhTrangTaiKhoan(Integer maPhuHuynh, Authentication authentication) {
        PhuHuynh phuHuynh = timPhuHuynh(maPhuHuynh);
        kiemTraQuyen(phuHuynh, authentication);
        return toTaiKhoanDTO(phuHuynh);
    }

    @Transactional(readOnly = true)
    public ThongTinLienKetPhuHuynhDTO layThongTinLienKet(
            Integer maPhuHuynh,
            Authentication authentication) {
        PhuHuynh phuHuynh = timPhuHuynh(maPhuHuynh);
        kiemTraQuyen(phuHuynh, authentication);
        return toThongTinLienKetDTO(phuHuynh);
    }

    @Transactional
    public ThongTinLienKetPhuHuynhDTO capNhatHoSo(
            Integer maPhuHuynh,
            CapNhatPhuHuynhRequest request) {
        PhuHuynh phuHuynh = timPhuHuynh(maPhuHuynh);
        validateHoSo(request);
        String soDienThoai = request.soDienThoai().trim();
        if (phuHuynhRepository.existsBySoDienThoaiAndMaPhuHuynhNot(soDienThoai, maPhuHuynh)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Số điện thoại đã được sử dụng bởi phụ huynh khác.");
        }

        phuHuynh.setHoTenDemPH(request.hoTenDemPH().trim());
        phuHuynh.setTenPH(request.tenPH().trim());
        phuHuynh.setSoDienThoai(soDienThoai);
        phuHuynh.setEmail(request.email() == null || request.email().isBlank()
                ? null
                : request.email().trim());
        phuHuynh.setDiaChiLH(request.diaChiLH().trim());
        phuHuynhRepository.save(phuHuynh);
        return toThongTinLienKetDTO(phuHuynh);
    }

    private void validateHoSo(CapNhatPhuHuynhRequest request) {
        if (request == null
                || request.hoTenDemPH() == null
                || request.hoTenDemPH().isBlank()
                || request.hoTenDemPH().trim().length() > 255
                || request.tenPH() == null
                || request.tenPH().isBlank()
                || request.tenPH().trim().length() > 100
                || request.soDienThoai() == null
                || !request.soDienThoai().trim().matches("\\d{10}")
                || request.diaChiLH() == null
                || request.diaChiLH().isBlank()
                || request.diaChiLH().trim().length() > 255
                || (request.email() != null && !request.email().isBlank()
                        && (request.email().trim().length() > 100
                                || !request.email().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng kiểm tra họ tên, số điện thoại (10 chữ số), email và địa chỉ liên hệ.");
        }
    }

    private PhuHuynh timPhuHuynh(Integer maPhuHuynh) {
        return phuHuynhRepository.findById(maPhuHuynh)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ phụ huynh."));
    }

    private void kiemTraQuyen(PhuHuynh phuHuynh, Authentication authentication) {
        if (authentication != null
                && authentication.getPrincipal() instanceof TaiKhoanPrincipal principal
                && List.of("ADMIN", "GIAOVIEN").contains(principal.getVaiTro())) {
            return;
        }
        if (authentication != null
                && authentication.getPrincipal() instanceof TaiKhoanPrincipal principal
                && "PHUHUYNH".equals(principal.getVaiTro())
                && phuHuynh.getTaiKhoan() != null
                && phuHuynh.getTaiKhoan().getMaTaiKhoan().equals(principal.getMaTaiKhoan())) {
            return;
        }
        throw new AccessDeniedException("Bạn không có quyền xem thông tin phụ huynh này.");
    }

    private PhuHuynhHoSoDTO toHoSoDTO(PhuHuynh phuHuynh) {
        return new PhuHuynhHoSoDTO(
                phuHuynh.getMaPhuHuynh(),
                phuHuynh.getHoTenDemPH(),
                phuHuynh.getTenPH(),
                phuHuynh.getDiaChiLH(),
                phuHuynh.getSoDienThoai(),
                phuHuynh.getEmail());
    }

    private ThongTinLienKetPhuHuynhDTO toThongTinLienKetDTO(PhuHuynh phuHuynh) {
        List<PhuHuynhTreDTO> treEm = phuHuynhTreRepository
                .findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(phuHuynh.getMaPhuHuynh())
                .stream().map(this::toLienKetDTO).toList();
        return new ThongTinLienKetPhuHuynhDTO(
                toHoSoDTO(phuHuynh),
                toTaiKhoanDTO(phuHuynh),
                treEm);
    }

    private TaiKhoanPhuHuynhDTO toTaiKhoanDTO(PhuHuynh phuHuynh) {
        TaiKhoan taiKhoan = phuHuynh.getTaiKhoan();
        if (taiKhoan == null) {
            return new TaiKhoanPhuHuynhDTO(
                    phuHuynh.getMaPhuHuynh(), null, null, null, null, false);
        }
        return new TaiKhoanPhuHuynhDTO(
                phuHuynh.getMaPhuHuynh(),
                taiKhoan.getMaTaiKhoan(),
                taiKhoan.getTenDangNhap(),
                taiKhoan.getVaiTro(),
                taiKhoan.getTrangThai(),
                true);
    }

    private PhuHuynhTreDTO toLienKetDTO(PhuHuynhTre lienKet) {
        return new PhuHuynhTreDTO(
                lienKet.getPhuHuynh().getMaPhuHuynh(),
                lienKet.getPhuHuynh().getHoTenDemPH(),
                lienKet.getPhuHuynh().getTenPH(),
                lienKet.getTreEm().getMaTre(),
                lienKet.getTreEm().getHoTenDemTre(),
                lienKet.getTreEm().getTenTre(),
                lienKet.getQuanHe());
    }
}
