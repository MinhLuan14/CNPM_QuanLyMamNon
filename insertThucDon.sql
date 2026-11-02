USE QLMamNon;
GO

-- 1. Thêm danh mục món ăn (MONAN)
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
GO

-- 2. Thêm Thực đơn tuần áp dụng (THUCDON)
INSERT INTO dbo.THUCDON (tuanApDung, thangApDung, namApDung, ngayBatDau, ngayKetThuc, ghiChu, trangThai)
VALUES
(44, 10, 2026, '2026-10-26 00:00:00', '2026-10-30 23:59:59', N'Thực đơn dinh dưỡng tiêu chuẩn Tuần 44 - Khối Mầm', 1);
GO

-- 3. Chi tiết thực đơn các ngày (CHITIETTHUCDON)
DECLARE @maThucDon INT = SCOPE_IDENTITY();
IF @maThucDon IS NULL
BEGIN
    SELECT TOP 1 @maThucDon = maThucDon FROM dbo.THUCDON ORDER BY maThucDon DESC;
END;

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
GO
