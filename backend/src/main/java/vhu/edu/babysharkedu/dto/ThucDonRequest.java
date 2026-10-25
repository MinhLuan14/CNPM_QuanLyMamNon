package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;

public record ThucDonRequest(
        Integer tuanApDung,
        Integer thangApDung,
        Integer namApDung,
        LocalDate ngayBatDau,
        LocalDate ngayKetThuc,
        String ghiChu,
        Boolean trangThai) {
}
