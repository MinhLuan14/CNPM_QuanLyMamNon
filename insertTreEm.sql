USE QLMamNon;
GO

-- Script chèn thêm 23 trẻ em vào Lớp Mầm 1 (maLopHoc = 1) để đủ 25 trẻ
INSERT INTO dbo.TREEM (hoTenDemTre, tenTre, ngayThangNamSinh, noiSinh, maLopHoc, trangThaiHocTap)
VALUES
(N'Lê Gia', N'Huy', '2023-03-15', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Phạm Minh', N'Khang', '2023-01-20', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Hoàng Tuệ', N'Mẫn', '2023-05-12', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Vũ Ngọc', N'Diệp', '2023-04-18', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Đặng Tuấn', N'Kiệt', '2023-02-28', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Bùi Thảo', N'My', '2023-06-05', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Đỗ Minh', N'Quân', '2023-07-14', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Hồ Khánh', N'An', '2023-08-09', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Ngô Phúc', N'Khang', '2023-09-21', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Dương Ngọc', N'Ánh', '2023-03-30', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Lý Gia', N'Bảo', '2023-11-11', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Trịnh Phương', N'Linh', '2023-10-04', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Đinh Thiên', N'Ân', '2023-02-14', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Mai Anh', N'Thư', '2023-05-25', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Lâm Hữu', N'Phước', '2023-06-19', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Đoàn Bảo', N'Trâm', '2023-07-22', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Võ Hoàng', N'Nam', '2023-08-17', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Trương Cát', N'Tường', '2023-09-03', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Phan Đình', N'Phong', '2023-10-15', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Cao Thùy', N'Chi', '2023-12-01', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Huỳnh Đăng', N'Khoa', '2023-04-08', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Lương Yến', N'Nhi', '2023-01-10', N'Tp. Hồ Chí Minh', 1, N'Đang học'),
(N'Tạ Gia', N'Hưng', '2023-11-28', N'Tp. Hồ Chí Minh', 1, N'Đang học');
GO

-- Kiểm tra danh sách trẻ sau khi thêm
SELECT maTre, hoTenDemTre, tenTre, CONVERT(VARCHAR(10), ngayThangNamSinh, 103) AS ngaySinh, noiSinh, trangThaiHocTap, maLopHoc
FROM dbo.TREEM;
GO
