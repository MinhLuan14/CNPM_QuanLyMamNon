package vhu.edu.babysharkedu.controller;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

import vhu.edu.babysharkedu.dto.CapNhatQuanHeRequest;
import vhu.edu.babysharkedu.dto.DoiTreLienKetRequest;
import vhu.edu.babysharkedu.dto.PhuHuynhTreDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhTreRequest;
import vhu.edu.babysharkedu.service.PhuHuynhTreService;

@RestController
@RequestMapping("/api/phu-huynh-tre")
@Validated
public class PhuHuynhTreController {
    private final PhuHuynhTreService phuHuynhTreService;

    public PhuHuynhTreController(PhuHuynhTreService phuHuynhTreService) {
        this.phuHuynhTreService = phuHuynhTreService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PhuHuynhTreDTO> layTatCa() {
        return phuHuynhTreService.layTatCa();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PhuHuynhTreDTO taoLienKet(
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") PhuHuynhTreRequest request) {
        return phuHuynhTreService.taoLienKet(request);
    }

    @GetMapping("/{maPhuHuynh}")
    public List<PhuHuynhTreDTO> layTheoPhuHuynh(
            @PathVariable @Positive(message = "Mã phụ huynh phải là số nguyên dương.") Integer maPhuHuynh,
            Authentication authentication) {
        return phuHuynhTreService.layTheoPhuHuynh(maPhuHuynh, authentication);
    }

    @GetMapping("/tre/{maTre}")
    public List<PhuHuynhTreDTO> layTheoTre(
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            Authentication authentication) {
        return phuHuynhTreService.layTheoTre(maTre, authentication);
    }

    @PutMapping("/{maPhuHuynh}/{maTre}")
    @PreAuthorize("hasRole('ADMIN')")
    public PhuHuynhTreDTO capNhatQuanHe(
            @PathVariable @Positive(message = "Mã phụ huynh phải là số nguyên dương.") Integer maPhuHuynh,
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") CapNhatQuanHeRequest request) {
        return phuHuynhTreService.capNhatQuanHe(maPhuHuynh, maTre, request);
    }

    @PutMapping("/{maPhuHuynh}/{maTre}/doi-tre")
    @PreAuthorize("hasRole('ADMIN')")
    public PhuHuynhTreDTO doiTreLienKet(
            @PathVariable @Positive(message = "Mã phụ huynh phải là số nguyên dương.") Integer maPhuHuynh,
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") DoiTreLienKetRequest request) {
        return phuHuynhTreService.doiTreLienKet(maPhuHuynh, maTre, request);
    }

    @DeleteMapping("/{maPhuHuynh}/{maTre}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void huyLienKet(
            @PathVariable @Positive(message = "Mã phụ huynh phải là số nguyên dương.") Integer maPhuHuynh,
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre) {
        phuHuynhTreService.huyLienKet(maPhuHuynh, maTre);
    }
}
