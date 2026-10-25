# API quản lý thực đơn dinh dưỡng

Base URL: `http://localhost:8888`. Các API trong tài liệu này chỉ dành cho `ADMIN`. Request thay đổi dữ liệu cần cookie phiên đăng nhập và CSRF header `X-XSRF-TOKEN`; xem phần thiết lập Postman trong [API-PHU-HUYNH-TRE.md](./API-PHU-HUYNH-TRE.md#thiết-lập-postman).

## Schema hiện dùng

Các entity khớp ba bảng có sẵn trong [Script.sql](../Script.sql):

- `THUCDON`: `maThucDon` (IDENTITY), tuần/tháng/năm áp dụng, ngày bắt đầu/kết thúc (`DATETIME`), ghi chú và trạng thái (`BIT` nullable).
- `MONAN`: `maMonAn` (IDENTITY), tên, loại, thành phần và trạng thái (`BIT` nullable).
- `CHITIETTHUCDON`: `maChiTietThucDon` (IDENTITY), ngày ăn (`DATETIME`), bữa ăn, đơn giá (`DECIMAL(10,2)`), ghi chú và hai khóa ngoại bắt buộc.

Không có migration hoặc thay đổi schema trong chức năng này. `tuanApDung` dùng tuần ISO; thực đơn mới áp dụng từ thứ Hai đến Chủ nhật. Tháng/năm được lấy từ ngày bắt đầu. `buaAn` giữ kiểu chuỗi tối đa 30 ký tự như schema; backend không thêm enum hay giá trị cố định.

## Thực đơn và món theo ngày/bữa

- `GET /api/thuc-don` — danh sách thực đơn (không kèm chi tiết để tải gọn).
- `GET /api/thuc-don/{maThucDon}` — thông tin thực đơn kèm các món thuộc `CHITIETTHUCDON` và `MONAN`.
- `POST /api/thuc-don` — tạo thực đơn; trả `201`.
- `PUT /api/thuc-don/{maThucDon}` — cập nhật thực đơn.
- `DELETE /api/thuc-don/{maThucDon}` — chỉ xóa thực đơn không có chi tiết; trả `409` nếu còn món để tránh xóa dây chuyền ngoài ý muốn.
- `POST /api/thuc-don/{maThucDon}/chi-tiet` — thêm món vào ngày/bữa; trả `201`.
- `PUT /api/thuc-don/{maThucDon}/chi-tiet/{maChiTietThucDon}` — sửa món/ngày/bữa/đơn giá/ghi chú.
- `DELETE /api/thuc-don/{maThucDon}/chi-tiet/{maChiTietThucDon}` — xóa một món khỏi thực đơn.

Tạo/cập nhật thực đơn:

```json
{
  "tuanApDung": 43,
  "thangApDung": 10,
  "namApDung": 2026,
  "ngayBatDau": "2026-10-19",
  "ngayKetThuc": "2026-10-25",
  "ghiChu": "Thực đơn tuần",
  "trangThai": true
}
```

Tạo/cập nhật chi tiết:

```json
{
  "ngayAn": "2026-10-20",
  "buaAn": "Bữa sáng",
  "ghiChu": null,
  "maMonAn": 4
}
```

Món trùng trong cùng ngày và cùng bữa bị từ chối (`409`). Chỉ món `trangThai=true` có thể thêm vào thực đơn. Ngày ăn phải nằm trong thời hạn thực đơn. `donGia` của chi tiết luôn được backend lấy từ `MONAN.donGia`; giá gửi kèm từ client (nếu có ở client cũ) bị bỏ qua. Nếu món chưa có đơn giá, API trả `409`. Khi đổi món trong chi tiết, backend lấy giá hiện hành của món mới; khi chỉ sửa ngày/bữa/ghi chú mà giữ nguyên món, giá đã lưu trong chi tiết được giữ nguyên.

## Danh mục món ăn

- `GET /api/mon-an?keyword=cháo&loaiMon=Món%20sáng&trangThai=true` — danh sách và lọc; bỏ tham số để lấy tất cả.
- `GET /api/mon-an/{maMonAn}` — chi tiết món.
- `POST /api/mon-an` — tạo; mã món sinh bởi IDENTITY và trả `201`.
- `PUT /api/mon-an/{maMonAn}` — cập nhật tên, loại, thành phần, đơn giá và trạng thái.
- `DELETE /api/mon-an/{maMonAn}` — xóa món chưa được sử dụng; trả `404` nếu không tồn tại và `409` nếu đang được chi tiết thực đơn tham chiếu.
- `PATCH /api/mon-an/{maMonAn}/trang-thai` — đổi trạng thái, body `{"trangThai":false}`.

Món đang được chi tiết thực đơn tham chiếu không thể xóa; hãy gỡ món khỏi các thực đơn liên quan trước khi thử lại. API không xóa dây chuyền chi tiết thực đơn và tôn trọng khóa ngoại `FK_CHITIETTHUCDON_MONAN`. Món cũng có thể được ngừng sử dụng bằng `trangThai=false`; các chi tiết thực đơn đã tham chiếu được giữ nguyên. Trường trạng thái là `BIT` nullable, giá trị null cũ được hiển thị là “Chưa xác định”.

Giá món ăn dùng `DECIMAL(12,2)` và được ánh xạ thành `BigDecimal`. Ví dụ payload tạo/cập nhật:

```json
{
  "tenMonAn": "Cháo thịt bằm",
  "loaiMon": "Món sáng",
  "thanhPhan": "Thịt heo, gạo",
  "donGia": 12000.00,
  "trangThai": true
}
```

`donGia` là bắt buộc, không âm, tối đa 10 chữ số phần nguyên và 2 chữ số thập phân. Cột giá đã tồn tại trong SQL Server; chức năng không tạo hoặc thay đổi schema.

## Cách thử trên giao diện

1. Khởi động SQL Server/database `QLMamNon`, backend trong `backend` bằng `.\mvnw.cmd spring-boot:run`, rồi frontend trong `frontend` bằng `npm run dev`.
2. Đăng nhập với tài khoản `ADMIN`; mở **Quản lý thực đơn dinh dưỡng**.
3. Tạo thực đơn tuần; sau đó thêm danh mục món ăn và các món vào ngày/bữa.
4. Chuyển tuần/ngày, tải lại trang để xác nhận dữ liệu được tải lại từ SQL Server. Nút in chỉ in khi đã tải thành công chi tiết thực đơn của tuần.
