USE QLMamNon;
GO

SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.TREEM')
          AND name = N'maLopHoc'
          AND is_nullable = 0
    )
    BEGIN
        ALTER TABLE dbo.TREEM ALTER COLUMN maLopHoc INT NULL;
    END;

    IF COL_LENGTH(N'dbo.TREEM', N'trangThaiHocTap') IS NULL
    BEGIN
        ALTER TABLE dbo.TREEM
        ADD trangThaiHocTap NVARCHAR(30) NOT NULL
            CONSTRAINT DF_TREEM_trangThaiHocTap DEFAULT (N'Đang học') WITH VALUES;
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
