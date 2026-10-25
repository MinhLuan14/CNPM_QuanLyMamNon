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

import vhu.edu.babysharkedu.dto.LopHocDTO;
import vhu.edu.babysharkedu.dto.LopHocRequest;
import vhu.edu.babysharkedu.dto.TreEmDTO;
import vhu.edu.babysharkedu.service.LopHocService;

@RestController
@RequestMapping("/api/lop-hoc")
public class LopHocController {
    private final LopHocService lopHocService;

    public LopHocController(LopHocService lopHocService) {
        this.lopHocService = lopHocService;
    }

    @GetMapping
    public List<LopHocDTO> layTatCa() {
        return lopHocService.layTatCa();
    }

    @GetMapping("/{id}")
    public LopHocDTO layChiTiet(@PathVariable Integer id) {
        return lopHocService.layChiTiet(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LopHocDTO them(@RequestBody LopHocRequest request) {
        return lopHocService.them(request);
    }

    @PutMapping("/{id}")
    public LopHocDTO capNhat(@PathVariable Integer id, @RequestBody LopHocRequest request) {
        return lopHocService.capNhat(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable Integer id) {
        lopHocService.xoa(id);
    }

    @GetMapping("/{id}/tre-em")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public List<TreEmDTO> layTreEm(@PathVariable Integer id) {
        return lopHocService.layTreEm(id);
    }
}
