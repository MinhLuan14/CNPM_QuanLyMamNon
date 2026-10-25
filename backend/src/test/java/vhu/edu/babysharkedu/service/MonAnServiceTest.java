package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.MonAnRequest;
import vhu.edu.babysharkedu.model.MonAn;
import vhu.edu.babysharkedu.repository.ChiTietThucDonRepository;
import vhu.edu.babysharkedu.repository.MonAnRepository;

class MonAnServiceTest {
    private MonAnRepository monAnRepository;
    private ChiTietThucDonRepository chiTietRepository;
    private MonAnService service;

    @BeforeEach
    void setUp() {
        monAnRepository = mock(MonAnRepository.class);
        chiTietRepository = mock(ChiTietThucDonRepository.class);
        service = new MonAnService(monAnRepository, chiTietRepository);
    }

    @Test
    void createsFoodWithIdentityAndDefaultActiveStatus() {
        when(monAnRepository.save(any(MonAn.class))).thenAnswer(invocation -> {
            MonAn food = invocation.getArgument(0);
            food.setMaMonAn(25);
            return food;
        });

        var result = service.them(new MonAnRequest(
                "Cháo cá", "Bữa sáng", "Cá, gạo", new BigDecimal("12000.00"), null));

        assertEquals(25, result.maMonAn());
        assertEquals("Cháo cá", result.tenMonAn());
        assertEquals(new BigDecimal("12000.00"), result.donGia());
        assertEquals(Boolean.TRUE, result.trangThai());
    }

    @Test
    void trimsNewFoodNameAndChecksCaseInsensitiveDuplicate() {
        when(monAnRepository.demTenMonAnChuanHoa("cháo thịt bằm")).thenReturn(0L);
        when(monAnRepository.save(any(MonAn.class))).thenAnswer(invocation -> {
            MonAn food = invocation.getArgument(0);
            food.setMaMonAn(27);
            return food;
        });

        var result = service.them(new MonAnRequest(
                "  Cháo thịt bằm  ", "Món sáng", null, new BigDecimal("12000"), null));

        assertEquals("Cháo thịt bằm", result.tenMonAn());
        verify(monAnRepository).demTenMonAnChuanHoa("cháo thịt bằm");
    }

    @Test
    void rejectsExistingFoodNameIgnoringCaseAndSurroundingWhitespace() {
        when(monAnRepository.demTenMonAnChuanHoa("cháo thịt bằm")).thenReturn(1L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.them(new MonAnRequest(
                        " cháo thịt bằm ", "Món sáng", null, new BigDecimal("12000"), null)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals(
                "Tên món ăn đã tồn tại. Vui lòng nhập tên món ăn khác.",
                exception.getReason());
        verify(monAnRepository, never()).save(any(MonAn.class));
    }

    @Test
    void allowsUpdatingFoodWithoutTreatingItselfAsDuplicate() {
        MonAn food = new MonAn();
        food.setMaMonAn(26);
        when(monAnRepository.findById(26)).thenReturn(Optional.of(food));
        when(monAnRepository.demTenMonAnChuanHoaKhacMa("cháo cá", 26)).thenReturn(0L);
        when(monAnRepository.save(food)).thenReturn(food);

        var result = service.capNhat(26, new MonAnRequest(
                "Cháo cá", "Món sáng", null, new BigDecimal("15000"), null));

        assertEquals("Cháo cá", result.tenMonAn());
        assertEquals(new BigDecimal("15000.00"), result.donGia());
        verify(monAnRepository).demTenMonAnChuanHoaKhacMa("cháo cá", 26);
    }

    @Test
    void rejectsUpdatingFoodToAnotherFoodsName() {
        MonAn food = new MonAn();
        food.setMaMonAn(26);
        when(monAnRepository.findById(26)).thenReturn(Optional.of(food));
        when(monAnRepository.demTenMonAnChuanHoaKhacMa("cháo thịt bằm", 26)).thenReturn(1L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.capNhat(26, new MonAnRequest(
                        "CHÁO THỊT BẰM", "Món sáng", null, new BigDecimal("12000"), null)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(monAnRepository, never()).save(any(MonAn.class));
    }

    @Test
    void rejectsBlankFoodName() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.them(new MonAnRequest("   ", "Món sáng", null, new BigDecimal("12000"), null)));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(monAnRepository, never()).demTenMonAnChuanHoa(any());
    }

    @Test
    void rejectsMissingNegativeAndOutOfRangePrices() {
        for (BigDecimal price : new BigDecimal[] {
                null,
                new BigDecimal("-0.01"),
                new BigDecimal("10000000000.00"),
                new BigDecimal("12.345")
        }) {
            ResponseStatusException exception = assertThrows(
                    ResponseStatusException.class,
                    () -> service.them(new MonAnRequest("Món hợp lệ", "Món chính", null, price, null)));
            assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        }
        verify(monAnRepository, never()).demTenMonAnChuanHoa(any());
    }

    @Test
    void deletesFoodWhenItIsNotReferenced() {
        MonAn food = new MonAn();
        food.setMaMonAn(28);
        when(monAnRepository.findById(28)).thenReturn(Optional.of(food));
        when(chiTietRepository.existsByMonAnMaMonAn(28)).thenReturn(false);

        service.xoa(28);

        verify(monAnRepository).delete(food);
        verify(monAnRepository).flush();
    }

    @Test
    void refusesToDeleteFoodReferencedByMenuDetails() {
        MonAn food = new MonAn();
        food.setMaMonAn(29);
        when(monAnRepository.findById(29)).thenReturn(Optional.of(food));
        when(chiTietRepository.existsByMonAnMaMonAn(29)).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.xoa(29));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals(
                "Không thể xóa món ăn này vì đang được sử dụng trong thực đơn.",
                exception.getReason());
        verify(monAnRepository, never()).delete(any(MonAn.class));
    }

    @Test
    void returnsNotFoundWhenDeletingMissingFood() {
        when(monAnRepository.findById(404)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.xoa(404));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(chiTietRepository, never()).existsByMonAnMaMonAn(404);
        verify(monAnRepository, never()).delete(any(MonAn.class));
    }

    @Test
    void translatesForeignKeyRaceIntoConflict() {
        MonAn food = new MonAn();
        food.setMaMonAn(30);
        when(monAnRepository.findById(30)).thenReturn(Optional.of(food));
        when(chiTietRepository.existsByMonAnMaMonAn(30)).thenReturn(false);
        org.mockito.Mockito.doThrow(new DataIntegrityViolationException("foreign key"))
                .when(monAnRepository).flush();

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.xoa(30));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals(
                "Không thể xóa món ăn này vì đang được sử dụng trong thực đơn.",
                exception.getReason());
    }

    @Test
    void preservesNullableStatusWhenUpdatingExistingFood() {
        MonAn food = new MonAn();
        food.setMaMonAn(26);
        food.setTrangThai(null);
        when(monAnRepository.findById(26)).thenReturn(Optional.of(food));
        when(monAnRepository.save(food)).thenReturn(food);

        var result = service.capNhat(26, new MonAnRequest(
                "Cháo cá", null, null, new BigDecimal("12000"), null));

        assertNull(result.trangThai());
        assertNull(result.loaiMon());
    }
}
