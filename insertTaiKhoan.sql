USE QLMamNon;
GO

DECLARE @matKhau VARCHAR(255) =
    '$2a$10$EuGqIYmCHJRy4jDpVHPl6emxVuflTIq80oBogefFRXjb4Mp46bSLO';

-- Tài khoản ADMIN
IF EXISTS (
    SELECT 1 FROM dbo.TAIKHOAN
    WHERE tenDangNhap = 'admin'
)
BEGIN
    UPDATE dbo.TAIKHOAN
    SET matKhau = @matKhau,
        vaiTro = N'ADMIN'
    WHERE tenDangNhap = 'admin';
END
ELSE
BEGIN
    INSERT INTO dbo.TAIKHOAN (tenDangNhap, matKhau, vaiTro)
    VALUES ('admin', @matKhau, N'ADMIN');
END;

-- Tài khoản giáo viên
IF EXISTS (
    SELECT 1 FROM dbo.TAIKHOAN
    WHERE tenDangNhap = 'gv_quynhnga'
)
BEGIN
    UPDATE dbo.TAIKHOAN
    SET matKhau = @matKhau,
        vaiTro = N'GIAOVIEN'
    WHERE tenDangNhap = 'gv_quynhnga';
END
ELSE
BEGIN
    INSERT INTO dbo.TAIKHOAN (tenDangNhap, matKhau, vaiTro)
    VALUES ('gv_quynhnga', @matKhau, N'GIAOVIEN');
END;

-- Tài khoản phụ huynh
IF EXISTS (
    SELECT 1 FROM dbo.TAIKHOAN
    WHERE tenDangNhap = 'ph_demo_2026'
)
BEGIN
    UPDATE dbo.TAIKHOAN
    SET matKhau = @matKhau,
        vaiTro = N'PHUHUYNH'
    WHERE tenDangNhap = 'ph_demo_2026';
END
ELSE
BEGIN
    INSERT INTO dbo.TAIKHOAN (tenDangNhap, matKhau, vaiTro)
    VALUES ('ph_demo_2026', @matKhau, N'PHUHUYNH');
END;

-- Kiểm tra kết quả
SELECT maTaiKhoan, tenDangNhap, vaiTro, matKhau
FROM dbo.TAIKHOAN
WHERE tenDangNhap IN (
    'admin',
    'gv_quynhnga',
    'ph_demo_2026'
);
GO
select * from TAIKHOAN
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TAIKHOAN';
select * from TREEM