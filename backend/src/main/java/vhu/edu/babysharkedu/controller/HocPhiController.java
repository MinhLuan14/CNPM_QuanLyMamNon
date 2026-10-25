package vhu.edu.babysharkedu.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vhu.edu.babysharkedu.dto.GhiNhanThanhToanRequest;
import vhu.edu.babysharkedu.dto.HocPhiDTO;
import vhu.edu.babysharkedu.dto.TaoHocPhiRequest;
import vhu.edu.babysharkedu.service.HocPhiService;

@RestController
@RequestMapping("/api/hoc-phi")
@PreAuthorize("hasRole('ADMIN')")
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
    public HocPhiDTO tao(@RequestBody TaoHocPhiRequest request) {
        return hocPhiService.tao(request);
    }

    @PostMapping("/{maHocPhi}/thanh-toan")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ghiNhanThanhToan(
            @PathVariable Integer maHocPhi,
            @RequestBody GhiNhanThanhToanRequest request) {
        hocPhiService.ghiNhanThanhToan(maHocPhi, request);
    }
}