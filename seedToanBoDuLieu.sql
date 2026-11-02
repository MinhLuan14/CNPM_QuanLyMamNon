USE QLMamNon;
GO

-- =====================================================================
-- SCRIPT NẠP TOÀN BỘ DỮ LIỆU CHUẨN CHO DỰ ÁN BABYSHARK (QLMAMNON)
-- Thứ tự: 1. Lớp học -> 2. Giáo viên & Phân công -> 3. 25 Trẻ em -> 4. Thực đơn tuần
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TẠO LỚP HỌC (LOPHOC)
-- ---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.LOPHOC WHERE tenLopHoc = N'Lớp Mầm 1')
BEGIN
    INSERT INTO dbo.LOPHOC (tenLopHoc, phongHoc, SoLuongToiDa, DoTuoi)
    VALUES (N'Lớp Mầm 1', 101, 25, N'3-4 tuổi');
END;
GO

DECLARE @maLop INT;
SELECT TOP 1 @maLop = maLopHoc FROM dbo.LOPHOC WHERE tenLopHoc = N'Lớp Mầm 1';

-- ---------------------------------------------------------------------
-- 2. TẠO HỒ SƠ GIÁO VIÊN VÀ PHÂN CÔNG CHỦ NHIỆM (GIAOVIEN & PHANCONG_GIAOVIEN)
-- ---------------------------------------------------------------------
DECLARE @maTaiKhoanGV INT;
SELECT TOP 1 @maTaiKhoanGV = maTaiKhoan FROM dbo.TAIKHOAN WHERE tenDangNhap = 'gv_quynhnga';

IF @maTaiKhoanGV IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.GIAOVIEN WHERE maTaiKhoan = @maTaiKhoanGV)
BEGIN
    INSERT INTO dbo.GIAOVIEN (hoTenDem, tenGiaoVien, soDienThoai, diaChiLH, email, maTaiKhoan, ngaySinh, trinhDoChuyenMon)
    VALUES (N'Nguyễn Quỳnh', N'Nga', '0912345678', N'TP. Hồ Chí Minh', 'quynhnga@gmail.com', @maTaiKhoanGV, '1995-05-15', N'Cử nhân Sư phạm Mầm non');
END;

DECLARE @maGV INT;
SELECT TOP 1 @maGV = maGiaoVien FROM dbo.GIAOVIEN WHERE soDienThoai = '0912345678';

IF @maGV IS NOT NULL AND @maLop IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.PHANCONG_GIAOVIEN WHERE maGiaoVien = @maGV AND maLopHoc = @maLop)
BEGIN
    INSERT INTO dbo.PHANCONG_GIAOVIEN (maGiaoVien, maLopHoc, ngayBatDau, ngayKetThuc, vaiTro)
    VALUES (@maGV, @maLop, '2026-09-01 07:00:00', NULL, N'Giáo viên chủ nhiệm');
END;
GO

-- ---------------------------------------------------------------------
-- 3. TẠO ĐẦY ĐỦ 25 TRẺ EM XẾP VÀO LỚP MẦM 1 (TREEM)
-- ---------------------------------------------------------------------
DECLARE @maLopHoc INT;
SELECT TOP 1 @maLopHoc = maLopHoc FROM dbo.LOPHOC WHERE tenLopHoc = N'Lớp Mầm 1';

IF (SELECT COUNT(*) FROM dbo.TREEM WHERE maLopHoc = @maLopHoc) < 25
BEGIN
    DELETE FROM dbo.TREEM WHERE maLopHoc = @maLopHoc;

    INSERT INTO dbo.TREEM (hoTenDemTre, tenTre, ngayThangNamSinh, noiSinh, maLopHoc, trangThaiHocTap)
    VALUES
    (N'Trần Bảo', N'An', '2023-06-02', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Nguyễn Thị', N'Hương', '2023-10-01', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Lê Gia', N'Huy', '2023-03-15', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Phạm Minh', N'Khang', '2023-01-20', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Hoàng Tuệ', N'Mẫn', '2023-05-12', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Vũ Ngọc', N'Diệp', '2023-04-18', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Đặng Tuấn', N'Kiệt', '2023-02-28', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Bùi Thảo', N'My', '2023-06-05', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Đỗ Minh', N'Quân', '2023-07-14', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Hồ Khánh', N'An', '2023-08-09', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Ngô Phúc', N'Khang', '2023-09-21', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Dương Ngọc', N'Ánh', '2023-03-30', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Lý Gia', N'Bảo', '2023-11-11', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Trịnh Phương', N'Linh', '2023-10-04', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Đinh Thiên', N'Ân', '2023-02-14', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Mai Anh', N'Thư', '2023-05-25', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Lâm Hữu', N'Phước', '2023-06-19', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Đoàn Bảo', N'Trâm', '2023-07-22', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Võ Hoàng', N'Nam', '2023-08-17', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Trương Cát', N'Tường', '2023-09-03', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Phan Đình', N'Phong', '2023-10-15', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Cao Thùy', N'Chi', '2023-12-01', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Huỳnh Đăng', N'Khoa', '2023-04-08', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Lương Yến', N'Nhi', '2023-01-10', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học'),
    (N'Tạ Gia', N'Hưng', '2023-11-28', N'Tp. Hồ Chí Minh', @maLopHoc, N'Đang học');
END;
GO

-- ---------------------------------------------------------------------
-- 4. TẠO 23 MÓN ĂN VÀ THỰC ĐƠN TUẦN TỪ THỨ HAI ĐẾN THỨ SÁU (MONAN, THUCDON, CHITIETTHUCDON)
-- ---------------------------------------------------------------------
IF (SELECT COUNT(*) FROM dbo.MONAN) < 23
BEGIN
    INSERT INTO dbo.MONAN (tenMonAn, loaiMon, thanhPhan, donGia, trangThai)
    VALUES
    (N'Cháo sườn bắp non', N'Món sáng', N'Heo nạc, sườn non, bắp ngọt, gạo tẻ, hành ngò', 15000, 1),
    (N'Sữa tươi Nutifood', N'Đồ uống', N'Sữa tươi tiệt trùng có đường', 8000, 1),
    (N'Cơm trắng dẻo', N'Món chính', N'Gạo thơm lài dẻo mềm', 5000, 1),
    (N'Thịt heo kho trứng cút', N'Món mặn', N'Thịt nạc heo, trứng cút, nước dừa xiêm', 20000, 1),
    (N'Canh bí đỏ thịt bằm', N'Món canh', N'Bí đỏ hồ lô, thịt heo nạc bằm, hành hoa', 10000, 1),
    (N'Bắp cải xào cà rốt', N'Món rau', N'Bắp cải trắng, cà rốt tỉa hoa, dầu hào', 7000, 1),
    (N'Chuối cau tráng miệng', N'Tráng miệng', N'Chuối cau chín tự nhiên', 5000, 1),
    (N'Bánh flan caramen', N'Món phụ', N'Trứng gà ta, sữa đặc, sữa tươi, caramen', 10000, 1),
    (N'Nước cam vắt tươi', N'Đồ uống', N'Cam sành tươi, mật ong nguyên chất', 8000, 1),

    (N'Phở gà xé rau mùi', N'Món sáng', N'Bánh phở tươi, ức gà ta xé sợi, nước hầm xương ống', 18000, 1),
    (N'Sữa đậu nành mè đen', N'Đồ uống', N'Đậu nành nguyên chất, mè đen rang thơm', 7000, 1),
    (N'Cá hồi sốt cà chua', N'Món mặn', N'Filet cá hồi tươi, cà chua chín, thì là', 25000, 1),
    (N'Canh rau ngót nấu tôm', N'Món canh', N'Rau ngót non, tôm sú tươi bằm nhuyễn', 12000, 1),
    (N'Su su xào thịt bò', N'Món rau', N'Su su non bào sợi, thịt thăn bò bằm', 12000, 1),
    (N'Dưa hấu tráng miệng', N'Tráng miệng', N'Dưa hấu đỏ không hạt ướp mát', 6000, 1),
    (N'Sữa chua trái cây dầm', N'Món phụ', N'Sữa chua men sống, thanh long, dâu tây', 12000, 1),

    (N'Nui xoắn nấu sườn heo', N'Món sáng', N'Nui rau củ ngũ sắc, sườn heo mềm, cà rốt', 16000, 1),
    (N'Sữa hạt óc chó yến mạch', N'Đồ uống', N'Hạt óc chó Mỹ, yến mạch cán dẹt, đường phèn', 10000, 1),
    (N'Tôm rim thịt nạc', N'Món mặn', N'Tôm đất bóc nõn, thịt nạc thăn ram mặn ngọt', 22000, 1),
    (N'Canh mồng tơi cua đồng', N'Món canh', N'Cua đồng giã nhuyễn, rau mồng tơi, mướp hương', 15000, 1),
    (N'Đậu cô ve xào nấm', N'Món rau', N'Đậu cô ve non bẻ khúc, nấm rơm tươi', 8000, 1),
    (N'Đu đủ chín tráng miệng', N'Tráng miệng', N'Đu đủ ruột đỏ ngọt mềm thái hạt lựu', 5000, 1),
    (N'Bánh bông lan chuối', N'Món phụ', N'Bột mì hữu cơ, chuối ngự chín, bơ lạt', 9000, 1),

    (N'Súp gà bắp non', N'Món sáng', N'Ức gà ta xé sợi, bắp ngọt, nấm tuyết, trứng gà', 16000, 1),
    (N'Sữa hạt hạnh nhân', N'Đồ uống', N'Hạt hạnh nhân xay nhuyễn, sữa tươi, đường phèn', 10000, 1),
    (N'Thịt bò hầm củ quả', N'Món mặn', N'Thịt bò bắp mềm, khoai tây, cà rốt tỉa hoa', 25000, 1),
    (N'Canh cải ngọt thịt bằm', N'Món canh', N'Rau cải ngọt non, thịt nạc heo bằm nhuyễn', 10000, 1),
    (N'Chè hạt sen long nhãn', N'Món phụ', N'Hạt sen tươi hầm mềm, long nhãn, đường phèn', 12000, 1),
    (N'Táo tươi tráng miệng', N'Tráng miệng', N'Táo Envy ngọt giòn gọt vỏ ngâm muối', 6000, 1),

    (N'Bánh canh tôm thịt nạc', N'Món sáng', N'Sợi bánh canh bột gạo, tôm bóc nõn, thịt nạc lát mỏng', 18000, 1),
    (N'Gà ram sả mật ong', N'Món mặn', N'Đùi gà rút xương, sốt mật ong dịu nhẹ, sả băm', 22000, 1),
    (N'Canh bí xanh hầm xương', N'Món canh', N'Bí đao xanh, xương ống hầm lấy nước ngọt', 11000, 1),
    (N'Rau muống xào tỏi', N'Món rau', N'Rau muống ngọn non chần sơ, dầu hào', 7000, 1),
    (N'Bánh su kem sữa tươi', N'Món phụ', N'Vỏ bánh su mềm, kem trứng sữa tươi vani', 10000, 1);
END;
GO

-- Tạo Thực đơn Tuần
IF NOT EXISTS (SELECT 1 FROM dbo.THUCDON WHERE tuanApDung = 44 AND namApDung = 2026)
BEGIN
    INSERT INTO dbo.THUCDON (tuanApDung, thangApDung, namApDung, ngayBatDau, ngayKetThuc, ghiChu, trangThai)
    VALUES (44, 10, 2026, '2026-10-26 00:00:00', '2026-10-30 23:59:59', N'Thực đơn dinh dưỡng tiêu chuẩn Tuần 44 - Khối Mầm', 1);
END;
GO

DECLARE @maThucDon INT;
SELECT TOP 1 @maThucDon = maThucDon FROM dbo.THUCDON WHERE tuanApDung = 44 AND namApDung = 2026;

IF @maThucDon IS NOT NULL AND (SELECT COUNT(*) FROM dbo.CHITIETTHUCDON WHERE maThucDon = @maThucDon) = 0
BEGIN
    -- Thứ Hai (2026-10-26)
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-26 07:30:00', N'Bữa sáng', 15000, N'Ăn ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Cháo sườn bắp non';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-26 07:30:00', N'Bữa sáng', 8000, N'Uống ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Sữa tươi Nutifood';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-26 11:15:00', N'Bữa trưa', 20000, N'Món mặn chính', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Thịt heo kho trứng cút';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-26 11:15:00', N'Bữa trưa', 10000, N'Canh ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Canh bí đỏ thịt bằm';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-26 11:15:00', N'Bữa trưa', 7000, N'Rau củ xào', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Bắp cải xào cà rốt';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-26 11:15:00', N'Bữa trưa', 5000, N'Trái cây', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Chuối cau tráng miệng';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-26 14:30:00', N'Bữa phụ chiều', 10000, N'Ăn xế', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Bánh flan caramen';

    -- Thứ Ba (2026-10-27)
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-27 07:30:00', N'Bữa sáng', 18000, N'Ăn ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Phở gà xé rau mùi';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-27 07:30:00', N'Bữa sáng', 7000, N'Uống ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Sữa đậu nành mè đen';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-27 11:15:00', N'Bữa trưa', 25000, N'Món mặn giàu Omega-3', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Cá hồi sốt cà chua';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-27 11:15:00', N'Bữa trưa', 12000, N'Canh ngọt thanh', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Canh rau ngót nấu tôm';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-27 11:15:00', N'Bữa trưa', 12000, N'Rau củ xào', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Su su xào thịt bò';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-27 11:15:00', N'Bữa trưa', 6000, N'Trái cây', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Dưa hấu tráng miệng';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-27 14:30:00', N'Bữa phụ chiều', 12000, N'Ăn xế', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Sữa chua trái cây dầm';

    -- Thứ Tư (2026-10-28)
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-28 07:30:00', N'Bữa sáng', 16000, N'Ăn ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Nui xoắn nấu sườn heo';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-28 07:30:00', N'Bữa sáng', 10000, N'Uống ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Sữa hạt óc chó yến mạch';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-28 11:15:00', N'Bữa trưa', 22000, N'Món mặn', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Tôm rim thịt nạc';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-28 11:15:00', N'Bữa trưa', 15000, N'Canh thanh mát', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Canh mồng tơi cua đồng';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-28 11:15:00', N'Bữa trưa', 8000, N'Rau củ xào', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Đậu cô ve xào nấm';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-28 11:15:00', N'Bữa trưa', 5000, N'Trái cây', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Đu đủ chín tráng miệng';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-28 14:30:00', N'Bữa phụ chiều', 9000, N'Ăn xế', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Bánh bông lan chuối';

    -- Thứ Năm (2026-10-29)
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-29 07:30:00', N'Bữa sáng', 16000, N'Ăn ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Súp gà bắp non';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-29 07:30:00', N'Bữa sáng', 10000, N'Uống ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Sữa hạt hạnh nhân';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-29 11:15:00', N'Bữa trưa', 25000, N'Món mặn giàu dinh dưỡng', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Thịt bò hầm củ quả';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-29 11:15:00', N'Bữa trưa', 10000, N'Canh rau xanh', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Canh cải ngọt thịt bằm';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-29 11:15:00', N'Bữa trưa', 8000, N'Rau xào', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Bắp cải xào cà rốt';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-29 11:15:00', N'Bữa trưa', 6000, N'Trái cây tráng miệng', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Táo tươi tráng miệng';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-29 14:30:00', N'Bữa phụ chiều', 12000, N'Ăn xế thanh mát', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Chè hạt sen long nhãn';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-29 14:30:00', N'Bữa phụ chiều', 8000, N'Uống bổ sung vitamin', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Nước cam vắt tươi';

    -- Thứ Sáu (2026-10-30)
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-30 07:30:00', N'Bữa sáng', 18000, N'Ăn ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Bánh canh tôm thịt nạc';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-30 07:30:00', N'Bữa sáng', 8000, N'Uống ấm', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Sữa tươi Nutifood';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-30 11:15:00', N'Bữa trưa', 22000, N'Món mặn cuối tuần', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Gà ram sả mật ong';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-30 11:15:00', N'Bữa trưa', 11000, N'Canh thanh mát', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Canh bí xanh hầm xương';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-30 11:15:00', N'Bữa trưa', 7000, N'Rau xào', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Rau muống xào tỏi';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-30 11:15:00', N'Bữa trưa', 6000, N'Trái cây tráng miệng', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Dưa hấu tráng miệng';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-30 14:30:00', N'Bữa phụ chiều', 10000, N'Ăn xế', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Bánh su kem sữa tươi';
    INSERT INTO dbo.CHITIETTHUCDON (ngayAn, buaAn, donGia, ghiChu, maThucDon, maMonAn)
    SELECT '2026-10-30 14:30:00', N'Bữa phụ chiều', 7000, N'Uống bổ dưỡng', @maThucDon, maMonAn FROM dbo.MONAN WHERE tenMonAn = N'Sữa đậu nành mè đen';
END;
GO

-- ---------------------------------------------------------------------
-- 5. TẠO THÔNG TIN PHỤ HUYNH VÀ LIÊN KẾT VỚI 25 TRẺ EM (PHUHUYNH & PHUHUYNH_TRE)
-- ---------------------------------------------------------------------
SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_PHUHUYNH_MATAIKHOAN')
BEGIN
    ALTER TABLE dbo.PHUHUYNH DROP CONSTRAINT UQ_PHUHUYNH_MATAIKHOAN;
END;
GO

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.PHUHUYNH') AND name = N'maTaiKhoan' AND is_nullable = 0)
BEGIN
    ALTER TABLE dbo.PHUHUYNH ALTER COLUMN maTaiKhoan INT NULL;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_PHUHUYNH_MATAIKHOAN')
BEGIN
    CREATE UNIQUE INDEX UX_PHUHUYNH_MATAIKHOAN ON dbo.PHUHUYNH(maTaiKhoan) WHERE maTaiKhoan IS NOT NULL;
END;
GO

IF (SELECT COUNT(*) FROM dbo.PHUHUYNH) < 25
BEGIN
    DELETE FROM dbo.PHUHUYNH_TRE;
    DELETE FROM dbo.PHUHUYNH;

    INSERT INTO dbo.PHUHUYNH (hoTenDemPH, tenPH, diaChiLH, soDienThoai, email, maTaiKhoan)
    VALUES
    (N'Trần Văn', N'Hùng', N'123 Lê Lợi, P. Bến Nghé, Quận 1, TP. HCM', '0901234501', 'tranhung@gmail.com', NULL),
    (N'Nguyễn Thị', N'Thu', N'45 Hai Bà Trưng, P. 6, Quận 3, TP. HCM', '0901234502', 'nguyenthu@gmail.com', NULL),
    (N'Lê Văn', N'Nam', N'78 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM', '0901234503', 'lenam@gmail.com', NULL),
    (N'Phạm Tuấn', N'Anh', N'12 Điện Biên Phủ, P. 15, Bình Thạnh, TP. HCM', '0901234504', 'tuananh@gmail.com', NULL),
    (N'Trần Thu', N'Trang', N'56 Pastuer, P. Bến Nghé, Quận 1, TP. HCM', '0901234505', 'thutrang@gmail.com', NULL),
    (N'Vũ Đức', N'Thịnh', N'89 Võ Thị Sáu, P. 7, Quận 3, TP. HCM', '0901234506', 'ducthinh@gmail.com', NULL),
    (N'Đặng Hoàng', N'Minh', N'34 Nam Kỳ Khởi Nghĩa, Quận 1, TP. HCM', '0901234507', 'hoangminh@gmail.com', NULL),
    (N'Bùi Thị', N'Mai', N'90 Cách Mạng Tháng 8, Quận 3, TP. HCM', '0901234508', 'thimai@gmail.com', NULL),
    (N'Đỗ Quốc', N'Toàn', N'23 Lý Tự Trọng, Quận 1, TP. HCM', '0901234509', 'quoctoan@gmail.com', NULL),
    (N'Hồ Văn', N'Thành', N'67 Trần Hưng Đạo, Quận 5, TP. HCM', '0901234510', 'vanthanh@gmail.com', NULL),
    (N'Ngô Đình', N'Khang', N'11 Nguyễn Thị Minh Khai, Quận 1, TP. HCM', '0901234511', 'dinhkhang@gmail.com', NULL),
    (N'Dương Thị', N'Diệu', N'44 Lê Duẩn, Quận 1, TP. HCM', '0901234512', 'thidieu@gmail.com', NULL),
    (N'Lý Văn', N'Thái', N'88 Hoàng Văn Thụ, Phú Nhuận, TP. HCM', '0901234513', 'vanthai@gmail.com', NULL),
    (N'Trịnh Minh', N'Tuấn', N'15 Phan Đăng Lưu, Bình Thạnh, TP. HCM', '0901234514', 'minhtuan@gmail.com', NULL),
    (N'Đinh Quốc', N'Bảo', N'99 Cộng Hòa, Tân Bình, TP. HCM', '0901234515', 'quocbao@gmail.com', NULL),
    (N'Mai Văn', N'Khánh', N'33 Bạch Đằng, Bình Thạnh, TP. HCM', '0901234516', 'vankhanh@gmail.com', NULL),
    (N'Lâm Ngọc', N'Hải', N'77 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP. HCM', '0901234517', 'ngochai@gmail.com', NULL),
    (N'Đoàn Thị', N'Hương', N'22 Đinh Tiên Hoàng, Quận 1, TP. HCM', '0901234518', 'thihuong@gmail.com', NULL),
    (N'Võ Quốc', N'Việt', N'55 Phan Xích Long, Phú Nhuận, TP. HCM', '0901234519', 'quocviet@gmail.com', NULL),
    (N'Trương Văn', N'Đức', N'66 Nguyễn Đình Chiểu, Quận 3, TP. HCM', '0901234520', 'vanduc@gmail.com', NULL),
    (N'Phan Văn', N'Lộc', N'40 Nguyễn Trãi, Quận 5, TP. HCM', '0901234521', 'vanloc@gmail.com', NULL),
    (N'Cao Thị', N'Kim Oanh', N'18 Nguyễn Bỉnh Khiêm, Quận 1, TP. HCM', '0901234522', 'kimoanh@gmail.com', NULL),
    (N'Huỳnh Văn', N'Sang', N'82 Trần Quang Khải, Quận 1, TP. HCM', '0901234523', 'vansang@gmail.com', NULL),
    (N'Lương Thị', N'Cúc', N'51 Nơ Trang Long, Bình Thạnh, TP. HCM', '0901234524', 'thicuc@gmail.com', NULL),
    (N'Tạ Quốc', N'Huy', N'37 Huỳnh Thúc Kháng, Quận 1, TP. HCM', '0901234525', 'quochuy@gmail.com', NULL);
END;
GO

IF (SELECT COUNT(*) FROM dbo.PHUHUYNH_TRE) < 25
BEGIN
    DELETE FROM dbo.PHUHUYNH_TRE;

    INSERT INTO dbo.PHUHUYNH_TRE (maPhuHuynh, maTre, quanHe)
    SELECT p.maPhuHuynh, t.maTre,
        CASE 
            WHEN p.hoTenDemPH LIKE N'%Thị%' 
              OR p.hoTenDemPH LIKE N'%Thu%' 
              OR p.tenPH LIKE N'%Trang%' 
              OR p.tenPH LIKE N'%Oanh%' 
              OR p.tenPH LIKE N'%Mai%' 
              OR p.tenPH LIKE N'%Cúc%' 
              OR p.tenPH LIKE N'%Thu%' 
              OR p.tenPH LIKE N'%Diệu%' 
              OR p.tenPH LIKE N'%Hương%' 
            THEN N'Mẹ'
            ELSE N'Bố'
        END AS quanHe
    FROM (
        SELECT ROW_NUMBER() OVER (ORDER BY maPhuHuynh) AS rn, maPhuHuynh, hoTenDemPH, tenPH FROM dbo.PHUHUYNH
    ) p
    JOIN (
        SELECT ROW_NUMBER() OVER (ORDER BY maTre) AS rn, maTre FROM dbo.TREEM WHERE maLopHoc = (SELECT TOP 1 maLopHoc FROM dbo.LOPHOC WHERE tenLopHoc = N'Lớp Mầm 1')
    ) t ON p.rn = t.rn;
END;
GO
