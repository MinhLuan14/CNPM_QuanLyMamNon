package vhu.edu.babysharkedu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.model.GiaoVien;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.GiaoVienRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;

class AnhDaiDienServiceTest {
    private static final byte[] PNG_HEADER = new byte[] {
            (byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0
    };

    @TempDir
    Path uploadDirectory;

    @AfterEach
    void clearTransactionSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void uploadsValidImageAndStoresRelativePath() throws Exception {
        TreEmRepository childRepository = mock(TreEmRepository.class);
        GiaoVienRepository teacherRepository = mock(GiaoVienRepository.class);
        TreEm child = new TreEm();
        child.setMaTre(17);
        when(childRepository.findById(17)).thenReturn(Optional.of(child));
        when(childRepository.saveAndFlush(child)).thenReturn(child);
        AnhDaiDienService service = createService(childRepository, teacherRepository);
        TransactionSynchronizationManager.initSynchronization();

        service.capNhatAnhTreEm(17, png("avatar.png"));

        assertTrue(child.getAnhDaiDien().matches("tre-em/[0-9a-f-]+\\.png"));
        assertTrue(Files.isRegularFile(uploadDirectory.resolve(child.getAnhDaiDien())));
        TransactionSynchronizationManager.getSynchronizations()
                .forEach(TransactionSynchronization::afterCommit);
    }

    @Test
    void rejectsImageWithInvalidContentOrFilenameExtension() {
        TreEmRepository childRepository = mock(TreEmRepository.class);
        GiaoVienRepository teacherRepository = mock(GiaoVienRepository.class);
        TreEm child = new TreEm();
        child.setMaTre(18);
        when(childRepository.findById(18)).thenReturn(Optional.of(child));
        AnhDaiDienService service = createService(childRepository, teacherRepository);

        ResponseStatusException invalidContent = assertThrows(
                ResponseStatusException.class,
                () -> service.capNhatAnhTreEm(18, new MockMultipartFile(
                        "file", "avatar.png", "image/png", "not an image".getBytes())));
        ResponseStatusException mismatchedExtension = assertThrows(
                ResponseStatusException.class,
                () -> service.capNhatAnhTreEm(18, png("avatar.jpg")));

        assertEquals(HttpStatus.BAD_REQUEST, invalidContent.getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, mismatchedExtension.getStatusCode());
    }

    @Test
    void usesDefaultTeacherImageWhenNoPhotoWasSaved() {
        TreEmRepository childRepository = mock(TreEmRepository.class);
        GiaoVienRepository teacherRepository = mock(GiaoVienRepository.class);
        GiaoVien teacher = new GiaoVien();
        teacher.setMaGiaoVien(9);
        when(teacherRepository.findById(9)).thenReturn(Optional.of(teacher));
        AnhDaiDienService service = createService(childRepository, teacherRepository);

        AnhDaiDienService.HinhAnh image = service.layAnhGiaoVien(9);

        assertEquals("image/svg+xml", image.mediaType().toString());
        assertTrue(image.resource().exists());
    }

    @Test
    void doesNotDeleteOldPhotoStillReferencedByAnotherRecord() throws Exception {
        TreEmRepository childRepository = mock(TreEmRepository.class);
        GiaoVienRepository teacherRepository = mock(GiaoVienRepository.class);
        TreEm child = new TreEm();
        child.setMaTre(19);
        child.setAnhDaiDien("tre-em/shared.png");
        when(childRepository.findById(19)).thenReturn(Optional.of(child));
        when(childRepository.saveAndFlush(child)).thenReturn(child);
        when(teacherRepository.existsByAnhDaiDien("tre-em/shared.png")).thenReturn(true);
        Path oldPhoto = uploadDirectory.resolve("tre-em/shared.png");
        Files.createDirectories(oldPhoto.getParent());
        Files.write(oldPhoto, PNG_HEADER);
        AnhDaiDienService service = createService(childRepository, teacherRepository);
        TransactionSynchronizationManager.initSynchronization();

        service.capNhatAnhTreEm(19, png("new.png"));
        TransactionSynchronizationManager.getSynchronizations()
                .forEach(TransactionSynchronization::afterCommit);

        assertTrue(Files.exists(oldPhoto));
        assertFalse(child.getAnhDaiDien().equals("tre-em/shared.png"));
    }

    @Test
    void deletesOldPhotoAfterReplacementWhenNoRecordUsesIt() throws Exception {
        TreEmRepository childRepository = mock(TreEmRepository.class);
        GiaoVienRepository teacherRepository = mock(GiaoVienRepository.class);
        TreEm child = new TreEm();
        child.setMaTre(20);
        child.setAnhDaiDien("tre-em/old.png");
        when(childRepository.findById(20)).thenReturn(Optional.of(child));
        when(childRepository.saveAndFlush(child)).thenReturn(child);
        Path oldPhoto = uploadDirectory.resolve("tre-em/old.png");
        Files.createDirectories(oldPhoto.getParent());
        Files.write(oldPhoto, PNG_HEADER);
        AnhDaiDienService service = createService(childRepository, teacherRepository);
        TransactionSynchronizationManager.initSynchronization();

        service.capNhatAnhTreEm(20, png("new.png"));
        TransactionSynchronizationManager.getSynchronizations()
                .forEach(TransactionSynchronization::afterCommit);

        assertFalse(Files.exists(oldPhoto));
        assertTrue(Files.exists(uploadDirectory.resolve(child.getAnhDaiDien())));
    }

    private AnhDaiDienService createService(
            TreEmRepository childRepository,
            GiaoVienRepository teacherRepository) {
        return new AnhDaiDienService(
                uploadDirectory.toString(),
                childRepository,
                teacherRepository,
                mock(GiaoVienService.class));
    }

    private MockMultipartFile png(String filename) {
        return new MockMultipartFile("file", filename, "image/png", PNG_HEADER);
    }
}
