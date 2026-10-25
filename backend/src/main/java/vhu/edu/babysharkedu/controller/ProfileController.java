package vhu.edu.babysharkedu.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vhu.edu.babysharkedu.dto.CapNhatProfileRequest;
import vhu.edu.babysharkedu.dto.ProfileDTO;
import vhu.edu.babysharkedu.security.TaiKhoanPrincipal;
import vhu.edu.babysharkedu.service.ProfileService;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("hasAnyRole('PHUHUYNH', 'GIAOVIEN')")
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
            @RequestBody CapNhatProfileRequest request,
            Authentication authentication) {
        return profileService.capNhatProfile(
                (TaiKhoanPrincipal) authentication.getPrincipal(), request);
    }
}
