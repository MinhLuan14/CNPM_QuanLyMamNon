package vhu.edu.babysharkedu.controller;

import java.util.List;

import jakarta.validation.constraints.Positive;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vhu.edu.babysharkedu.dto.ThucDonDTO;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;
import vhu.edu.babysharkedu.service.GiaoVienThucDonService;

@RestController
@RequestMapping("/api/giao-vien/thuc-don")
@PreAuthorize("hasRole('GIAOVIEN')")
@Validated
public class GiaoVienThucDonController {
    private final GiaoVienThucDonService giaoVienThucDonService;

    public GiaoVienThucDonController(GiaoVienThucDonService giaoVienThucDonService) {
        this.giaoVienThucDonService = giaoVienThucDonService;
    }

    @GetMapping
    public ResponseEntity<List<ThucDonDTO>> layTheoLop(
            @RequestParam @Positive(message = "Mã lớp học phải là số nguyên dương.") Integer maLopHoc,
            @AuthenticationPrincipal TaiKhoanPrincipal principal) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(giaoVienThucDonService.layTheoLop(principal, maLopHoc));
    }
}
