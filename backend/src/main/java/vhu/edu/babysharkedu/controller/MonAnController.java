package vhu.edu.babysharkedu.controller;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import vhu.edu.babysharkedu.dto.CapNhatTrangThaiMonAnRequest;
import vhu.edu.babysharkedu.dto.MonAnDTO;
import vhu.edu.babysharkedu.dto.MonAnRequest;
import vhu.edu.babysharkedu.service.MonAnService;

@RestController
@RequestMapping("/api/mon-an")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class MonAnController {
    private final MonAnService monAnService;

    public MonAnController(MonAnService monAnService) {
        this.monAnService = monAnService;
    }

    @GetMapping
    public List<MonAnDTO> layTatCa(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String loaiMon,
            @RequestParam(required = false) Boolean trangThai) {
        return monAnService.layTatCa(keyword, loaiMon, trangThai);
    }

    @GetMapping("/{maMonAn}")
    public MonAnDTO layChiTiet(@PathVariable @Positive(message = "Mã món ăn phải là số nguyên dương.") Integer maMonAn) {
        return monAnService.layChiTiet(maMonAn);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MonAnDTO them(
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") MonAnRequest request) {
        return monAnService.them(request);
    }

    @PutMapping("/{maMonAn}")
    public MonAnDTO capNhat(
            @PathVariable @Positive(message = "Mã món ăn phải là số nguyên dương.") Integer maMonAn,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") MonAnRequest request) {
        return monAnService.capNhat(maMonAn, request);
    }

    @DeleteMapping("/{maMonAn}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable @Positive(message = "Mã món ăn phải là số nguyên dương.") Integer maMonAn) {
        monAnService.xoa(maMonAn);
    }

    @PatchMapping("/{maMonAn}/trang-thai")
    public MonAnDTO capNhatTrangThai(
            @PathVariable @Positive(message = "Mã món ăn phải là số nguyên dương.") Integer maMonAn,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") CapNhatTrangThaiMonAnRequest request) {
        return monAnService.capNhatTrangThai(
                maMonAn, request == null ? null : request.trangThai());
    }
}
