USE QLMamNon;
GO

SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE parent_object_id = OBJECT_ID(N'dbo.PHUHUYNH')
          AND name = N'FK_PHUHUYNH_TAIKHOAN'
    )
    BEGIN
        ALTER TABLE dbo.PHUHUYNH DROP CONSTRAINT FK_PHUHUYNH_TAIKHOAN;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.key_constraints
        WHERE parent_object_id = OBJECT_ID(N'dbo.PHUHUYNH')
          AND name = N'UQ_PHUHUYNH_MATAIKHOAN'
    )
    BEGIN
        ALTER TABLE dbo.PHUHUYNH DROP CONSTRAINT UQ_PHUHUYNH_MATAIKHOAN;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.PHUHUYNH')
          AND name = N'maTaiKhoan'
          AND is_nullable = 0
    )
    BEGIN
        ALTER TABLE dbo.PHUHUYNH ALTER COLUMN maTaiKhoan INT NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.PHUHUYNH')
          AND name = N'UX_PHUHUYNH_MATAIKHOAN'
    )
    BEGIN
        CREATE UNIQUE INDEX UX_PHUHUYNH_MATAIKHOAN
            ON dbo.PHUHUYNH(maTaiKhoan)
            WHERE maTaiKhoan IS NOT NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE parent_object_id = OBJECT_ID(N'dbo.PHUHUYNH')
          AND name = N'FK_PHUHUYNH_TAIKHOAN'
    )
    BEGIN
        ALTER TABLE dbo.PHUHUYNH
            ADD CONSTRAINT FK_PHUHUYNH_TAIKHOAN
            FOREIGN KEY (maTaiKhoan) REFERENCES dbo.TAIKHOAN(maTaiKhoan);
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
