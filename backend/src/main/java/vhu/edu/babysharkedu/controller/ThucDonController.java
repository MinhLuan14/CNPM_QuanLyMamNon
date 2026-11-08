package vhu.edu.babysharkedu.controller;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import vhu.edu.babysharkedu.dto.ChiTietThucDonDTO;
import vhu.edu.babysharkedu.dto.ChiTietThucDonRequest;
import vhu.edu.babysharkedu.dto.ThucDonDTO;
import vhu.edu.babysharkedu.dto.ThucDonRequest;
import vhu.edu.babysharkedu.service.ThucDonService;

@RestController
@RequestMapping("/api/thuc-don")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class ThucDonController {
    private final ThucDonService thucDonService;

    public ThucDonController(ThucDonService thucDonService) {
        this.thucDonService = thucDonService;
    }

    @GetMapping
    public List<ThucDonDTO> layTatCa() {
        return thucDonService.layTatCa();
    }

    @GetMapping("/{maThucDon}")
    public ThucDonDTO layChiTiet(@PathVariable @Positive(message = "Mã thực đơn phải là số nguyên dương.") Integer maThucDon) {
        return thucDonService.layChiTiet(maThucDon);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ThucDonDTO them(
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") ThucDonRequest request) {
        return thucDonService.them(request);
    }

    @PutMapping("/{maThucDon}")
    public ThucDonDTO capNhat(
            @PathVariable @Positive(message = "Mã thực đơn phải là số nguyên dương.") Integer maThucDon,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") ThucDonRequest request) {
        return thucDonService.capNhat(maThucDon, request);
    }

    @DeleteMapping("/{maThucDon}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable @Positive(message = "Mã thực đơn phải là số nguyên dương.") Integer maThucDon) {
        thucDonService.xoa(maThucDon);
    }

    @PostMapping("/{maThucDon}/chi-tiet")
    @ResponseStatus(HttpStatus.CREATED)
    public ChiTietThucDonDTO themMon(
            @PathVariable @Positive(message = "Mã thực đơn phải là số nguyên dương.") Integer maThucDon,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") ChiTietThucDonRequest request) {
        return thucDonService.themMon(maThucDon, request);
    }

    @PutMapping("/{maThucDon}/chi-tiet/{maChiTietThucDon}")
    public ChiTietThucDonDTO capNhatMon(
            @PathVariable @Positive(message = "Mã thực đơn phải là số nguyên dương.") Integer maThucDon,
            @PathVariable @Positive(message = "Mã chi tiết thực đơn phải là số nguyên dương.") Integer maChiTietThucDon,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") ChiTietThucDonRequest request) {
        return thucDonService.capNhatMon(maThucDon, maChiTietThucDon, request);
    }

    @DeleteMapping("/{maThucDon}/chi-tiet/{maChiTietThucDon}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoaMon(
            @PathVariable @Positive(message = "Mã thực đơn phải là số nguyên dương.") Integer maThucDon,
            @PathVariable @Positive(message = "Mã chi tiết thực đơn phải là số nguyên dương.") Integer maChiTietThucDon) {
        thucDonService.xoaMon(maThucDon, maChiTietThucDon);
    }
}
