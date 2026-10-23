package vhu.edu.babysharkedu.dto;

import java.util.List;
import java.util.Map;

public record TreEmThongKeDTO(
        long tongSoTre,
        Map<String, Long> theoTrangThai,
        Map<String, Long> theoDoTuoi,
        List<ThongKeTreTheoLopDTO> theoLop) {

    public record ThongKeTreTheoLopDTO(Integer maLopHoc, String tenLopHoc, long soTre) {
    }
}
