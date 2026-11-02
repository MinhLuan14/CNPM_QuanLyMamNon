package vhu.edu.babysharkedu.controller;

import java.util.List;

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

import vhu.edu.babysharkedu.dto.ChiTietThucDonDTO;
import vhu.edu.babysharkedu.dto.ChiTietThucDonRequest;
import vhu.edu.babysharkedu.dto.ThucDonDTO;
import vhu.edu.babysharkedu.dto.ThucDonRequest;
import vhu.edu.babysharkedu.service.ThucDonService;

@RestController
@RequestMapping("/api/thuc-don")
public class ThucDonController {
    private final ThucDonService thucDonService;

    public ThucDonController(ThucDonService thucDonService) {
        this.thucDonService = thucDonService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN', 'PHUHUYNH')")
    public List<ThucDonDTO> layTatCa() {
        return thucDonService.layTatCa();
    }

    @GetMapping("/{maThucDon}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN', 'PHUHUYNH')")
    public ThucDonDTO layChiTiet(@PathVariable Integer maThucDon) {
        return thucDonService.layChiTiet(maThucDon);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ThucDonDTO them(@RequestBody ThucDonRequest request) {
        return thucDonService.them(request);
    }

    @PutMapping("/{maThucDon}")
    @PreAuthorize("hasRole('ADMIN')")
    public ThucDonDTO capNhat(
            @PathVariable Integer maThucDon,
            @RequestBody ThucDonRequest request) {
        return thucDonService.capNhat(maThucDon, request);
    }

    @DeleteMapping("/{maThucDon}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable Integer maThucDon) {
        thucDonService.xoa(maThucDon);
    }

    @PostMapping("/{maThucDon}/chi-tiet")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ChiTietThucDonDTO themMon(
            @PathVariable Integer maThucDon,
            @RequestBody ChiTietThucDonRequest request) {
        return thucDonService.themMon(maThucDon, request);
    }

    @PutMapping("/{maThucDon}/chi-tiet/{maChiTietThucDon}")
    @PreAuthorize("hasRole('ADMIN')")
    public ChiTietThucDonDTO capNhatMon(
            @PathVariable Integer maThucDon,
            @PathVariable Integer maChiTietThucDon,
            @RequestBody ChiTietThucDonRequest request) {
        return thucDonService.capNhatMon(maThucDon, maChiTietThucDon, request);
    }

    @DeleteMapping("/{maThucDon}/chi-tiet/{maChiTietThucDon}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoaMon(
            @PathVariable Integer maThucDon,
            @PathVariable Integer maChiTietThucDon) {
        thucDonService.xoaMon(maThucDon, maChiTietThucDon);
    }
}
