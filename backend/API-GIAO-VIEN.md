# API quản lý giáo viên

Các API quản lý giáo viên chỉ dành cho tài khoản `ADMIN`. Tất cả request ghi dữ liệu cần cookie phiên đăng nhập và header CSRF `X-XSRF-TOKEN`, theo hướng dẫn trong [API-PHU-HUYNH-TRE.md](./API-PHU-HUYNH-TRE.md#thiết-lập-postman).

## Cơ sở dữ liệu

`GIAOVIEN` yêu cầu `maTaiKhoan`, do đó khi tạo hồ sơ hệ thống cấp tài khoản vai trò `GIAOVIEN` cùng transaction. Username được sinh từ họ tên và 4 số cuối điện thoại; mật khẩu tạm sinh ngẫu nhiên, lưu bằng BCrypt và chỉ trả một lần trong response tạo mới.

Schema ban đầu không có ngày sinh và trình độ chuyên môn. Trước khi chạy ứng dụng, chạy migration [20261023_giaovien_profile_fields.sql](../database/migrations/20261023_giaovien_profile_fields.sql) trên database `QLMamNon`. Hai cột mới đều nullable và migration không xóa/sửa dữ liệu hiện có.

`PHANCONG_GIAOVIEN` dùng khóa chính `(maGiaoVien, maLopHoc)`. Kết thúc phân công sẽ ghi `ngayKetThuc`, không xóa bản ghi. Schema này giữ được lịch sử hiện có, nhưng không thể lưu nhiều kỳ phân công cho cùng cặp giáo viên-lớp; API trả `409 Conflict` nếu cố tạo lại cặp đã tồn tại.

## API

### Lấy danh sách và chi tiết

- `GET /api/giao-vien` — danh sách hồ sơ, tài khoản liên kết và các phân công hiện tại/lịch sử.
- `GET /api/giao-vien/{maGiaoVien}` — chi tiết một giáo viên; trả `404` nếu không tồn tại.
- `GET /api/lop-hoc` — API lớp hiện có, frontend dùng để tải lựa chọn lớp thật.

Response danh sách/chi tiết không bao gồm password hoặc password hash. `dangPhanCong` xác định từ ít nhất một phân công đã bắt đầu và chưa kết thúc.

### Thêm hồ sơ và cấp tài khoản

`POST /api/giao-vien` trả `201 Created`. Phân công lớp là tùy chọn. Họ tên cần có ít nhất họ tên đệm và tên.

```json
{
  "hoTen": "Nguyễn Ngọc Lan",
  "ngaySinh": "1995-04-12",
  "soDienThoai": "0909123456",
  "email": "lan.nguyen@example.com",
  "diaChiLH": "Thành phố Hồ Chí Minh",
  "trinhDoChuyenMon": "Cử nhân Sư phạm Mầm non",
  "maLopHoc": 3,
  "vaiTro": "Giáo viên chủ nhiệm"
}
```

Response rút gọn:

```json
{
  "giaoVien": {
    "maGiaoVien": 12,
    "hoTen": "Nguyễn Ngọc Lan",
    "ngaySinh": "1995-04-12",
    "soDienThoai": "0909123456",
    "email": "lan.nguyen@example.com",
    "diaChiLH": "Thành phố Hồ Chí Minh",
    "trinhDoChuyenMon": "Cử nhân Sư phạm Mầm non",
    "tenDangNhap": "nguyenngoclangv3456",
    "trangThaiTaiKhoan": true,
    "dangPhanCong": true,
    "anhDaiDien": "/api/giao-vien/12/anh-dai-dien",
    "phanCong": [
      {
        "maLopHoc": 3,
        "tenLopHoc": "Lớp Mầm 1",
        "vaiTro": "Giáo viên chủ nhiệm",
        "ngayBatDau": "2026-10-23T10:00:00",
        "ngayKetThuc": null,
        "dangPhuTrach": true
      }
    ]
  },
  "tenDangNhap": "nguyenngoclangv3456",
  "matKhauTamThoi": "<chỉ-hiển-thị-một-lần>"
}
```

Số điện thoại trùng trả `409`; dữ liệu không hợp lệ trả `400`; lớp không tồn tại trả `404`. Hồ sơ, tài khoản và phân công ban đầu được ghi trong cùng transaction.

### Cập nhật hồ sơ

`PUT /api/giao-vien/{maGiaoVien}` cập nhật thông tin cá nhân, không thay đổi username, tài khoản hoặc trạng thái đăng nhập. `maLopHoc`/`vaiTro` trong body không được dùng để thay đổi phân công; sử dụng các API phân công riêng.

```json
{
  "hoTen": "Nguyễn Ngọc Lan",
  "ngaySinh": "1995-04-12",
  "soDienThoai": "0909123456",
  "email": "lan.nguyen@example.com",
  "diaChiLH": "Quận 1, Thành phố Hồ Chí Minh",
  "trinhDoChuyenMon": "Cử nhân Sư phạm Mầm non",
  "maLopHoc": null,
  "vaiTro": null
}
```

### Ảnh đại diện

- `GET /api/giao-vien/{maGiaoVien}/anh-dai-dien` — trả ảnh JPEG/PNG/WebP; nếu chưa có ảnh hoặc file đã mất thì trả ảnh mặc định.
- `POST /api/giao-vien/{maGiaoVien}/anh-dai-dien` — chỉ `ADMIN`; gửi `multipart/form-data` với trường file tên `file` và CSRF header `X-XSRF-TOKEN`. Chỉ nhận JPEG, PNG, WebP tối đa 5 MB.

Response upload: `{"anhDaiDien":"/api/giao-vien/12/anh-dai-dien"}`. Các response hồ sơ cũng có trường `anhDaiDien` là URL dùng trực tiếp trên giao diện. File được lưu ở thư mục `uploads/giao-vien` (có thể cấu hình bằng `babyshark.upload-dir`); database chỉ lưu đường dẫn tương đối trong cột `GIAOVIEN.anhDaiDien`. Khi thay ảnh, file cũ chỉ bị xóa nếu không còn bản ghi nào tham chiếu.

### Quản lý phân công

- `POST /api/giao-vien/{maGiaoVien}/phan-cong` — thêm một lớp; body: `{"maLopHoc":3,"vaiTro":"Giáo viên hỗ trợ"}`; trả `201`.
- `PUT /api/giao-vien/{maGiaoVien}/phan-cong/{maLopHoc}` — sửa vai trò, giữ nguyên ngày bắt đầu/kết thúc.
- `PATCH /api/giao-vien/{maGiaoVien}/phan-cong/{maLopHoc}/ket-thuc` — kết thúc phân công, giữ bản ghi lịch sử.

Một giáo viên có thể có nhiều lớp phân công đồng thời; API không áp đặt giới hạn số lớp hoặc vai trò chủ nhiệm khi schema/nghiệp vụ chưa có ràng buộc đó.
