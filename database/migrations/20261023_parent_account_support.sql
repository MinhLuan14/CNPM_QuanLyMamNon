USE QLMamNon;
GO

SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.YEUCAU_HOTRO_TAIKHOAN', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.YEUCAU_HOTRO_TAIKHOAN
        (
            maYeuCau INT IDENTITY(1,1) NOT NULL,
            maPhuHuynh INT NULL,
            hoTen NVARCHAR(356) NOT NULL,
            soDienThoai VARCHAR(20) NOT NULL,
            email VARCHAR(100) NULL,
            loaiYeuCau VARCHAR(40) NOT NULL,
            noiDung NVARCHAR(1000) NULL,
            trangThai VARCHAR(20) NOT NULL
                CONSTRAINT DF_YEUCAU_HOTRO_TAIKHOAN_trangThai DEFAULT ('CHO_XU_LY'),
            thoiGianTao DATETIME2 NOT NULL
                CONSTRAINT DF_YEUCAU_HOTRO_TAIKHOAN_thoiGianTao DEFAULT (SYSUTCDATETIME()),
            thoiGianCapNhat DATETIME2 NOT NULL
                CONSTRAINT DF_YEUCAU_HOTRO_TAIKHOAN_thoiGianCapNhat DEFAULT (SYSUTCDATETIME()),
            maTaiKhoanXuLy INT NULL,
            ghiChuXuLy NVARCHAR(4000) NULL,
            CONSTRAINT PK_YEUCAU_HOTRO_TAIKHOAN PRIMARY KEY (maYeuCau),
            CONSTRAINT FK_YEUCAU_HOTRO_TAIKHOAN_PHUHUYNH
                FOREIGN KEY (maPhuHuynh) REFERENCES dbo.PHUHUYNH(maPhuHuynh),
            CONSTRAINT FK_YEUCAU_HOTRO_TAIKHOAN_TAIKHOAN
                FOREIGN KEY (maTaiKhoanXuLy) REFERENCES dbo.TAIKHOAN(maTaiKhoan),
            CONSTRAINT CK_YEUCAU_HOTRO_TAIKHOAN_trangThai CHECK (
                trangThai IN (
                    'CHO_XU_LY', 'DANG_XU_LY', 'CHO_XAC_MINH',
                    'DA_XAC_MINH', 'DA_GIAI_QUYET', 'TU_CHOI', 'DA_HUY'
                )
            )
        );

        CREATE INDEX IX_YEUCAU_HOTRO_TAIKHOAN_phone_created
            ON dbo.YEUCAU_HOTRO_TAIKHOAN(soDienThoai, thoiGianTao);

        CREATE INDEX IX_YEUCAU_HOTRO_TAIKHOAN_status_created
            ON dbo.YEUCAU_HOTRO_TAIKHOAN(trangThai, thoiGianTao);
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;
    THROW;
END CATCH;
GO
