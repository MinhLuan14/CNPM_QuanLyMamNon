package vhu.edu.babysharkedu.controller;

import java.util.List;

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

import vhu.edu.babysharkedu.dto.CapNhatTrangThaiMonAnRequest;
import vhu.edu.babysharkedu.dto.MonAnDTO;
import vhu.edu.babysharkedu.dto.MonAnRequest;
import vhu.edu.babysharkedu.service.MonAnService;

@RestController
@RequestMapping("/api/mon-an")
public class MonAnController {
    private final MonAnService monAnService;

    public MonAnController(MonAnService monAnService) {
        this.monAnService = monAnService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN', 'PHUHUYNH')")
    public List<MonAnDTO> layTatCa(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String loaiMon,
            @RequestParam(required = false) Boolean trangThai) {
        return monAnService.layTatCa(keyword, loaiMon, trangThai);
    }

    @GetMapping("/{maMonAn}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN', 'PHUHUYNH')")
    public MonAnDTO layChiTiet(@PathVariable Integer maMonAn) {
        return monAnService.layChiTiet(maMonAn);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public MonAnDTO them(@RequestBody MonAnRequest request) {
        return monAnService.them(request);
    }

    @PutMapping("/{maMonAn}")
    @PreAuthorize("hasRole('ADMIN')")
    public MonAnDTO capNhat(@PathVariable Integer maMonAn, @RequestBody MonAnRequest request) {
        return monAnService.capNhat(maMonAn, request);
    }

    @DeleteMapping("/{maMonAn}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable Integer maMonAn) {
        monAnService.xoa(maMonAn);
    }

    @PatchMapping("/{maMonAn}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    public MonAnDTO capNhatTrangThai(
            @PathVariable Integer maMonAn,
            @RequestBody CapNhatTrangThaiMonAnRequest request) {
        return monAnService.capNhatTrangThai(
                maMonAn, request == null ? null : request.trangThai());
    }
}
