package vhu.edu.babysharkedu.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.GiaoVienDTO;
import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;

@Service
public class AnhDaiDienService {
    private static final Logger logger = LoggerFactory.getLogger(AnhDaiDienService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final String DEFAULT_CHILD_IMAGE = "static/images/default-child.svg";
    private static final String DEFAULT_TEACHER_IMAGE = "static/images/default-teacher.svg";

    private final Path uploadRoot;
    private final TreEmRepository treEmRepository;
    private final GiaoVienRepository giaoVienRepository;
    private final GiaoVienService giaoVienService;

    public AnhDaiDienService(
            @Value("${babyshark.upload-dir:uploads}") String uploadDirectory,
            TreEmRepository treEmRepository,
            GiaoVienRepository giaoVienRepository,
            GiaoVienService giaoVienService) {
        this.uploadRoot = Path.of(uploadDirectory).toAbsolutePath().normalize();
        this.treEmRepository = treEmRepository;
        this.giaoVienRepository = giaoVienRepository;
        this.giaoVienService = giaoVienService;
    }

    private void dangKyDonDepAnhCuSauCommit(String oldPath) {
        if (oldPath == null || oldPath.isBlank()) {
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                xoaAnhCuNeuKhongConSuDung(oldPath);
            }
        });
    }

    private void dangKyDonDepTepMoiNeuRollback(String newPath) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    try {
                        Files.deleteIfExists(resolveStoredPath(newPath));
                    } catch (IOException | IllegalArgumentException exception) {
                        logger.error("Không thể dọn file ảnh mới sau khi giao dịch cập nhật bị rollback.", exception);
                    }
                }
            }
        });
    }

    @Transactional
    public void capNhatAnhTreEm(Integer maTre, MultipartFile file) {
        TreEm child = treEmRepository.findById(maTre)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ trẻ."));
        String newPath = luuTep(file, "tre-em");
        String oldPath = child.getAnhDaiDien();
        try {
            child.setAnhDaiDien(newPath);
            treEmRepository.saveAndFlush(child);
            dangKyDonDepTepMoiNeuRollback(newPath);
        } catch (RuntimeException exception) {
            xoaTepMoiKhiLoi(newPath, exception);
            throw exception;
        }
        dangKyDonDepAnhCuSauCommit(oldPath);
    }

    @Transactional
    public GiaoVienDTO capNhatAnhGiaoVien(Integer maGiaoVien, MultipartFile file) {
        GiaoVien teacher = giaoVienRepository.findById(maGiaoVien)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ giáo viên."));
        String newPath = luuTep(file, "giao-vien");
        String oldPath = teacher.getAnhDaiDien();
        try {
            teacher.setAnhDaiDien(newPath);
            giaoVienRepository.saveAndFlush(teacher);
            dangKyDonDepTepMoiNeuRollback(newPath);
        } catch (RuntimeException exception) {
            xoaTepMoiKhiLoi(newPath, exception);
            throw exception;
        }
        dangKyDonDepAnhCuSauCommit(oldPath);
        return giaoVienService.layChiTiet(maGiaoVien);
    }

    @Transactional(readOnly = true)
    public HinhAnh layAnhTreEm(Integer maTre) {
        TreEm child = treEmRepository.findById(maTre)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ trẻ."));
        return docAnh(child.getAnhDaiDien(), DEFAULT_CHILD_IMAGE);
    }

    @Transactional(readOnly = true)
    public HinhAnh layAnhGiaoVien(Integer maGiaoVien) {
        GiaoVien teacher = giaoVienRepository.findById(maGiaoVien)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ giáo viên."));
        return docAnh(teacher.getAnhDaiDien(), DEFAULT_TEACHER_IMAGE);
    }

    private String luuTep(MultipartFile file, String category) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Ảnh không được để trống và dung lượng tối đa là 5 MB.");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null
                || originalFilename.isBlank()
                || originalFilename.length() > 255
                || originalFilename.contains("..")
                || originalFilename.lastIndexOf('/') >= 0
                || originalFilename.lastIndexOf('\\') >= 0
                || !StringUtils.cleanPath(originalFilename).equals(originalFilename)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên file ảnh không hợp lệ.");
        }

        String extension;
        MediaType mediaType;
        try (var input = file.getInputStream()) {
            byte[] header = input.readNBytes(12);
            if (isJpeg(header)) {
                extension = ".jpg";
                mediaType = MediaType.IMAGE_JPEG;
            } else if (isPng(header)) {
                extension = ".png";
                mediaType = MediaType.IMAGE_PNG;
            } else if (isWebp(header)) {
                extension = ".webp";
                mediaType = MediaType.parseMediaType("image/webp");
            } else {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP hợp lệ.");
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể đọc file ảnh tải lên.", exception);
        }
        if (file.getContentType() != null && !file.getContentType().equalsIgnoreCase(mediaType.toString())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Định dạng ảnh không khớp với nội dung file.");
        }
        String filename = originalFilename.toLowerCase(java.util.Locale.ROOT);
        boolean matchingExtension = switch (extension) {
            case ".jpg" -> filename.endsWith(".jpg") || filename.endsWith(".jpeg");
            case ".png" -> filename.endsWith(".png");
            case ".webp" -> filename.endsWith(".webp");
            default -> false;
        };
        if (!matchingExtension) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Phần mở rộng tên file không khớp định dạng ảnh.");
        }

        String relativePath = category + "/" + UUID.randomUUID() + extension;
        Path destination = resolveStoredPath(relativePath);
        try {
            Files.createDirectories(destination.getParent());
            try (var input = file.getInputStream()) {
                Files.copy(input, destination);
            }
            return relativePath;

        } catch (IOException exception) {
            try {
                Files.deleteIfExists(destination);
            } catch (IOException cleanupException) {
                exception.addSuppressed(cleanupException);
                logger.error("Không thể dọn file ảnh tải lên bị ghi dở.", cleanupException);
            }
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu file ảnh trên máy chủ.", exception);
        }
    }

    private HinhAnh docAnh(String relativePath, String defaultResourcePath) {
        if (relativePath != null && !relativePath.isBlank()) {
            try {
                Path path = resolveStoredPath(relativePath);
                if (Files.isRegularFile(path)) {
                    String extension = extensionOf(path);
                    MediaType mediaType = switch (extension) {
                        case ".jpg", ".jpeg" -> MediaType.IMAGE_JPEG;
                        case ".png" -> MediaType.IMAGE_PNG;
                        case ".webp" -> MediaType.parseMediaType("image/webp");
                        default -> throw new IllegalArgumentException("Định dạng ảnh đã lưu không được hỗ trợ.");
                    };
                    return new HinhAnh(new FileSystemResource(path), mediaType);
                }
                logger.warn("File ảnh đại diện không tồn tại; sử dụng ảnh mặc định: {}", relativePath);
            } catch (IllegalArgumentException exception) {
                logger.warn("Đường dẫn ảnh đại diện không an toàn hoặc sai định dạng: {}", relativePath);
            }
        }
        return new HinhAnh(new ClassPathResource(defaultResourcePath), MediaType.parseMediaType("image/svg+xml"));
    }

    private Path resolveStoredPath(String relativePath) {
        Path resolved = uploadRoot.resolve(relativePath).normalize();
        if (!resolved.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Đường dẫn ảnh nằm ngoài thư mục upload.");
        }
        return resolved;
    }

    private void xoaAnhCuNeuKhongConSuDung(String oldPath) {
        if (oldPath == null || oldPath.isBlank()
                || treEmRepository.existsByAnhDaiDien(oldPath)
                || giaoVienRepository.existsByAnhDaiDien(oldPath)) {
            return;
        }
        try {
            Files.deleteIfExists(resolveStoredPath(oldPath));
        } catch (IOException | IllegalArgumentException exception) {
            logger.warn("Không thể xóa ảnh đại diện cũ {}: {}", oldPath, exception.getMessage());
        }
    }

    private void xoaTepMoiKhiLoi(String relativePath, RuntimeException originalException) {
        try {
            Files.deleteIfExists(resolveStoredPath(relativePath));
        } catch (IOException | IllegalArgumentException cleanupException) {
            originalException.addSuppressed(cleanupException);
            logger.error("Không thể dọn file ảnh vừa tải lên sau khi cập nhật hồ sơ thất bại.", cleanupException);
        }
    }

    private String extensionOf(Path path) {
        String filename = path.getFileName().toString();
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot).toLowerCase(java.util.Locale.ROOT);
    }

    private boolean isJpeg(byte[] bytes) {
        return bytes.length >= 3
                && (bytes[0] & 0xff) == 0xff
                && (bytes[1] & 0xff) == 0xd8
                && (bytes[2] & 0xff) == 0xff;
    }

    private boolean isPng(byte[] bytes) {
        return bytes.length >= 8
                && (bytes[0] & 0xff) == 0x89
                && bytes[1] == 0x50 && bytes[2] == 0x4e && bytes[3] == 0x47
                && bytes[4] == 0x0d && bytes[5] == 0x0a && bytes[6] == 0x1a && bytes[7] == 0x0a;
    }

    private boolean isWebp(byte[] bytes) {
        return bytes.length >= 12
                && bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46
                && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50;
    }

    public record HinhAnh(Resource resource, MediaType mediaType) {
    }
}
