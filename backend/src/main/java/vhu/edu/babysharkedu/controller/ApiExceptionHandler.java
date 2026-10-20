package vhu.edu.babysharkedu.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, String>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception) {
        String message = exception.getMethod() == null
                ? "Phương thức HTTP không được hỗ trợ."
                : "Phương thức " + exception.getMethod()
                        + " không được hỗ trợ tại địa chỉ này. Vui lòng kiểm tra lại URL và phương thức yêu cầu.";
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(Map.of("message", message));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException exception) {
        String message = exception.getReason() == null
                ? "Yêu cầu không thể được xử lý."
                : exception.getReason();
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("message", message));
    }
}
