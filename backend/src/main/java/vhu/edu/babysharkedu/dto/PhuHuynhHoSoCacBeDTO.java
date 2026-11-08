package vhu.edu.babysharkedu.dto;

import java.util.List;

public record PhuHuynhHoSoCacBeDTO(
        PhuHuynhHoSoDTO phuHuynh,
        List<HoSoTreDTO> treEm) {
}
