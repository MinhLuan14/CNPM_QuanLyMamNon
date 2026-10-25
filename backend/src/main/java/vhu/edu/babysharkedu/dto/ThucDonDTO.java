package vhu.edu.babysharkedu.dto;

import java.time.LocalDate;
import java.util.List;

public record ThucDonDTO(
        Integer maThucDon,
        Integer tuanApDung,
        Integer thangApDung,
        Integer namApDung,
        LocalDate ngayBatDau,
        LocalDate ngayKetThuc,
        String ghiChu,
        Boolean trangThai,
        List<ChiTietThucDonDTO> chiTiet) {
}
