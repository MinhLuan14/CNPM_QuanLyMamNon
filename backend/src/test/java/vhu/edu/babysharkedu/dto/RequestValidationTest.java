package vhu.edu.babysharkedu.dto;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class RequestValidationTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void reportsVietnameseFieldConstraintsForClassRequest() {
        Set<ConstraintViolation<LopHocRequest>> violations =
                validator.validate(new LopHocRequest(" ", 0, -1, " "));

        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("tenLopHoc")
                && v.getMessage().contains("Tên lớp học")));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("phongHoc")
                && v.getMessage().contains("số nguyên dương")));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("soLuongToiDa")));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("doTuoi")));
    }

    @Test
    void validatesNestedInvoiceDetails() {
        TaoHocPhiRequest request = new TaoHocPhiRequest(
                1,
                1,
                2025,
                LocalDate.now(),
                List.of(new TaoHocPhiRequest.ChiTietRequest(" ", 0, BigDecimal.ZERO, null)));

        Set<ConstraintViolation<TaoHocPhiRequest>> violations = validator.validate(request);

        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("chiTiet[0].loaiPhi")));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("chiTiet[0].soLuong")));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("chiTiet[0].donGia")));
    }

    @Test
    void trimmedFieldsKeepPreviouslyAcceptedSurroundingWhitespace() {
        GiaoVienRequest request = new GiaoVienRequest(
                "  Nguyen Van An  ",
                null,
                " 0123456789 ",
                " teacher@example.com ",
                " 1 Main Street ",
                null,
                null,
                null,
                null);

        assertTrue(validator.validate(request).isEmpty());
    }
}
