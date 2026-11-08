package vhu.edu.babysharkedu.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
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

import vhu.edu.babysharkedu.dto.CapNhatTrangThaiTreRequest;
import vhu.edu.babysharkedu.dto.MessageResponse;
import vhu.edu.babysharkedu.dto.PhanLopRequest;
import vhu.edu.babysharkedu.dto.TreEmDTO;
import vhu.edu.babysharkedu.dto.TreEmRequest;
import vhu.edu.babysharkedu.dto.TreEmThongKeDTO;
import vhu.edu.babysharkedu.service.TreEmService;
import vhu.edu.babysharkedu.service.AnhDaiDienService;
import vhu.edu.babysharkedu.service.AnhDaiDienService.HinhAnh;

@RestController
@RequestMapping("/api/tre-em")
@Validated
public class TreEmController {
    private final TreEmService treEmService;
    private final AnhDaiDienService anhDaiDienService;

    public TreEmController(TreEmService treEmService, AnhDaiDienService anhDaiDienService) {
        this.treEmService = treEmService;
        this.anhDaiDienService = anhDaiDienService;
    }

    @GetMapping
    public List<TreEmDTO> layTatCa(Authentication authentication) {
        return treEmService.layTatCa(authentication);
    }

    @GetMapping("/tim-kiem")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public List<TreEmDTO> timKiem(
            @RequestParam @NotBlank(message = "Từ khóa tìm kiếm không được để trống.") String keyword,
            Authentication authentication) {
        return treEmService.timKiem(keyword, authentication);
    }

    @GetMapping("/chua-phan-lop")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public List<TreEmDTO> layChuaPhanLop() {
        return treEmService.layChuaPhanLop();
    }

    @GetMapping("/chua-lien-ket/{maPhuHuynh}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TreEmDTO> layChuaLienKet(
            @PathVariable @Positive(message = "Mã phụ huynh phải là số nguyên dương.") Integer maPhuHuynh) {
        return treEmService.layTreChuaLienKet(maPhuHuynh);
    }

    @GetMapping("/thong-ke")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public TreEmThongKeDTO thongKe() {
        return treEmService.thongKe();
    }

    @GetMapping("/lop/{maLopHoc}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public List<TreEmDTO> layTheoLop(
            @PathVariable @Positive(message = "Mã lớp học phải là số nguyên dương.") Integer maLopHoc,
            Authentication authentication) {
        return treEmService.layTheoLop(maLopHoc, authentication);
    }

    @GetMapping("/{maTre}")
    public TreEmDTO layChiTiet(
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            Authentication authentication) {
        return treEmService.layChiTiet(maTre, authentication);
    }

    @GetMapping("/{maTre}/anh-dai-dien")
    public ResponseEntity<org.springframework.core.io.Resource> layAnhDaiDien(
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            Authentication authentication) {
        TreEmDTO treEm = treEmService.layChiTiet(maTre, authentication);
        HinhAnh image = anhDaiDienService.layAnhTreEm(treEm.maTre());
        return ResponseEntity.ok()
                .contentType(image.mediaType())
                .cacheControl(CacheControl.noCache())
                .header("X-Content-Type-Options", "nosniff")
                .body(image.resource());
    }

    @PostMapping(value = "/{maTre}/anh-dai-dien", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public Map<String, String> capNhatAnhDaiDien(
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            @RequestPart("file") MultipartFile file) {
        anhDaiDienService.capNhatAnhTreEm(maTre, file);
        return Map.of("anhDaiDien", "/api/tre-em/" + maTre + "/anh-dai-dien");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    @ResponseStatus(HttpStatus.CREATED)
    public TreEmDTO them(
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") TreEmRequest request) {
        return treEmService.them(request);
    }

    @PutMapping("/{maTre}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public TreEmDTO capNhat(
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") TreEmRequest request) {
        return treEmService.capNhat(maTre, request);
    }

    @DeleteMapping("/{maTre}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre) {
        treEmService.xoa(maTre);
    }

    @PutMapping("/{maTre}/phan-lop")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public TreEmDTO phanLop(
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") PhanLopRequest request) {
        return treEmService.phanLop(maTre, request);
    }

    @PutMapping("/{maTre}/chuyen-lop")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public TreEmDTO chuyenLop(
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") PhanLopRequest request) {
        return treEmService.chuyenLop(maTre, request);
    }

    @PatchMapping("/{maTre}/trang-thai")
    @PreAuthorize("hasAnyRole('ADMIN', 'GIAOVIEN')")
    public TreEmDTO capNhatTrangThai(
            @PathVariable @Positive(message = "Mã trẻ phải là số nguyên dương.") Integer maTre,
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") CapNhatTrangThaiTreRequest request) {
        return treEmService.capNhatTrangThai(maTre, request);
    }
}
