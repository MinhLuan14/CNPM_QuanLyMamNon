package vhu.edu.babysharkedu.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

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
}
