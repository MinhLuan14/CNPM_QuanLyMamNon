package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import vhu.edu.babysharkedu.dto.VietQrDTO;

class VietQrServiceTest {
    private static final String GENERATE_URL = "https://api.vietqr.io/v2/generate";
    private static final String PNG_DATA_URI = "data:image/png;base64,iVBORw0KGgo=";

    @Test
    void sendsConfiguredMbPaymentDetailsAndReturnsOnlyQrInformation() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        VietQrService service = new VietQrService(builder.build(), "client-id", "api-key", "123456789", "BABYSHARK");
        server.expect(requestTo(GENERATE_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-client-id", "client-id"))
                .andExpect(header("x-api-key", "api-key"))
                .andExpect(content().json("""
                        {
                          "accountNo": "123456789",
                          "accountName": "BABYSHARK",
                          "acqId": 970422,
                          "amount": 2100000,
                          "addInfo": "HP-2 PHAM GIA HAN",
                          "template": "compact2"
                        }
                        """))
                .andRespond(withSuccess(
                        """
                        {"code":"00","data":{"qrDataURL":"data:image/png;base64,iVBORw0KGgo="}}
                        """,
                        MediaType.APPLICATION_JSON));

        VietQrDTO result = service.taoMaQr(new BigDecimal("2100000.00"), "HP-2 PHAM GIA HAN");

        assertEquals("MB Bank", result.nganHang());
        assertEquals("123456789", result.soTaiKhoan());
        assertEquals(new BigDecimal("2100000.00"), result.soTien());
        assertEquals(PNG_DATA_URI, result.anhQrDataUri());
        server.verify();
    }

    @Test
    void rejectsQrResponseWithoutValidImageData() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        VietQrService service = new VietQrService(builder.build(), "client-id", "api-key", "123456789", "BABYSHARK");
        server.expect(requestTo(GENERATE_URL))
                .andRespond(withSuccess(
                        """
                        {"code":"00","data":{"qrDataURL":"https://example.invalid/qr.png"}}
                        """,
                        MediaType.APPLICATION_JSON));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoMaQr(new BigDecimal("2100000"), "HP-2 PHAM GIA HAN"));

        assertEquals(502, exception.getStatusCode().value());
        server.verify();
    }

    @Test
    void refusesToCallVietQrWhenCredentialsAreMissing() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        VietQrService service = new VietQrService(builder.build(), "", "", "", "");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoMaQr(new BigDecimal("2100000"), "HP-2 PHAM GIA HAN"));

        assertEquals(503, exception.getStatusCode().value());
        server.verify();
    }

    @Test
    void convertsVietQrServerFailureIntoSafeGatewayError() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        VietQrService service = new VietQrService(builder.build(), "client-id", "api-key", "123456789", "BABYSHARK");
        server.expect(requestTo(GENERATE_URL)).andRespond(withServerError());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.taoMaQr(new BigDecimal("2100000"), "HP-2 PHAM GIA HAN"));

        assertEquals(502, exception.getStatusCode().value());
        assertEquals(
                "Dịch vụ VietQR đang gặp sự cố. Vui lòng thử lại sau.",
                exception.getReason());
        server.verify();
    }
}
