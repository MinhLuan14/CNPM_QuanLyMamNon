package vhu.edu.babysharkedu.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;

import vhu.edu.babysharkedu.dto.GiaoVienDTO;
import vhu.edu.babysharkedu.dto.GiaoVienRequest;
import vhu.edu.babysharkedu.dto.GiaoVienTaoDTO;
import vhu.edu.babysharkedu.dto.PhanCongGiaoVienRequest;
import vhu.edu.babysharkedu.service.GiaoVienService;
import vhu.edu.babysharkedu.service.AnhDaiDienService;
import vhu.edu.babysharkedu.service.AnhDaiDienService.HinhAnh;

@RestController
@RequestMapping("/api/giao-vien")
@PreAuthorize("hasRole('ADMIN')")
public class GiaoVienController {
    private final GiaoVienService giaoVienService;
    private final AnhDaiDienService anhDaiDienService;

    public GiaoVienController(GiaoVienService giaoVienService, AnhDaiDienService anhDaiDienService) {
        this.giaoVienService = giaoVienService;
        this.anhDaiDienService = anhDaiDienService;
    }

    @GetMapping
    public List<GiaoVienDTO> layTatCa() {
        return giaoVienService.layTatCa();
    }

    @GetMapping("/{maGiaoVien}")
    public GiaoVienDTO layChiTiet(@PathVariable Integer maGiaoVien) {
        return giaoVienService.layChiTiet(maGiaoVien);
    }

    @GetMapping("/{maGiaoVien}/anh-dai-dien")
    public ResponseEntity<Resource> layAnhDaiDien(@PathVariable Integer maGiaoVien) {
        HinhAnh image = anhDaiDienService.layAnhGiaoVien(maGiaoVien);
        return ResponseEntity.ok()
                .contentType(image.mediaType())
                .cacheControl(CacheControl.noCache())
                .header("X-Content-Type-Options", "nosniff")
                .body(image.resource());
    }

    @PostMapping(value = "/{maGiaoVien}/anh-dai-dien", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> capNhatAnhDaiDien(
            @PathVariable Integer maGiaoVien,
            @RequestPart("file") MultipartFile file) {
        anhDaiDienService.capNhatAnhGiaoVien(maGiaoVien, file);
        return Map.of("anhDaiDien", "/api/giao-vien/" + maGiaoVien + "/anh-dai-dien");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GiaoVienTaoDTO them(@RequestBody GiaoVienRequest request) {
        return giaoVienService.them(request);
    }

    @PutMapping("/{maGiaoVien}")
    public GiaoVienDTO capNhat(
            @PathVariable Integer maGiaoVien,
            @RequestBody GiaoVienRequest request) {
        return giaoVienService.capNhat(maGiaoVien, request);
    }

    @PostMapping("/{maGiaoVien}/phan-cong")
    @ResponseStatus(HttpStatus.CREATED)
    public GiaoVienDTO themPhanCong(
            @PathVariable Integer maGiaoVien,
            @RequestBody PhanCongGiaoVienRequest request) {
        return giaoVienService.themPhanCong(maGiaoVien, request);
    }

    @PutMapping("/{maGiaoVien}/phan-cong/{maLopHoc}")
    public GiaoVienDTO capNhatVaiTroPhanCong(
            @PathVariable Integer maGiaoVien,
            @PathVariable Integer maLopHoc,
            @RequestBody PhanCongGiaoVienRequest request) {
        return giaoVienService.capNhatVaiTroPhanCong(maGiaoVien, maLopHoc, request);
    }

    @PatchMapping("/{maGiaoVien}/phan-cong/{maLopHoc}/ket-thuc")
    public GiaoVienDTO ketThucPhanCong(
            @PathVariable Integer maGiaoVien,
            @PathVariable Integer maLopHoc) {
        return giaoVienService.ketThucPhanCong(maGiaoVien, maLopHoc);
    }
}
