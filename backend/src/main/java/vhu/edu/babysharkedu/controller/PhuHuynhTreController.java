package vhu.edu.babysharkedu.controller;

import java.util.List;

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

import vhu.edu.babysharkedu.dto.CapNhatQuanHeRequest;
import vhu.edu.babysharkedu.dto.DoiTreLienKetRequest;
import vhu.edu.babysharkedu.dto.PhuHuynhTreDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhTreRequest;
import vhu.edu.babysharkedu.service.PhuHuynhTreService;

@RestController
@RequestMapping("/api/phu-huynh-tre")
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
    public PhuHuynhTreDTO taoLienKet(@RequestBody PhuHuynhTreRequest request) {
        return phuHuynhTreService.taoLienKet(request);
    }

    @GetMapping("/{maPhuHuynh}")
    public List<PhuHuynhTreDTO> layTheoPhuHuynh(
            @PathVariable Integer maPhuHuynh,
            Authentication authentication) {
        return phuHuynhTreService.layTheoPhuHuynh(maPhuHuynh, authentication);
    }

    @GetMapping("/tre/{maTre}")
    public List<PhuHuynhTreDTO> layTheoTre(
            @PathVariable Integer maTre,
            Authentication authentication) {
        return phuHuynhTreService.layTheoTre(maTre, authentication);
    }

    @PutMapping("/{maPhuHuynh}/{maTre}")
    @PreAuthorize("hasRole('ADMIN')")
    public PhuHuynhTreDTO capNhatQuanHe(
            @PathVariable Integer maPhuHuynh,
            @PathVariable Integer maTre,
            @RequestBody CapNhatQuanHeRequest request) {
        return phuHuynhTreService.capNhatQuanHe(maPhuHuynh, maTre, request);
    }

    @PutMapping("/{maPhuHuynh}/{maTre}/doi-tre")
    @PreAuthorize("hasRole('ADMIN')")
    public PhuHuynhTreDTO doiTreLienKet(
            @PathVariable Integer maPhuHuynh,
            @PathVariable Integer maTre,
            @RequestBody DoiTreLienKetRequest request) {
        return phuHuynhTreService.doiTreLienKet(maPhuHuynh, maTre, request);
    }

    @DeleteMapping("/{maPhuHuynh}/{maTre}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void huyLienKet(
            @PathVariable Integer maPhuHuynh,
            @PathVariable Integer maTre) {
        phuHuynhTreService.huyLienKet(maPhuHuynh, maTre);
    }
}
