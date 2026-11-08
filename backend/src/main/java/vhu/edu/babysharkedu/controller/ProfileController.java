package vhu.edu.babysharkedu.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import vhu.edu.babysharkedu.dto.CapNhatProfileRequest;
import vhu.edu.babysharkedu.dto.ProfileDTO;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;
import vhu.edu.babysharkedu.service.ProfileService;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("hasAnyRole('PHUHUYNH', 'GIAOVIEN')")
@Validated
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileDTO layProfile(Authentication authentication) {
        return profileService.layProfile((TaiKhoanPrincipal) authentication.getPrincipal());
    }

    @PutMapping
    public ProfileDTO capNhatProfile(
            @Valid @RequestBody @NotNull(message = "Dữ liệu yêu cầu không được để trống.") CapNhatProfileRequest request,
            Authentication authentication) {
        return profileService.capNhatProfile(
                (TaiKhoanPrincipal) authentication.getPrincipal(), request);
    }
}
