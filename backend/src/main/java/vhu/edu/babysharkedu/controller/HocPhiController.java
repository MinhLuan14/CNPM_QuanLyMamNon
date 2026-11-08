package vhu.edu.babysharkedu.controller;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;
import vhu.edu.babysharkedu.dto.GhiNhanThanhToanRequest;
import vhu.edu.babysharkedu.dto.HocPhiDTO;
import vhu.edu.babysharkedu.dto.TaoHocPhiRequest;
import vhu.edu.babysharkedu.service.HocPhiService;

@RestController
@RequestMapping("/api/hoc-phi")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class HocPhiController {
    private final HocPhiService hocPhiService;

    public HocPhiController(HocPhiService hocPhiService) {
        this.hocPhiService = hocPhiService;
    }

    @GetMapping
    public List<HocPhiDTO> layTatCa() {
        return hocPhiService.layTatCa();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HocPhiDTO tao(
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") TaoHocPhiRequest request) {
        return hocPhiService.tao(request);
    }

    @PostMapping("/{maHocPhi}/thanh-toan")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ghiNhanThanhToan(
            @PathVariable @Positive(message = "Mã học phí phải là số nguyên dương.") Integer maHocPhi,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") GhiNhanThanhToanRequest request) {
        hocPhiService.ghiNhanThanhToan(maHocPhi, request);
    }
}