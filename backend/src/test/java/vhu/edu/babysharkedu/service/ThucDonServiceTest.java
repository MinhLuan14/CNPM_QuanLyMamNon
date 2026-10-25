package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.ChiTietThucDonRequest;
import vhu.edu.babysharkedu.dto.ThucDonRequest;
import vhu.edu.babysharkedu.model.ChiTietThucDon;
import vhu.edu.babysharkedu.model.MonAn;
import vhu.edu.babysharkedu.model.ThucDon;
import vhu.edu.babysharkedu.repository.ChiTietThucDonRepository;
import vhu.edu.babysharkedu.repository.MonAnRepository;
import vhu.edu.babysharkedu.repository.ThucDonRepository;

class ThucDonServiceTest {
    private ThucDonRepository menuRepository;
    private ChiTietThucDonRepository detailRepository;
    private MonAnRepository foodRepository;
    private ThucDonService service;

    @BeforeEach
    void setUp() {
        menuRepository = mock(ThucDonRepository.class);
        detailRepository = mock(ChiTietThucDonRepository.class);
        foodRepository = mock(MonAnRepository.class);
        service = new ThucDonService(menuRepository, detailRepository, foodRepository);
    }

    @Test
    void createsWeeklyMenuUsingIdentityAndSchemaFields() {
        when(menuRepository.findAll()).thenReturn(List.of());
        when(menuRepository.saveAndFlush(any(ThucDon.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.them(menuRequest("2026-10-19", 43));

        assertEquals(43, result.tuanApDung());
        assertEquals(10, result.thangApDung());
        assertEquals(2026, result.namApDung());
        assertEquals(LocalDate.parse("2026-10-19"), result.ngayBatDau());
        assertEquals(LocalDate.parse("2026-10-25"), result.ngayKetThuc());
        assertEquals(Boolean.TRUE, result.trangThai());
    }

    @Test
    void rejectsAnotherMenuForSameIsoWeek() {
        ThucDon existing = new ThucDon();
        existing.setMaThucDon(8);
        existing.setTuanApDung(43);
        existing.setNamApDung(2026);
        when(menuRepository.findAll()).thenReturn(List.of(existing));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.them(menuRequest("2026-10-19", 43)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void updatesMenuAndPreservesNullStatus() {
        ThucDon menu = new ThucDon();
        menu.setMaThucDon(12);
        menu.setTrangThai(null);
        when(menuRepository.findById(12)).thenReturn(Optional.of(menu));
        when(menuRepository.findAll()).thenReturn(List.of(menu));
        when(menuRepository.saveAndFlush(menu)).thenReturn(menu);
        when(detailRepository.findAllByThucDonMaThucDonOrderByNgayAnAscBuaAnAscMaChiTietThucDonAsc(12))
                .thenReturn(List.of());

        var updated = service.capNhat(12, new ThucDonRequest(
                43,
                10,
                2026,
                LocalDate.parse("2026-10-19"),
                LocalDate.parse("2026-10-25"),
                null,
                null));

        assertEquals(43, updated.tuanApDung());
        assertNull(updated.trangThai());
    }

    @Test
    void refusesToDeleteMenuWithExistingDetails() {
        ThucDon menu = new ThucDon();
        menu.setMaThucDon(13);
        when(menuRepository.findById(13)).thenReturn(Optional.of(menu));
        when(detailRepository.countByThucDonMaThucDon(13)).thenReturn(1L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.xoa(13));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void addsActiveFoodToMenuAndRejectsInactiveFood() {
        ThucDon menu = new ThucDon();
        menu.setMaThucDon(3);
        menu.setNgayBatDau(LocalDate.parse("2026-10-19").atStartOfDay());
        menu.setNgayKetThuc(LocalDate.parse("2026-10-25").atTime(23, 59, 59));
        when(menuRepository.findById(3)).thenReturn(Optional.of(menu));
        when(detailRepository.findAllByThucDonMaThucDonOrderByNgayAnAscBuaAnAscMaChiTietThucDonAsc(3))
                .thenReturn(List.of());
        MonAn activeFood = new MonAn();
        activeFood.setMaMonAn(4);
        activeFood.setTenMonAn("Cháo gà");
        activeFood.setDonGia(new BigDecimal("12000.00"));
        activeFood.setTrangThai(true);
        when(foodRepository.findById(4)).thenReturn(Optional.of(activeFood));
        when(detailRepository.save(any(ChiTietThucDon.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.themMon(3, new ChiTietThucDonRequest(
                LocalDate.parse("2026-10-20"), "Bữa sáng", null, null, 4));

        assertEquals("Bữa sáng", result.buaAn());
        assertEquals(4, result.monAn().maMonAn());
        assertEquals(new BigDecimal("12000.00"), result.donGia());
        assertEquals(new BigDecimal("12000.00"), result.monAn().donGia());
        assertNotNull(result.ngayAn());

        activeFood.setTrangThai(false);
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.themMon(3, new ChiTietThucDonRequest(
                        LocalDate.parse("2026-10-21"), "Bữa trưa", null, null, 4)));
        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void ignoresClientPriceAndUsesCurrentFoodPriceWhenCreatingMenuDetail() {
        ThucDon menu = new ThucDon();
        menu.setMaThucDon(3);
        menu.setNgayBatDau(LocalDate.parse("2026-10-19").atStartOfDay());
        menu.setNgayKetThuc(LocalDate.parse("2026-10-25").atTime(23, 59, 59));
        when(menuRepository.findById(3)).thenReturn(Optional.of(menu));
        when(detailRepository.findAllByThucDonMaThucDonOrderByNgayAnAscBuaAnAscMaChiTietThucDonAsc(3))
                .thenReturn(List.of());
        MonAn food = new MonAn();
        food.setMaMonAn(4);
        food.setTenMonAn("Cháo thịt bằm");
        food.setDonGia(new BigDecimal("12000.00"));
        food.setTrangThai(true);
        when(foodRepository.findById(4)).thenReturn(Optional.of(food));
        when(detailRepository.save(any(ChiTietThucDon.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.themMon(3, new ChiTietThucDonRequest(
                LocalDate.parse("2026-10-20"),
                "Bữa sáng",
                new BigDecimal("1.00"),
                null,
                4));

        assertEquals(new BigDecimal("12000.00"), result.donGia());
    }

    @Test
    void refusesToAddFoodWithoutPrice() {
        ThucDon menu = new ThucDon();
        menu.setMaThucDon(3);
        menu.setNgayBatDau(LocalDate.parse("2026-10-19").atStartOfDay());
        menu.setNgayKetThuc(LocalDate.parse("2026-10-25").atTime(23, 59, 59));
        when(menuRepository.findById(3)).thenReturn(Optional.of(menu));
        MonAn food = new MonAn();
        food.setMaMonAn(4);
        food.setTrangThai(true);
        when(foodRepository.findById(4)).thenReturn(Optional.of(food));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.themMon(3, new ChiTietThucDonRequest(
                        LocalDate.parse("2026-10-20"), "Bữa sáng", null, null, 4)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals(
                "Món ăn chưa có đơn giá. Vui lòng cập nhật đơn giá trước khi thêm vào thực đơn.",
                exception.getReason());
    }

    @Test
    void preservesSavedDetailPriceWhenOnlyUpdatingMealOrNote() {
        ThucDon menu = new ThucDon();
        menu.setMaThucDon(3);
        menu.setNgayBatDau(LocalDate.parse("2026-10-19").atStartOfDay());
        menu.setNgayKetThuc(LocalDate.parse("2026-10-25").atTime(23, 59, 59));
        when(menuRepository.findById(3)).thenReturn(Optional.of(menu));
        MonAn food = new MonAn();
        food.setMaMonAn(4);
        food.setDonGia(new BigDecimal("15000.00"));
        food.setTrangThai(true);
        when(foodRepository.findById(4)).thenReturn(Optional.of(food));
        ChiTietThucDon detail = new ChiTietThucDon();
        detail.setMaChiTietThucDon(7);
        detail.setThucDon(menu);
        MonAn savedFood = new MonAn();
        savedFood.setMaMonAn(4);
        savedFood.setTenMonAn("Cháo gà");
        detail.setMonAn(savedFood);
        detail.setDonGia(new BigDecimal("12000.00"));
        when(detailRepository.findById(7)).thenReturn(Optional.of(detail));
        when(detailRepository.findAllByThucDonMaThucDonOrderByNgayAnAscBuaAnAscMaChiTietThucDonAsc(3))
                .thenReturn(List.of(detail));
        when(detailRepository.save(detail)).thenReturn(detail);

        var result = service.capNhatMon(3, 7, new ChiTietThucDonRequest(
                LocalDate.parse("2026-10-20"),
                "Bữa phụ sáng",
                new BigDecimal("1.00"),
                "Ghi chú mới",
                4));

        assertEquals(new BigDecimal("12000.00"), result.donGia());
        assertEquals("Bữa phụ sáng", result.buaAn());
    }

    @Test
    void refreshesSavedDetailPriceWhenChangingToAnotherFood() {
        ThucDon menu = new ThucDon();
        menu.setMaThucDon(3);
        menu.setNgayBatDau(LocalDate.parse("2026-10-19").atStartOfDay());
        menu.setNgayKetThuc(LocalDate.parse("2026-10-25").atTime(23, 59, 59));
        when(menuRepository.findById(3)).thenReturn(Optional.of(menu));
        MonAn newFood = new MonAn();
        newFood.setMaMonAn(5);
        newFood.setDonGia(new BigDecimal("15000.00"));
        newFood.setTrangThai(true);
        when(foodRepository.findById(5)).thenReturn(Optional.of(newFood));
        ChiTietThucDon detail = new ChiTietThucDon();
        detail.setMaChiTietThucDon(7);
        detail.setThucDon(menu);
        MonAn savedFood = new MonAn();
        savedFood.setMaMonAn(4);
        savedFood.setTenMonAn("Cháo thịt bằm");
        detail.setMonAn(savedFood);
        detail.setDonGia(new BigDecimal("12000.00"));
        when(detailRepository.findById(7)).thenReturn(Optional.of(detail));
        when(detailRepository.findAllByThucDonMaThucDonOrderByNgayAnAscBuaAnAscMaChiTietThucDonAsc(3))
                .thenReturn(List.of(detail));
        when(detailRepository.save(detail)).thenReturn(detail);

        var result = service.capNhatMon(3, 7, new ChiTietThucDonRequest(
                LocalDate.parse("2026-10-20"), "Bữa trưa", new BigDecimal("1.00"), null, 5));

        assertEquals(new BigDecimal("15000.00"), result.donGia());
    }

    private ThucDonRequest menuRequest(String startDate, int week) {
        LocalDate start = LocalDate.parse(startDate);
        return new ThucDonRequest(
                week, start.getMonthValue(), 2026, start, start.plusDays(6), null, true);
    }
}
