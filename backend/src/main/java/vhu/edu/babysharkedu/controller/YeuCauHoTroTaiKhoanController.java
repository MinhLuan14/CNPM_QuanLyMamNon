package vhu.edu.babysharkedu.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vhu.edu.babysharkedu.dto.CapNhatYeuCauHoTroRequest;
import vhu.edu.babysharkedu.dto.MatKhauTamThoiDTO;
import vhu.edu.babysharkedu.dto.YeuCauHoTroTaiKhoanDTO;
import vhu.edu.babysharkedu.service.YeuCauHoTroTaiKhoanService;

@RestController
@RequestMapping("/api/yeu-cau-ho-tro")
@PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
public class YeuCauHoTroTaiKhoanController {
    private final YeuCauHoTroTaiKhoanService yeuCauService;

    public YeuCauHoTroTaiKhoanController(YeuCauHoTroTaiKhoanService yeuCauService) {
        this.yeuCauService = yeuCauService;
    }

    @GetMapping
    public List<YeuCauHoTroTaiKhoanDTO> layTatCa() {
        return yeuCauService.layTatCa();
    }

    @GetMapping("/{maYeuCau}")
    public YeuCauHoTroTaiKhoanDTO layChiTiet(@PathVariable Integer maYeuCau) {
        return yeuCauService.layChiTiet(maYeuCau);
    }

    @PatchMapping("/{maYeuCau}")
    public YeuCauHoTroTaiKhoanDTO capNhat(
            @PathVariable Integer maYeuCau,
            @RequestBody CapNhatYeuCauHoTroRequest request,
            Authentication authentication) {
        return yeuCauService.capNhat(maYeuCau, request, authentication);
    }

    @PostMapping("/{maYeuCau}/cap-lai-mat-khau")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatKhauTamThoiDTO> capLaiMatKhau(
            @PathVariable Integer maYeuCau,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(yeuCauService.capLaiMatKhau(maYeuCau, authentication));
    }
}
