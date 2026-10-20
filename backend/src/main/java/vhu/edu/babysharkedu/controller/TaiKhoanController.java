package vhu.edu.babysharkedu.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vhu.edu.babysharkedu.dto.MessageResponse;
import vhu.edu.babysharkedu.service.TaiKhoanService;

@RestController
@RequestMapping("/api/accounts")
@PreAuthorize("hasRole('ADMIN')")
public class TaiKhoanController {
    private final TaiKhoanService taiKhoanService;

    public TaiKhoanController(TaiKhoanService taiKhoanService) {
        this.taiKhoanService = taiKhoanService;
    }

    @PostMapping("/{maTaiKhoan}/lock")
    public MessageResponse khoaTaiKhoan(@PathVariable Integer maTaiKhoan) {
        taiKhoanService.khoaTaiKhoan(maTaiKhoan);
        return new MessageResponse("Đã khóa tài khoản.");
    }

    @PostMapping("/{maTaiKhoan}/unlock")
    public MessageResponse moKhoaTaiKhoan(@PathVariable Integer maTaiKhoan) {
        taiKhoanService.moKhoaTaiKhoan(maTaiKhoan);
        return new MessageResponse("Đã mở khóa tài khoản.");
    }
}
