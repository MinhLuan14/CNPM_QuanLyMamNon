package vhu.edu.babysharkedu.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.SQLException;
import java.lang.reflect.Method;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.core.MethodParameter;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;

class ApiExceptionHandlerTest {
    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void chiTra409ChoUniqueViolation() {
        var response = handler.handleDataConflict(
                new DataIntegrityViolationException(
                        "duplicate", new SQLException("duplicate key", "23000", 2627)));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void foreignKeyViolationIsNotReportedAsDuplicateConflict() {
        var response = handler.handleDataConflict(
                new DataIntegrityViolationException(
                        "foreign key", new SQLException("foreign key", "23000", 547)));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void notNullViolationIsReportedAsServerErrorNotDataConflict() {
        var response = handler.handleDataConflict(
                new DataIntegrityViolationException(
                        "not null", new SQLException("cannot insert null", "23000", 515)));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void requestValidationResponseNamesTheInvalidFieldInVietnamese() throws Exception {
        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(new SampleRequest(), "request");
        bindingResult.rejectValue("tenLopHoc", "NotBlank", "Tên lớp học không được để trống.");
        Method method = ApiExceptionHandlerTest.class.getDeclaredMethod("requestBody", Object.class);
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(
                new MethodParameter(method, 0), bindingResult);

        var response = handler.handleInvalidRequestFields(exception);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("tenLopHoc"));
        assertTrue(response.getBody().get("message").contains("Tên lớp học không được để trống."));
    }

    @SuppressWarnings("unused")
    private void requestBody(Object request) {
    }

    private static class SampleRequest {
        private String tenLopHoc;

        public String getTenLopHoc() {
            return tenLopHoc;
        }

        public void setTenLopHoc(String tenLopHoc) {
            this.tenLopHoc = tenLopHoc;
        }
    }
}
