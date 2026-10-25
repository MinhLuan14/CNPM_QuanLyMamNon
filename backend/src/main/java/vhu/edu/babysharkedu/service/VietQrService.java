package vhu.edu.babysharkedu.service;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Duration;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import vhu.edu.babysharkedu.dto.VietQrDTO;

@Service
public class VietQrService {
    private static final Logger logger = LoggerFactory.getLogger(VietQrService.class);
    private static final URI GENERATE_URI = URI.create("https://api.vietqr.io/v2/generate");
    private static final int MB_BANK_BIN = 970422;
    private static final String QR_TEMPLATE = "compact2";
    private static final Pattern IMAGE_DATA_URI = Pattern.compile(
            "^data:image/png;base64,([A-Za-z0-9+/]+={0,2})$");
    private static final int MAX_QR_IMAGE_BYTES = 2_000_000;

    private final RestClient restClient;
    private final String clientId;
    private final String apiKey;
    private final String accountNo;
    private final String accountName;

    @Autowired
    public VietQrService(
            @Value("${vietqr.client-id:}") String clientId,
            @Value("${vietqr.api-key:}") String apiKey,
            @Value("${vietqr.mb-account-no:}") String accountNo,
            @Value("${vietqr.mb-account-name:}") String accountName) {
        this(createRestClient(), clientId, apiKey, accountNo, accountName);
    }

    VietQrService(
            RestClient restClient,
            String clientId,
            String apiKey,
            String accountNo,
            String accountName) {
        this.restClient = restClient;
        this.clientId = clientId.trim();
        this.apiKey = apiKey.trim();
        this.accountNo = accountNo.trim();
        this.accountName = accountName.trim();
    }

    public VietQrDTO taoMaQr(BigDecimal amount, String transferInfo) {
        kiemTraCauHinh();
        if (amount == null || amount.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phiếu thu không còn số dư cần thanh toán.");
        }
        long amountInVnd;
        try {
            amountInVnd = amount.longValueExact();
        } catch (ArithmeticException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số tiền phiếu thu phải là số nguyên VNĐ để tạo mã QR.");
        }

        VietQrRequest request = new VietQrRequest(
                accountNo,
                accountName,
                MB_BANK_BIN,
                amountInVnd,
                transferInfo,
                QR_TEMPLATE);
        VietQrResponse response;
        try {
            response = restClient.post()
                    .uri(GENERATE_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-client-id", clientId)
                    .header("x-api-key", apiKey)
                    .body(request)
                    .retrieve()
                    .body(VietQrResponse.class);
        } catch (RestClientException exception) {
            logger.warn("Không thể gọi VietQR ({})", exception.getClass().getSimpleName());
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Dịch vụ VietQR đang gặp sự cố. Vui lòng thử lại sau.");
        }

        if (response == null
                || !"00".equals(response.code())
                || response.data() == null
                || !isValidPngDataUri(response.data().qrDataURL())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "VietQR không trả về mã QR hợp lệ. Vui lòng thử lại sau.");
        }

        return new VietQrDTO(
                "MB Bank",
                accountNo,
                accountName,
                amount,
                transferInfo,
                response.data().qrDataURL());
    }

    private void kiemTraCauHinh() {
        if (clientId.isBlank() || apiKey.isBlank() || accountNo.isBlank() || accountName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Thanh toán QR chưa được nhà trường cấu hình. Vui lòng liên hệ nhà trường.");
        }
        if (accountNo.length() > 19 || accountName.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Thông tin tài khoản nhận tiền chưa hợp lệ. Vui lòng liên hệ nhà trường.");
        }
    }

    private static RestClient createRestClient() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        return RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    private boolean isValidPngDataUri(String dataUri) {
        if (dataUri == null || dataUri.length() > MAX_QR_IMAGE_BYTES * 2) {
            return false;
        }
        Matcher matcher = IMAGE_DATA_URI.matcher(dataUri);
        if (!matcher.matches()) {
            return false;
        }
        try {
            byte[] image = Base64.getDecoder().decode(matcher.group(1));
            return image.length >= 8
                    && image.length <= MAX_QR_IMAGE_BYTES
                    && (image[0] & 0xff) == 0x89
                    && image[1] == 0x50
                    && image[2] == 0x4e
                    && image[3] == 0x47
                    && image[4] == 0x0d
                    && image[5] == 0x0a
                    && image[6] == 0x1a
                    && image[7] == 0x0a;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private record VietQrRequest(
            String accountNo,
            String accountName,
            int acqId,
            long amount,
            String addInfo,
            String template) {
    }

    private record VietQrResponse(String code, VietQrResponseData data) {
    }

    private record VietQrResponseData(@JsonProperty("qrDataURL") String qrDataURL) {
    }
}
