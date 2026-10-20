USE [QLMamNon];
GO

SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @username VARCHAR(50) = 'ph_demo_2026';
    DECLARE @password VARCHAR(255) = 'Parent123!';
    DECLARE @accountId INT;
    DECLARE @parentId INT;
    DECLARE @childId INT;
    DECLARE @classId INT;

    -- Tài khoản: nếu đã tồn tại thì phải đúng vai trò phụ huynh.
    SELECT @accountId = maTaiKhoan
    FROM dbo.TAIKHOAN
    WHERE tenDangNhap = @username;

    IF @accountId IS NULL
    BEGIN
        INSERT INTO dbo.TAIKHOAN (tenDangNhap, matKhau, vaiTro, trangThai)
        VALUES (@username, @password, N'PHUHUYNH', 1);

        SET @accountId = CONVERT(INT, SCOPE_IDENTITY());
    END
    ELSE IF NOT EXISTS (
        SELECT 1
        FROM dbo.TAIKHOAN
        WHERE maTaiKhoan = @accountId
          AND vaiTro = N'PHUHUYNH'
    )
    BEGIN
        THROW 50001, N'Tên đăng nhập đã tồn tại nhưng không thuộc vai trò PHUHUYNH.', 1;
    END;

    -- Hồ sơ phụ huynh gắn với tài khoản.
    SELECT @parentId = maPhuHuynh
    FROM dbo.PHUHUYNH
    WHERE maTaiKhoan = @accountId;

    IF @parentId IS NULL
    BEGIN
        IF EXISTS (
            SELECT 1 FROM dbo.PHUHUYNH WHERE soDienThoai = '0900001122'
        )
        BEGIN
            THROW 50002, N'Số điện thoại kiểm thử đã được sử dụng. Hãy đổi số trong script.', 1;
        END;

        INSERT INTO dbo.PHUHUYNH
            (hoTenDemPH, tenPH, diaChiLH, soDienThoai, email, maTaiKhoan)
        VALUES
            (N'Nguyễn Thị', N'Minh Anh', N'Địa chỉ kiểm thử', '0900001122',
             'ph_demo_2026@example.test', @accountId);

        SET @parentId = CONVERT(INT, SCOPE_IDENTITY());
    END;

    -- Lớp riêng cho dữ liệu kiểm thử, không chọn nhầm lớp thật.
    SELECT @classId = maLopHoc
    FROM dbo.LOPHOC
    WHERE tenLopHoc = N'Lớp kiểm thử BabyShark'
      AND phongHoc = 999;

    IF @classId IS NULL
    BEGIN
        INSERT INTO dbo.LOPHOC (tenLopHoc, phongHoc)
        VALUES (N'Lớp kiểm thử BabyShark', 999);

        SET @classId = CONVERT(INT, SCOPE_IDENTITY());
    END;

    -- Hồ sơ bé kiểm thử.
    SELECT @childId = maTre
    FROM dbo.TREEM
    WHERE hoTenDemTre = N'Bé Kiểm thử'
      AND tenTre = N'BabyShark'
      AND ngayThangNamSinh = '2021-06-15'
      AND maLopHoc = @classId;

    IF @childId IS NULL
    BEGIN
        INSERT INTO dbo.TREEM
            (hoTenDemTre, tenTre, ngayThangNamSinh, noiSinh, maLopHoc)
        VALUES
            (N'Bé Kiểm thử', N'BabyShark', '2021-06-15',
             N'TP. Hồ Chí Minh', @classId);

        SET @childId = CONVERT(INT, SCOPE_IDENTITY());
    END;

    -- Không liên kết bé kiểm thử nếu bé đã thuộc hồ sơ phụ huynh khác.
    IF EXISTS (
        SELECT 1
        FROM dbo.PHUHUYNH_TRE
        WHERE maTre = @childId
          AND maPhuHuynh <> @parentId
    )
    BEGIN
        THROW 50003, N'Hồ sơ bé kiểm thử đã được liên kết với phụ huynh khác.', 1;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.PHUHUYNH_TRE
        WHERE maPhuHuynh = @parentId
          AND maTre = @childId
    )
    BEGIN
        INSERT INTO dbo.PHUHUYNH_TRE (maPhuHuynh, maTre, quanHe)
        VALUES (@parentId, @childId, N'Mẹ');
    END;

    COMMIT TRANSACTION;

    SELECT
        @username AS TenDangNhap,
        @password AS MatKhauTamDeTest,
        @parentId AS MaPhuHuynh,
        @childId AS MaTre,
        N'Lớp kiểm thử BabyShark' AS LopHoc;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO


SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (
        SELECT 1 FROM dbo.TAIKHOAN WHERE tenDangNhap = 'gv_quynhnga'
    )
        THROW 50001, N'Tên đăng nhập gv_quynhnga đã tồn tại.', 1;

    IF EXISTS (
        SELECT 1 FROM dbo.GIAOVIEN
        WHERE soDienThoai = '0918987654'
           OR email = 'nga.pham@babyshark.edu.vn'
    )
        THROW 50002, N'Số điện thoại hoặc email giáo viên đã tồn tại.', 1;

    INSERT INTO dbo.TAIKHOAN (tenDangNhap, matKhau, vaiTro, trangThai)
    VALUES ('gv_quynhnga', 'Teacher123!', N'GIAOVIEN', 1);

    DECLARE @maTaiKhoan INT = CONVERT(INT, SCOPE_IDENTITY());

    INSERT INTO dbo.GIAOVIEN
        (hoTenDem, tenGiaoVien, soDienThoai, diaChiLH, email, maTaiKhoan)
    VALUES
        (N'Phạm Quỳnh', N'Nga', '0918987654',
         N'TP. Hồ Chí Minh', 'nga.pham@babyshark.edu.vn', @maTaiKhoan);

    COMMIT TRANSACTION;

    SELECT tenDangNhap, vaiTro, trangThai
    FROM dbo.TAIKHOAN
    WHERE maTaiKhoan = @maTaiKhoan;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- =============================================
-- TẠO TÀI KHOẢN ADMIN KIỂM THỬ
-- Tên đăng nhập: admin
-- Mật khẩu: 12345
-- =============================================

USE [QLMamNon];
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.TAIKHOAN
    WHERE tenDangNhap = 'admin'
)
BEGIN
    INSERT INTO dbo.TAIKHOAN
        (tenDangNhap, matKhau, vaiTro, trangThai)
    VALUES
        ('admin', '12345', N'ADMIN', 1);

    PRINT N'Đã tạo tài khoản Admin thành công.';
END
ELSE
BEGIN
    PRINT N'Tài khoản admin đã tồn tại, không thêm trùng.';
END;
GO
