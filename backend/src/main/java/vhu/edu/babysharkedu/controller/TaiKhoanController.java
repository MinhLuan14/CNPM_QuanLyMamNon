package vhu.edu.babysharkedu.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vhu.edu.babysharkedu.dto.CapNhatTrangThaiTaiKhoanRequest;
import vhu.edu.babysharkedu.dto.KiemTraTenDangNhapDTO;
import vhu.edu.babysharkedu.dto.KiemTraTenDangNhapRequest;
import vhu.edu.babysharkedu.dto.MessageResponse;
import vhu.edu.babysharkedu.dto.TaiKhoanPhuHuynhDTO;
import vhu.edu.babysharkedu.dto.TaiKhoanDanhSachDTO;
import vhu.edu.babysharkedu.dto.TaiKhoanMatKhauTamThoiDTO;
import vhu.edu.babysharkedu.dto.PhuHuynhCapTaiKhoanDTO;
import vhu.edu.babysharkedu.dto.TaoTaiKhoanPhuHuynhRequest;
import vhu.edu.babysharkedu.service.PhuHuynhService;
import vhu.edu.babysharkedu.service.TaiKhoanPhuHuynhService;
import vhu.edu.babysharkedu.service.TaiKhoanService;

@RestController
@RequestMapping("/api")
public class TaiKhoanController {
    private final TaiKhoanService taiKhoanService;
    private final TaiKhoanPhuHuynhService taiKhoanPhuHuynhService;
    private final PhuHuynhService phuHuynhService;

    public TaiKhoanController(
            TaiKhoanService taiKhoanService,
            TaiKhoanPhuHuynhService taiKhoanPhuHuynhService,
            PhuHuynhService phuHuynhService) {
        this.taiKhoanService = taiKhoanService;
        this.taiKhoanPhuHuynhService = taiKhoanPhuHuynhService;
        this.phuHuynhService = phuHuynhService;
    }

    @GetMapping("/tai-khoan")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.List<TaiKhoanDanhSachDTO> layDanhSachTaiKhoan() {
        return taiKhoanService.layDanhSachTaiKhoan();
    }

    @PostMapping("/accounts/{maTaiKhoan}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public MessageResponse khoaTaiKhoan(@PathVariable Integer maTaiKhoan) {
        taiKhoanService.khoaTaiKhoan(maTaiKhoan);
        return new MessageResponse("Đã khóa tài khoản.");
    }

    @PostMapping("/accounts/{maTaiKhoan}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public MessageResponse moKhoaTaiKhoan(@PathVariable Integer maTaiKhoan) {
        taiKhoanService.moKhoaTaiKhoan(maTaiKhoan);
        return new MessageResponse("Đã mở khóa tài khoản.");
    }

    @PostMapping("/tai-khoan/{maTaiKhoan}/cap-lai-mat-khau")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaiKhoanMatKhauTamThoiDTO> capLaiMatKhau(
            @PathVariable Integer maTaiKhoan) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(taiKhoanService.capLaiMatKhauTamThoi(maTaiKhoan));
    }

    @PostMapping("/tai-khoan/phu-huynh")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PhuHuynhCapTaiKhoanDTO> taoTaiKhoanVaHoSo(
            @RequestBody TaoTaiKhoanPhuHuynhRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(taiKhoanPhuHuynhService.taoHoSo(request, true));
    }

    @PostMapping("/tai-khoan/phu-huynh/{maPhuHuynh}/cap-tai-khoan")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PhuHuynhCapTaiKhoanDTO> capTaiKhoan(@PathVariable Integer maPhuHuynh) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(taiKhoanPhuHuynhService.capTaiKhoan(maPhuHuynh));
    }

    @GetMapping("/tai-khoan/phu-huynh/{maPhuHuynh}")
    public TaiKhoanPhuHuynhDTO layTinhTrangTaiKhoan(
            @PathVariable Integer maPhuHuynh,
            Authentication authentication) {
        return phuHuynhService.layTinhTrangTaiKhoan(maPhuHuynh, authentication);
    }

    @PatchMapping("/tai-khoan/{maTaiKhoan}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    public MessageResponse capNhatTrangThai(
            @PathVariable Integer maTaiKhoan,
            @RequestBody CapNhatTrangThaiTaiKhoanRequest request) {
        taiKhoanPhuHuynhService.capNhatTrangThai(
                maTaiKhoan, request == null ? null : request.trangThai());
        return new MessageResponse("Đã cập nhật trạng thái tài khoản.");
    }

    @PostMapping("/tai-khoan/kiem-tra-ten-dang-nhap")
    @PreAuthorize("hasRole('ADMIN')")
    public KiemTraTenDangNhapDTO kiemTraTenDangNhap(@RequestBody KiemTraTenDangNhapRequest request) {
        return taiKhoanPhuHuynhService.kiemTraTenDangNhap(
                request == null ? null : request.tenDangNhap());
    }
}
