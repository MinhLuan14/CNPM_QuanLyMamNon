package vhu.edu.babysharkedu.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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

import vhu.edu.babysharkedu.dto.CapNhatTrangThaiTreRequest;
import vhu.edu.babysharkedu.dto.MessageResponse;
import vhu.edu.babysharkedu.dto.PhanLopRequest;
import vhu.edu.babysharkedu.dto.TreEmDTO;
import vhu.edu.babysharkedu.dto.TreEmRequest;
import vhu.edu.babysharkedu.dto.TreEmThongKeDTO;
import vhu.edu.babysharkedu.service.TreEmService;

@RestController
@RequestMapping("/api/tre-em")
public class TreEmController {
    private final TreEmService treEmService;

    public TreEmController(TreEmService treEmService) {
        this.treEmService = treEmService;
    }

    @GetMapping
    public List<TreEmDTO> layTatCa() {
        return treEmService.layTatCa();
    }

    @GetMapping("/tim-kiem")
    public List<TreEmDTO> timKiem(@RequestParam String keyword) {
        return treEmService.timKiem(keyword);
    }

    @GetMapping("/chua-phan-lop")
    public List<TreEmDTO> layChuaPhanLop() {
        return treEmService.layChuaPhanLop();
    }

    @GetMapping("/thong-ke")
    public TreEmThongKeDTO thongKe() {
        return treEmService.thongKe();
    }

    @GetMapping("/lop/{maLopHoc}")
    public List<TreEmDTO> layTheoLop(@PathVariable Integer maLopHoc) {
        return treEmService.layTheoLop(maLopHoc);
    }

    @GetMapping("/{maTre}")
    public TreEmDTO layChiTiet(@PathVariable Integer maTre) {
        return treEmService.layChiTiet(maTre);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TreEmDTO them(@RequestBody TreEmRequest request) {
        return treEmService.them(request);
    }

    @PutMapping("/{maTre}")
    public TreEmDTO capNhat(@PathVariable Integer maTre, @RequestBody TreEmRequest request) {
        return treEmService.capNhat(maTre, request);
    }

    @DeleteMapping("/{maTre}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable Integer maTre) {
        treEmService.xoa(maTre);
    }

    @PutMapping("/{maTre}/phan-lop")
    public TreEmDTO phanLop(@PathVariable Integer maTre, @RequestBody PhanLopRequest request) {
        return treEmService.phanLop(maTre, request);
    }

    @PutMapping("/{maTre}/chuyen-lop")
    public TreEmDTO chuyenLop(@PathVariable Integer maTre, @RequestBody PhanLopRequest request) {
        return treEmService.chuyenLop(maTre, request);
    }

    @PatchMapping("/{maTre}/trang-thai")
    public TreEmDTO capNhatTrangThai(
            @PathVariable Integer maTre,
            @RequestBody CapNhatTrangThaiTreRequest request) {
        return treEmService.capNhatTrangThai(maTre, request);
    }
}
