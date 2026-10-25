package vhu.edu.babysharkedu.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import vhu.edu.babysharkedu.dto.CapNhatPhuHuynhRequest;
import vhu.edu.babysharkedu.dto.PhuHuynhHoSoDTO;
import vhu.edu.babysharkedu.dto.TaiKhoanPhuHuynhDTO;
import vhu.edu.babysharkedu.dto.ThongTinLienKetPhuHuynhDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhCapTaiKhoanDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhHocPhiDTO;
import vhu.edu.babysharkedu.dto.TaoTaiKhoanPhuHuynhRequest;
import vhu.edu.babysharkedu.dto.VietQrDTO;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;
import vhu.edu.babysharkedu.service.HocPhiService;
import vhu.edu.babysharkedu.service.PhuHuynhService;
import vhu.edu.babysharkedu.service.TaiKhoanPhuHuynhService;

@RestController
@RequestMapping("/api/phu-huynh")
public class PhuHuynhController {
    private final PhuHuynhService phuHuynhService;
    private final TaiKhoanPhuHuynhService taiKhoanPhuHuynhService;
    private final HocPhiService hocPhiService;

    public PhuHuynhController(
            PhuHuynhService phuHuynhService,
            TaiKhoanPhuHuynhService taiKhoanPhuHuynhService,
            HocPhiService hocPhiService) {
        this.phuHuynhService = phuHuynhService;
        this.taiKhoanPhuHuynhService = taiKhoanPhuHuynhService;
        this.hocPhiService = hocPhiService;
    }

    @GetMapping("/hoc-phi")
    @PreAuthorize("hasRole('PHUHUYNH')")
    public List<PhuHuynhHocPhiDTO> layHocPhiCuaMinh(
            @AuthenticationPrincipal TaiKhoanPrincipal principal) {
        return hocPhiService.layTheoPhuHuynh(principal);
    }

    @PostMapping("/hoc-phi/{maHocPhi}/vietqr")
    @PreAuthorize("hasRole('PHUHUYNH')")
    public VietQrDTO taoQrThanhToan(
            @PathVariable Integer maHocPhi,
            @AuthenticationPrincipal TaiKhoanPrincipal principal) {
        return hocPhiService.taoQrChoPhuHuynh(maHocPhi, principal);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PhuHuynhCapTaiKhoanDTO> taoHoSo(
            @RequestBody TaoTaiKhoanPhuHuynhRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(taiKhoanPhuHuynhService.taoHoSo(request, false));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public List<ThongTinLienKetPhuHuynhDTO> layTatCa() {
        return phuHuynhService.layTatCa();
    }

    @PutMapping("/{maPhuHuynh}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public ThongTinLienKetPhuHuynhDTO capNhatHoSo(
            @PathVariable Integer maPhuHuynh,
            @RequestBody CapNhatPhuHuynhRequest request) {
        return phuHuynhService.capNhatHoSo(maPhuHuynh, request);
    }

    @GetMapping("/chua-co-tai-khoan")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PhuHuynhHoSoDTO> layChuaCoTaiKhoan() {
        return phuHuynhService.layChuaCoTaiKhoan();
    }

    @GetMapping("/{maPhuHuynh}/thong-tin-lien-ket")
    public ThongTinLienKetPhuHuynhDTO layThongTinLienKet(
            @PathVariable Integer maPhuHuynh,
            Authentication authentication) {
        return phuHuynhService.layThongTinLienKet(maPhuHuynh, authentication);
    }
}
