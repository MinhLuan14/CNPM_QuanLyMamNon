package vhu.edu.babysharkedu.dto;

import java.util.List;

public record ThongTinLienKetPhuHuynhDTO(
        PhuHuynhHoSoDTO phuHuynh,
        TaiKhoanPhuHuynhDTO taiKhoan,
        List<PhuHuynhTreDTO> treEm) {
}
