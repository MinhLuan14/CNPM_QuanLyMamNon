package vhu.edu.babysharkedu.controller;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import vhu.edu.babysharkedu.dto.CapNhatPhuHuynhRequest;
import vhu.edu.babysharkedu.dto.PhuHuynhHoSoDTO;
import vhu.edu.babysharkedu.dto.TaiKhoanPhuHuynhDTO;
import vhu.edu.babysharkedu.dto.ThongTinLienKetPhuHuynhDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhCapTaiKhoanDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhHocPhiDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhHoSoCacBeDTO;
import vhu.edu.babysharkedu.dto.ThucDonDTO;
import vhu.edu.babysharkedu.dto.TaoTaiKhoanPhuHuynhRequest;
import vhu.edu.babysharkedu.dto.VietQrDTO;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;
import vhu.edu.babysharkedu.service.HocPhiService;
import vhu.edu.babysharkedu.service.PhuHuynhService;
import vhu.edu.babysharkedu.service.ProfileService;
import vhu.edu.babysharkedu.service.TaiKhoanPhuHuynhService;
import vhu.edu.babysharkedu.service.ThucDonService;

@RestController
@RequestMapping("/api/phu-huynh")
@Validated
public class PhuHuynhController {
    private final PhuHuynhService phuHuynhService;
    private final TaiKhoanPhuHuynhService taiKhoanPhuHuynhService;
    private final HocPhiService hocPhiService;
    private final ProfileService profileService;
    private final ThucDonService thucDonService;

    public PhuHuynhController(
            PhuHuynhService phuHuynhService,
            TaiKhoanPhuHuynhService taiKhoanPhuHuynhService,
            HocPhiService hocPhiService,
            ProfileService profileService,
            ThucDonService thucDonService) {
        this.phuHuynhService = phuHuynhService;
        this.taiKhoanPhuHuynhService = taiKhoanPhuHuynhService;
        this.hocPhiService = hocPhiService;
        this.profileService = profileService;
        this.thucDonService = thucDonService;
    }

    @GetMapping("/ho-so-cac-be")
    @PreAuthorize("hasRole('PHUHUYNH')")
    public ResponseEntity<PhuHuynhHoSoCacBeDTO> layHoSoCacBe(
            @AuthenticationPrincipal TaiKhoanPrincipal principal) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(profileService.layHoSoCacBe(principal));
    }

    @GetMapping("/hoc-phi")
    @PreAuthorize("hasRole('PHUHUYNH')")
    public List<PhuHuynhHocPhiDTO> layHocPhiCuaMinh(
            @AuthenticationPrincipal TaiKhoanPrincipal principal) {
        return hocPhiService.layTheoPhuHuynh(principal);
    }

    @GetMapping("/thuc-don")
    @PreAuthorize("hasRole('PHUHUYNH')")
    public ResponseEntity<List<ThucDonDTO>> layThucDonDaCongKhai(
            @RequestParam @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            @AuthenticationPrincipal TaiKhoanPrincipal principal) {
        profileService.kiemTraTreDuocLienKet(principal, maTre);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(thucDonService.layTatCaDaCongKhai());
    }

    @PostMapping("/hoc-phi/{maHocPhi}/vietqr")
    @PreAuthorize("hasRole('PHUHUYNH')")
    public VietQrDTO taoQrThanhToan(
            @PathVariable @Positive(message = "Mã học phí phải là số nguyên dương.") Integer maHocPhi,
            @AuthenticationPrincipal TaiKhoanPrincipal principal) {
        return hocPhiService.taoQrChoPhuHuynh(maHocPhi, principal);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PhuHuynhCapTaiKhoanDTO> taoHoSo(
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") TaoTaiKhoanPhuHuynhRequest request) {
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
            @PathVariable @Positive(message = "Mã phụ huynh phải là số nguyên dương.") Integer maPhuHuynh,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") CapNhatPhuHuynhRequest request) {
        return phuHuynhService.capNhatHoSo(maPhuHuynh, request);
    }

    @GetMapping("/chua-co-tai-khoan")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PhuHuynhHoSoDTO> layChuaCoTaiKhoan() {
        return phuHuynhService.layChuaCoTaiKhoan();
    }

    @GetMapping("/{maPhuHuynh}/thong-tin-lien-ket")
    public ThongTinLienKetPhuHuynhDTO layThongTinLienKet(
            @PathVariable @Positive(message = "Mã phụ huynh phải là số nguyên dương.") Integer maPhuHuynh,
            Authentication authentication) {
        return phuHuynhService.layThongTinLienKet(maPhuHuynh, authentication);
    }
}
