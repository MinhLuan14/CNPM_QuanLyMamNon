package vhu.edu.babysharkedu.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.CapNhatQuanHeRequest;
import vhu.edu.babysharkedu.dto.DoiTreLienKetRequest;
import vhu.edu.babysharkedu.dto.PhuHuynhTreDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhTreRequest;
import vhu.edu.babysharkedu.model.PhuHuynh;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.PhuHuynhTreId;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.PhuHuynhRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;

@Service
public class PhuHuynhTreService {
    private static final int QUAN_HE_MAX_LENGTH = 100;

    private final PhuHuynhTreRepository phuHuynhTreRepository;
    private final PhuHuynhRepository phuHuynhRepository;
    private final TreEmRepository treEmRepository;

    public PhuHuynhTreService(
            PhuHuynhTreRepository phuHuynhTreRepository,
            PhuHuynhRepository phuHuynhRepository,
            TreEmRepository treEmRepository) {
        this.phuHuynhTreRepository = phuHuynhTreRepository;
        this.phuHuynhRepository = phuHuynhRepository;
        this.treEmRepository = treEmRepository;
    }

    @Transactional(readOnly = true)
    public List<PhuHuynhTreDTO> layTatCa() {
        return phuHuynhTreRepository.findAllByOrderByPhuHuynhMaPhuHuynhAscTreEmMaTreAsc()
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<PhuHuynhTreDTO> layTheoPhuHuynh(Integer maPhuHuynh, Authentication authentication) {
        kiemTraQuyenPhuHuynh(maPhuHuynh, authentication);
        if (!phuHuynhRepository.existsById(maPhuHuynh)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ phụ huynh.");
        }
        return phuHuynhTreRepository.findAllByPhuHuynhMaPhuHuynhOrderByTreEmMaTreAsc(maPhuHuynh)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<PhuHuynhTreDTO> layTheoTre(Integer maTre, Authentication authentication) {
        if (!treEmRepository.existsById(maTre)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ trẻ.");
        }
        List<PhuHuynhTre> lienKet =
                phuHuynhTreRepository.findAllByTreEmMaTreOrderByPhuHuynhMaPhuHuynhAsc(maTre);
        if (laPhuHuynh(authentication)) {
            Integer maPhuHuynh = timPhuHuynhCuaTaiKhoan(authentication);
            lienKet = lienKet.stream()
                    .filter(item -> item.getPhuHuynh().getMaPhuHuynh().equals(maPhuHuynh))
                    .toList();
            if (lienKet.isEmpty()) {
                throw new AccessDeniedException("Phụ huynh không có quyền xem thông tin liên kết của trẻ này.");
            }
        } else if (!laQuanTri(authentication)) {
            throw new AccessDeniedException("Bạn không có quyền xem danh sách phụ huynh của trẻ.");
        }
        return lienKet.stream().map(this::toDTO).toList();
    }

    @Transactional
    public PhuHuynhTreDTO taoLienKet(PhuHuynhTreRequest request) {
        validate(request);
        PhuHuynh phuHuynh = phuHuynhRepository.findById(request.maPhuHuynh())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ phụ huynh."));
        TreEm treEm = treEmRepository.findById(request.maTre())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ trẻ."));

        PhuHuynhTreId id = new PhuHuynhTreId();
        id.setMaPhuHuynh(request.maPhuHuynh());
        id.setMaTre(request.maTre());
        if (phuHuynhTreRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Liên kết phụ huynh - trẻ đã tồn tại.");
        }

        PhuHuynhTre phuHuynhTre = new PhuHuynhTre();
        phuHuynhTre.setId(id);
        phuHuynhTre.setPhuHuynh(phuHuynh);
        phuHuynhTre.setTreEm(treEm);
        phuHuynhTre.setQuanHe(chuanHoaQuanHe(request.quanHe()));
        return toDTO(phuHuynhTreRepository.save(phuHuynhTre));
    }

    @Transactional
    public PhuHuynhTreDTO capNhatQuanHe(
            Integer maPhuHuynh,
            Integer maTre,
            CapNhatQuanHeRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu quan hệ không được để trống.");
        }
        validateQuanHe(request.quanHe());
        PhuHuynhTre lienKet = timLienKet(maPhuHuynh, maTre);
        lienKet.setQuanHe(chuanHoaQuanHe(request.quanHe()));
        return toDTO(phuHuynhTreRepository.save(lienKet));
    }

    @Transactional
    public PhuHuynhTreDTO doiTreLienKet(
            Integer maPhuHuynh,
            Integer maTreCu,
            DoiTreLienKetRequest request) {
        if (request == null || request.maTre() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã trẻ mới là bắt buộc.");
        }
        validateQuanHe(request.quanHe());
        PhuHuynhTre lienKetCu = timLienKet(maPhuHuynh, maTreCu);
        if (maTreCu.equals(request.maTre())) {
            lienKetCu.setQuanHe(chuanHoaQuanHe(request.quanHe()));
            return toDTO(phuHuynhTreRepository.save(lienKetCu));
        }

        TreEm treEmMoi = treEmRepository.findById(request.maTre())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ trẻ."));
        PhuHuynhTreId idMoi = new PhuHuynhTreId();
        idMoi.setMaPhuHuynh(maPhuHuynh);
        idMoi.setMaTre(request.maTre());
        if (phuHuynhTreRepository.existsById(idMoi)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phụ huynh đã được liên kết với trẻ này.");
        }

        PhuHuynhTre lienKetMoi = new PhuHuynhTre();
        lienKetMoi.setId(idMoi);
        lienKetMoi.setPhuHuynh(lienKetCu.getPhuHuynh());
        lienKetMoi.setTreEm(treEmMoi);
        lienKetMoi.setQuanHe(chuanHoaQuanHe(request.quanHe()));
        lienKetMoi = phuHuynhTreRepository.saveAndFlush(lienKetMoi);
        phuHuynhTreRepository.delete(lienKetCu);
        return toDTO(lienKetMoi);
    }

    @Transactional
    public void huyLienKet(Integer maPhuHuynh, Integer maTre) {
        phuHuynhTreRepository.delete(timLienKet(maPhuHuynh, maTre));
    }

    public void kiemTraQuyenPhuHuynh(Integer maPhuHuynh, Authentication authentication) {
        if (laQuanTri(authentication)) {
            return;
        }
        if (!laPhuHuynh(authentication)
                || !maPhuHuynh.equals(timPhuHuynhCuaTaiKhoan(authentication))) {
            throw new AccessDeniedException("Bạn không có quyền xem thông tin phụ huynh này.");
        }
    }

    private PhuHuynhTre timLienKet(Integer maPhuHuynh, Integer maTre) {
        PhuHuynhTreId id = new PhuHuynhTreId();
        id.setMaPhuHuynh(maPhuHuynh);
        id.setMaTre(maTre);
        return phuHuynhTreRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy liên kết phụ huynh - trẻ."));
    }

    private Integer timPhuHuynhCuaTaiKhoan(Authentication authentication) {
        TaiKhoanPrincipal principal = (TaiKhoanPrincipal) authentication.getPrincipal();
        return phuHuynhRepository.findByTaiKhoanMaTaiKhoan(principal.getMaTaiKhoan())
                .map(PhuHuynh::getMaPhuHuynh)
                .orElseThrow(() -> new AccessDeniedException("Tài khoản chưa được gắn với hồ sơ phụ huynh."));
    }

    private boolean laQuanTri(Authentication authentication) {
        return authentication != null
                && authentication.getPrincipal() instanceof TaiKhoanPrincipal principal
                && "ADMIN".equals(principal.getVaiTro());
    }

    private boolean laPhuHuynh(Authentication authentication) {
        return authentication != null
                && authentication.getPrincipal() instanceof TaiKhoanPrincipal principal
                && "PHUHUYNH".equals(principal.getVaiTro());
    }

    private void validate(PhuHuynhTreRequest request) {
        if (request == null || request.maPhuHuynh() == null || request.maTre() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Mã phụ huynh và mã trẻ là bắt buộc.");
        }
        validateQuanHe(request.quanHe());
    }

    private void validateQuanHe(String quanHe) {
        if (quanHe != null && quanHe.trim().length() > QUAN_HE_MAX_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quan hệ không được vượt quá 100 ký tự.");
        }
    }

    private String chuanHoaQuanHe(String quanHe) {
        return quanHe == null || quanHe.isBlank() ? null : quanHe.trim();
    }

    private PhuHuynhTreDTO toDTO(PhuHuynhTre lienKet) {
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
