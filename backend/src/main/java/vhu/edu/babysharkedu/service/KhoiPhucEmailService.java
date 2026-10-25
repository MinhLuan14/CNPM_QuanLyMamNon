package vhu.edu.babysharkedu.service;

import java.util.List;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class KhoiPhucEmailService {
    private static final Logger LOGGER = LoggerFactory.getLogger(KhoiPhucEmailService.class);
    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String from;

    public KhoiPhucEmailService(
            @Value("${spring.mail.host:}") String host,
            @Value("${spring.mail.port:587}") int port,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${spring.mail.from:}") String from) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.from = from;
    }

    public boolean isConfigured() {
        return !host.isBlank()
                && !username.isBlank()
                && !password.isBlank()
                && !from.isBlank();
    }

    public void logConfigurationUnavailable() {
        LOGGER.warn(
                "Account recovery email configuration incomplete; smtpHostConfigured={}, usernameConfigured={}, "
                        + "passwordConfigured={}, fromConfigured={}.",
                !host.isBlank(),
                !username.isBlank(),
                !password.isBlank(),
                !from.isBlank());
    }

    public void guiTenDangNhap(String email, List<String> usernames) {
        String usernameList = usernames.stream().map(value -> "• " + value)
                .collect(java.util.stream.Collectors.joining("\n"));
        gui(email, "Hướng dẫn khôi phục tên đăng nhập BabyShark",
                "Xin chào,\n\nTên đăng nhập liên kết với email này:\n"
                        + usernameList
                        + "\n\nNếu bạn không yêu cầu email này, vui lòng bỏ qua và liên hệ nhà trường.");
    }

    public void guiMatKhauTamThoi(String email, List<String> usernames, String temporaryPassword) {
        String usernameList = usernames.stream()
                .map(value -> "• " + value)
                .collect(java.util.stream.Collectors.joining("\n"));
        gui(email, "Mật khẩu tạm thời - BabySharkEdu",
                "Xin chào,\n\n"
                        + "Bạn vừa yêu cầu khôi phục mật khẩu tài khoản BabySharkEdu.\n\n"
                        + "Tên đăng nhập:\n" + usernameList + "\n\n"
                        + "Mật khẩu tạm thời: " + temporaryPassword + "\n\n"
                        + "Hãy đăng nhập bằng tên đăng nhập và mật khẩu tạm thời ở trên. "
                        + "Sau khi đăng nhập, hệ thống sẽ yêu cầu bạn đổi sang mật khẩu mới ngay lập tức. "
                        + "Không chia sẻ mật khẩu này với bất kỳ ai.\n\n"
                        + "Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ nhà trường.");
    }

    private void gui(String email, String subject, String body) {
        if (!isConfigured()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Dịch vụ email khôi phục chưa được cấu hình. Vui lòng liên hệ nhà trường.");
        }
        try {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost(host);
            sender.setPort(port);
            sender.setUsername(username);
            sender.setPassword(password);
            sender.setDefaultEncoding(java.nio.charset.StandardCharsets.UTF_8.name());
            Properties mailProperties = sender.getJavaMailProperties();
            mailProperties.put("mail.smtp.auth", "true");
            mailProperties.put("mail.smtp.starttls.enable", "true");
            mailProperties.put("mail.smtp.connectiontimeout", "5000");
            mailProperties.put("mail.smtp.timeout", "5000");
            mailProperties.put("mail.smtp.writetimeout", "5000");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(email);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
        } catch (org.springframework.mail.MailException exception) {
            LOGGER.warn(
                    "Recovery email delivery failed; exceptionType={}, rootCauseType={}.",
                    exception.getClass().getSimpleName(),
                    rootCauseType(exception));
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể gửi email khôi phục lúc này. Vui lòng thử lại sau.");
        }
    }

    private String rootCauseType(Throwable exception) {
        Throwable rootCause = exception;
        while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
            rootCause = rootCause.getCause();
        }
        return rootCause.getClass().getSimpleName();
    }

}
