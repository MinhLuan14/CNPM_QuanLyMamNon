USE QLMamNon;
GO

SET NOCOUNT ON;

-- Hash of '12345'
DECLARE @hash12345 VARCHAR(255) = '$2a$10$EuGqIYmCHJRy4jDpVHPl6emxVuflTIq80oBogefFRXjb4Mp46bSLO';
-- Hash of 'Parent123!'
DECLARE @hashParent VARCHAR(255) = '$2a$10$Djsb0w89ZovC.RF/kfExV.ROaDMKZ7lRQhzCpWBk1PUxZOT0XjS.G';
-- Hash of 'Teacher123!'
DECLARE @hashTeacher VARCHAR(255) = '$2a$10$BYWAbk.troOo6H4xfjfKB.Qgd6IManTtMpEv1itFVy9r7UMtpQbJS';

-- 1. Cập nhật / Thêm TAIKHOAN ADMIN
IF EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE tenDangNhap = 'admin')
    UPDATE dbo.TAIKHOAN SET matKhau = @hash12345, vaiTro = N'ADMIN', trangThai = 1, mustChangePassword = 0 WHERE tenDangNhap = 'admin';
ELSE
    INSERT INTO dbo.TAIKHOAN (tenDangNhap, matKhau, vaiTro, trangThai, mustChangePassword)
    VALUES ('admin', @hash12345, N'ADMIN', 1, 0);

-- 2. Cập nhật / Thêm TAIKHOAN PHUHUYNH
IF EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE tenDangNhap = 'ph_demo_2026')
    UPDATE dbo.TAIKHOAN SET matKhau = @hashParent, vaiTro = N'PHUHUYNH', trangThai = 1, mustChangePassword = 0 WHERE tenDangNhap = 'ph_demo_2026';
ELSE
    INSERT INTO dbo.TAIKHOAN (tenDangNhap, matKhau, vaiTro, trangThai, mustChangePassword)
    VALUES ('ph_demo_2026', @hashParent, N'PHUHUYNH', 1, 0);

-- 3. Cập nhật / Thêm TAIKHOAN GIAOVIEN
IF EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE tenDangNhap = 'gv_quynhnga')
    UPDATE dbo.TAIKHOAN SET matKhau = @hashTeacher, vaiTro = N'GIAOVIEN', trangThai = 1, mustChangePassword = 0 WHERE tenDangNhap = 'gv_quynhnga';
ELSE
    INSERT INTO dbo.TAIKHOAN (tenDangNhap, matKhau, vaiTro, trangThai, mustChangePassword)
    VALUES ('gv_quynhnga', @hashTeacher, N'GIAOVIEN', 1, 0);

SELECT tenDangNhap, vaiTro, matKhau FROM dbo.TAIKHOAN;
GO
