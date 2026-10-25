# API quản lý liên kết phụ huynh - trẻ em

Base URL: `http://localhost:8888`

Các API dưới đây cần đăng nhập. API quản trị yêu cầu tài khoản có vai trò `ADMIN`; phụ huynh chỉ đọc được hồ sơ và liên kết thuộc tài khoản của mình. Với `GET /api/tre-em`, phụ huynh chỉ nhận trẻ đã liên kết; `GET /api/tre-em/{maTre}` từ chối nếu trẻ chưa liên kết. Tìm kiếm, danh sách theo lớp và thống kê chỉ dành cho nhân viên. Với session hiện tại, Postman phải giữ cookie đăng nhập và gửi CSRF token cho các request ghi dữ liệu.

## Thanh toán học phí bằng VietQR

Backend cung cấp `GET /api/phu-huynh/hoc-phi` để đọc các phiếu thu của trẻ đang liên kết với phụ huynh đã đăng nhập và `POST /api/phu-huynh/hoc-phi/{maHocPhi}/vietqr` để yêu cầu tạo QR. Request tạo QR không nhận số tiền hoặc mã phụ huynh từ trình duyệt. Backend kiểm tra quyền sở hữu, tính số tiền từ dữ liệu học phí và chỉ trả thông tin QR; không ghi giao dịch hoặc đổi trạng thái phiếu thu. Request POST cần cookie session và header CSRF như hướng dẫn bên dưới.

Request `POST /api/phu-huynh/hoc-phi/2/vietqr` không cần body. Response có dạng:

```json
{
  "nganHang": "MB Bank",
  "soTaiKhoan": "<MB_ACCOUNT_NO>",
  "tenChuTaiKhoan": "<MB_ACCOUNT_NAME>",
  "soTien": 2100000,
  "noiDungChuyenKhoan": "HP-2 PHAM GIA HAN",
  "anhQrDataUri": "data:image/png;base64,<qr-image>"
}
```

API trả `404` nếu không có phiếu, `403` nếu phiếu không thuộc trẻ đã liên kết, `409` nếu phiếu đã thu hoặc đã có giao dịch, `503` nếu chưa cấu hình tài khoản/credentials, và `502` khi VietQR lỗi hoặc trả QR không hợp lệ.

Đặt các biến môi trường cho tiến trình backend trước khi chạy:

```text
VIETQR_CLIENT_ID=<client-id-do-VietQR-cap>
VIETQR_API_KEY=<api-key-do-VietQR-cap>
MB_ACCOUNT_NO=<so-tai-khoan-MB-cua-truong>
MB_ACCOUNT_NAME=<ten-chu-tai-khoan-MB>
```

Backend đọc các giá trị này qua `application.properties`; không đưa chúng vào frontend, repository hoặc log. Cần đăng ký/lấy `Client ID` và `API Key` qua VietQR trước khi bật tính năng. API Generate chính thức hiện dùng `POST https://api.vietqr.io/v2/generate` với header `x-client-id` và `x-api-key`; ngân hàng MB dùng BIN `970422`.

VietQR đã thông báo API Generate dự kiến ngừng hỗ trợ từ ngày 01/01/2027 (duy trì đến hết 31/12/2026). Cần lên kế hoạch chuyển sang thư viện tạo QR nội bộ trước thời hạn này.

Schema hiện tại ràng buộc một dòng `THANHTOAN` cho mỗi `HOCPHI` (`UNIQUE(maHocPhi)`) và nghiệp vụ ghi nhận hiện chỉ nhận thanh toán toàn phần. Tính năng QR không thay đổi ràng buộc đó; nếu đã tồn tại giao dịch, backend không tạo QR khác cho phiếu thu. Thanh toán chuyển khoản vẫn cần nhân viên xác nhận theo quy trình hiện có.

Trước khi chạy API cấp tài khoản cho hồ sơ đã có, chạy migration [20261023_phuhuynh_taikhoan_nullable.sql](../database/migrations/20261023_phuhuynh_taikhoan_nullable.sql). Migration này cần thiết vì schema ban đầu khai báo `PHUHUYNH.maTaiKhoan NOT NULL`.

## Thiết lập Postman

1. Gọi `GET {{baseUrl}}/api/auth/csrf`, lưu `token` trong biến `csrfToken` và giữ cookie `XSRF-TOKEN`.
2. Gọi `POST {{baseUrl}}/api/auth/login` với tài khoản quản trị; giữ cookie session do Postman nhận được.
3. Với `POST`, `PUT`, `PATCH`, `DELETE`, thêm header `X-XSRF-TOKEN: {{csrfToken}}` và `Content-Type: application/json`.
4. Tạo environment có `baseUrl=http://localhost:8888` và `csrfToken`; dùng dữ liệu mã phụ huynh/trẻ có thật trong QLMamNon.

## 1. Tạo liên kết

`POST /api/phu-huynh-tre` — `ADMIN`; trả `201 Created`.

```json
{
  "maPhuHuynh": 12,
  "maTre": 34,
  "quanHe": "Mẹ"
}
```

Response:

```json
{
  "maPhuHuynh": 12,
  "hoTenDemPH": "Nguyễn Văn",
  "tenPH": "Bình",
  "maTre": 34,
  "hoTenDemTre": "Nguyễn Minh",
  "tenTre": "An",
  "quanHe": "Mẹ"
}
```

## 2. Lấy tất cả liên kết

`GET /api/phu-huynh-tre` — `ADMIN`.

```json
[
  {
    "maPhuHuynh": 12,
    "hoTenDemPH": "Nguyễn Văn",
    "tenPH": "Bình",
    "maTre": 34,
    "hoTenDemTre": "Nguyễn Minh",
    "tenTre": "An",
    "quanHe": "Mẹ"
  }
]
```

## 3. Lấy liên kết theo phụ huynh

`GET /api/phu-huynh-tre/{maPhuHuynh}` — `ADMIN` hoặc chính phụ huynh đó.

Ví dụ `GET /api/phu-huynh-tre/12`:

```json
[
  {
    "maPhuHuynh": 12,
    "hoTenDemPH": "Nguyễn Văn",
    "tenPH": "Bình",
    "maTre": 34,
    "hoTenDemTre": "Nguyễn Minh",
    "tenTre": "An",
    "quanHe": "Mẹ"
  }
]
```

## 4. Lấy phụ huynh theo trẻ

`GET /api/phu-huynh-tre/tre/{maTre}` — `ADMIN` hoặc phụ huynh đã liên kết với trẻ.

Ví dụ `GET /api/phu-huynh-tre/tre/34` trả cùng cấu trúc `PhuHuynhTreDTO` ở mục 3.

## 5. Cập nhật quan hệ

`PUT /api/phu-huynh-tre/{maPhuHuynh}/{maTre}` — `ADMIN`.

Ví dụ `PUT /api/phu-huynh-tre/12/34`:

```json
{ "quanHe": "Bố" }
```

Response: liên kết đầy đủ như mục 1, với `"quanHe": "Bố"`.

## 5.1. Đổi trẻ đang liên kết

`PUT /api/phu-huynh-tre/{maPhuHuynh}/{maTreCu}/doi-tre` — `ADMIN`; đổi liên kết trong một transaction, chỉ xóa liên kết cũ khi liên kết mới hợp lệ.

Ví dụ `PUT /api/phu-huynh-tre/12/34/doi-tre`:

```json
{
  "maTre": 35,
  "quanHe": "Mẹ"
}
```

Response là đối tượng liên kết với mã trẻ mới. Trả `404` nếu trẻ/hồ sơ/liên kết không tồn tại và `409` nếu trẻ mới đã được liên kết với phụ huynh này.

## 6. Hủy liên kết

`DELETE /api/phu-huynh-tre/{maPhuHuynh}/{maTre}` — `ADMIN`; trả `204 No Content`.

Ví dụ `DELETE /api/phu-huynh-tre/12/34`. Thao tác chỉ xóa dòng `PHUHUYNH_TRE`, không xóa tài khoản/hồ sơ phụ huynh hoặc hồ sơ trẻ.

## 7. Tạo tài khoản và hồ sơ phụ huynh

`POST /api/tai-khoan/phu-huynh` — `ADMIN`; trả `201 Created`.

Tên đăng nhập và mật khẩu được backend sinh tự động. Body không nhận username/password:

```json
{
  "hoTenDemPH": "Nguyễn Văn",
  "tenPH": "Bình",
  "diaChiLH": "Quận 1, TP. Hồ Chí Minh",
  "soDienThoai": "0912345678",
  "email": "binh@example.com",
  "capTaiKhoan": true,
  "maTre": 34,
  "quanHe": "Mẹ"
}
```

Response thành công chứa mật khẩu tạm thời đúng một lần; không gọi lại API đọc hồ sơ để lấy lại mật khẩu:

```json
{
  "maPhuHuynh": 12,
  "maTaiKhoan": 52,
  "tenDangNhap": "nguyenvanbinh12",
  "vaiTro": "PHUHUYNH",
  "trangThai": true,
  "coTaiKhoan": true,
  "matKhauTamThoi": "<chi-tra-mot-lan>"
}
```

Tên đăng nhập là tên không dấu ghép mã phụ huynh, có hậu tố số nếu trùng; mật khẩu tạm thời được sinh ngẫu nhiên và BCrypt trước khi lưu. Nhân viên cần bàn giao mật khẩu qua kênh an toàn. Nếu `capTaiKhoan` là `false`, hồ sơ được tạo nhưng không có thông tin mật khẩu trong response. Số điện thoại phải gồm đúng 10 chữ số.
Response cấp tài khoản gửi header `Cache-Control: no-store`; mật khẩu tạm thời không được lưu vào database dạng rõ, log hoặc trình duyệt để xem lại.

## 8. Cấp tài khoản cho hồ sơ phụ huynh có sẵn

`POST /api/tai-khoan/phu-huynh/{maPhuHuynh}/cap-tai-khoan` — `ADMIN`; trả `201 Created`.

Ví dụ `POST /api/tai-khoan/phu-huynh/12/cap-tai-khoan`:

Không cần body. Response giống mục 7 và chứa mật khẩu tạm thời một lần. Nếu phụ huynh đã có tài khoản thì trả `409 Conflict`, không tạo hồ sơ thứ hai.
Tên đăng nhập được chuẩn hóa từ họ tên không dấu, chữ thường, nối với mã phụ huynh; nếu tên đó đã tồn tại, backend thêm hậu tố tăng dần như `_1`, `_2`. Chỉ quản trị viên được gọi API. Khi tài khoản đã tồn tại, không cấp mới và không ghi đè mật khẩu hiện tại.

## 9. Xem tình trạng tài khoản phụ huynh

`GET /api/tai-khoan/phu-huynh/{maPhuHuynh}` — `ADMIN` hoặc chính phụ huynh đó.

Response:

```json
{
  "maPhuHuynh": 12,
  "maTaiKhoan": 52,
  "tenDangNhap": "phuhuynh12",
  "vaiTro": "PHUHUYNH",
  "trangThai": true,
  "coTaiKhoan": true
}
```

## 10. Khóa hoặc mở khóa tài khoản

`PATCH /api/tai-khoan/{maTaiKhoan}/trang-thai` — `ADMIN`.

Ví dụ khóa `PATCH /api/tai-khoan/52/trang-thai`:

```json
{ "trangThai": false }
```

Mở khóa gửi `{ "trangThai": true }`. Response:

```json
{ "message": "Đã cập nhật trạng thái tài khoản." }
```

Tài khoản bị khóa không thể đăng nhập và endpoint đăng nhập trả `401 Unauthorized`.

## 11. Kiểm tra username

`POST /api/tai-khoan/kiem-tra-ten-dang-nhap` — `ADMIN`.

```json
{ "tenDangNhap": "phuhuynh12" }
```

Response:

```json
{ "tenDangNhap": "phuhuynh12", "daTonTai": true }
```

## 12. Lấy trẻ chưa liên kết với phụ huynh

`GET /api/tre-em/chua-lien-ket/{maPhuHuynh}` — `ADMIN`.

Response là danh sách `TreEmDTO`, ví dụ:

```json
[
  {
    "maTre": 35,
    "hoTenDemTre": "Trần Thị",
    "tenTre": "Mai",
    "ngayThangNamSinh": "2021-04-15",
    "noiSinh": "TP. Hồ Chí Minh",
    "maLopHoc": 2,
    "tenLopHoc": "Mầm 2",
    "trangThaiHocTap": "Đang học"
  }
]
```

## 13. Lấy phụ huynh chưa có tài khoản

`GET /api/phu-huynh/chua-co-tai-khoan` — `ADMIN`.

Response là danh sách hồ sơ:

```json
[
  {
    "maPhuHuynh": 13,
    "hoTenDemPH": "Trần Văn",
    "tenPH": "Nam",
    "diaChiLH": "Quận 3",
    "soDienThoai": "0987654321",
    "email": null
  }
]
```

### Danh sách hồ sơ cho trang quản lý

`GET /api/phu-huynh` — `ADMIN` hoặc `GIAOVIEN`.

Trả về tất cả hồ sơ phụ huynh, trạng thái tài khoản và danh sách trẻ liên kết trong mỗi phần tử:

```json
[
  {
    "phuHuynh": {
      "maPhuHuynh": 12,
      "hoTenDemPH": "Nguyễn Văn",
      "tenPH": "Bình",
      "diaChiLH": "Quận 1",
      "soDienThoai": "0912345678",
      "email": "binh@example.com"
    },
    "taiKhoan": {
      "maPhuHuynh": 12,
      "maTaiKhoan": 52,
      "tenDangNhap": "phuhuynh12",
      "vaiTro": "PHUHUYNH",
      "trangThai": true,
      "coTaiKhoan": true
    },
    "treEm": []
  }
]
```

## 14. Xem hồ sơ, tài khoản và trẻ đã liên kết

`GET /api/phu-huynh/{maPhuHuynh}/thong-tin-lien-ket` — nhân viên `ADMIN`/`GIAOVIEN` hoặc chính phụ huynh đó.

```json
{
  "phuHuynh": {
    "maPhuHuynh": 12,
    "hoTenDemPH": "Nguyễn Văn",
    "tenPH": "Bình",
    "diaChiLH": "Quận 1",
    "soDienThoai": "0912345678",
    "email": "binh@example.com"
  },
  "taiKhoan": {
    "maPhuHuynh": 12,
    "maTaiKhoan": 52,
    "tenDangNhap": "phuhuynh12",
    "vaiTro": "PHUHUYNH",
    "trangThai": true,
    "coTaiKhoan": true
  },
  "treEm": [
    {
      "maPhuHuynh": 12,
      "hoTenDemPH": "Nguyễn Văn",
      "tenPH": "Bình",
      "maTre": 34,
      "hoTenDemTre": "Nguyễn Minh",
      "tenTre": "An",
      "quanHe": "Mẹ"
    }
  ]
}
```

API chi tiết trả hồ sơ, trạng thái/tên đăng nhập và các liên kết trẻ; không trả mật khẩu hoặc password hash.

## 15. Cấp lại mật khẩu từ trang quản lý tài khoản

`POST /api/tai-khoan/{maTaiKhoan}/cap-lai-mat-khau` — `ADMIN`; trả `201 Created` và header `Cache-Control: no-store`.

Không cần body. Endpoint sinh mật khẩu tạm mới cho đúng tài khoản được chọn, mã hóa BCrypt trước khi lưu và trả mật khẩu rõ đúng một lần:

```json
{
  "maTaiKhoan": 52,
  "tenDangNhap": "nguyenvanbinh12",
  "matKhauTamThoi": "<chi-tra-mot-lan>"
}
```

Nếu mã tài khoản không tồn tại, trả `404`. Mật khẩu cũ mất hiệu lực sau khi cấp lại. Trạng thái khóa/mở khóa và vai trò của tài khoản không thay đổi. Không gọi API xem tài khoản để lấy lại mật khẩu tạm thời.

## 16. Cập nhật hồ sơ phụ huynh

`PUT /api/phu-huynh/{maPhuHuynh}` — `ADMIN` hoặc `GIAOVIEN`.

```json
{
  "hoTenDemPH": "Nguyễn Văn",
  "tenPH": "Bình",
  "soDienThoai": "0912345678",
  "email": "binh@example.com",
  "diaChiLH": "Quận 1, TP. Hồ Chí Minh"
}
```

Response `200 OK` trả cấu trúc `ThongTinLienKetPhuHuynhDTO` như mục 14. Mã phụ huynh lấy từ URL; body không nhận mã tài khoản, username, trạng thái hay mật khẩu. Email có thể `null` hoặc chuỗi rỗng. Số điện thoại phải gồm 10 chữ số; số đã thuộc hồ sơ khác trả `409 Conflict`.

Các trạng thái lỗi: `400` nếu đầu vào không hợp lệ, `403` nếu không đủ quyền, `404` nếu không tồn tại hồ sơ, `409` nếu số điện thoại trùng.

## Mã lỗi thường gặp

- `400`: body không hợp lệ hoặc thiếu trường bắt buộc.
- `401`: chưa đăng nhập, sai thông tin đăng nhập hoặc tài khoản bị khóa.
- `403`: không đủ quyền truy cập hoặc thiếu CSRF token hợp lệ.
- `404`: không tìm thấy tài khoản, hồ sơ phụ huynh/trẻ hoặc liên kết.
- `409`: username/số điện thoại/liên kết bị trùng hoặc hồ sơ đã có tài khoản.
- `500`: lỗi không mong đợi; xem log backend.

## 16. Yêu cầu hỗ trợ đăng nhập

Form đăng nhập gửi `POST /api/auth/yeu-cau-ho-tro` công khai, có CSRF token. Endpoint trả cùng một thông báo chung cho cả trường hợp khớp và không khớp hồ sơ, và giới hạn tối đa 5 yêu cầu/giờ theo số điện thoại hoặc IP.

```json
{
  "hoTen": "Nguyễn Văn Bình",
  "soDienThoai": "0912345678",
  "email": "binh@example.com",
  "loaiYeuCau": "QUEN_MAT_KHAU",
  "noiDung": "Tôi không đăng nhập được."
}
```

Response `202 Accepted`:

```json
{
  "message": "Nếu thông tin phù hợp với hồ sơ nhà trường, yêu cầu sẽ được nhân viên tiếp nhận và hỗ trợ."
}
```

Không tích hợp email/SMS/OTP trong hệ thống hiện tại. Vì vậy hệ thống không hiển thị username, không phát mã xác minh và không cấp mật khẩu công khai. Nhân viên xác minh trực tiếp theo quy trình của trường.

## 17. Quản lý yêu cầu hỗ trợ (ADMIN/GIAOVIEN)

- `GET /api/yeu-cau-ho-tro`: danh sách; số điện thoại được che, ví dụ `******5678`.
- `GET /api/yeu-cau-ho-tro/{maYeuCau}`: chi tiết sau đăng nhập nhân viên.
- `PATCH /api/yeu-cau-ho-tro/{maYeuCau}`: cập nhật trạng thái, ghi chú; body:

```json
{
  "trangThai": "DA_XAC_MINH",
  "ghiChuXuLy": "Đã đối chiếu hồ sơ trực tiếp tại trường."
}
```

- `POST /api/yeu-cau-ho-tro/{maYeuCau}/cap-lai-mat-khau`: chỉ `ADMIN`; chỉ chạy khi yêu cầu `DA_XAC_MINH` và thuộc loại quên mật khẩu/không đăng nhập được. Response trả `matKhauTamThoi` một lần để bàn giao qua kênh đã xác minh.

Không ghi mật khẩu, OTP, token vào ghi chú. Yêu cầu quên tên đăng nhập được nhân viên xử lý trực tiếp; API không tiết lộ tên đăng nhập trên trang công khai.

## 18. Đổi mật khẩu

`POST /api/auth/change-password` — tài khoản đã đăng nhập; dùng CSRF token.

```json
{
  "matKhauHienTai": "<mat-khau-tam-thoi>",
  "matKhauMoi": "<mat-khau-moi-manh>"
}
```

Mật khẩu mới tối thiểu 12 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt, không vượt 72 byte UTF-8. Khi thành công, mật khẩu được mã hóa BCrypt trước khi lưu.

## 19. Danh sách tài khoản quản trị

`GET /api/tai-khoan` — chỉ `ADMIN`. API lấy tài khoản từ `TAIKHOAN`, ghép hồ sơ phụ huynh/giáo viên theo `maTaiKhoan`; không ghép theo username hoặc email. Response không chứa mật khẩu/hash. Schema hiện tại không lưu lần đăng nhập gần nhất nên trường này là `null`.

Response mẫu:

```json
[
  {
    "maTaiKhoan": 1,
    "tenDangNhap": "admin",
    "hoTenChuTaiKhoan": "Chưa liên kết hồ sơ",
    "email": null,
    "vaiTro": "ADMIN",
    "lanDangNhapGanNhat": null,
    "trangThai": true
  }
]
```

Khóa/mở khóa vẫn dùng `POST /api/accounts/{maTaiKhoan}/lock` hoặc `POST /api/accounts/{maTaiKhoan}/unlock`; chỉ `ADMIN` được phép. Cấp tài khoản phụ huynh thực hiện tại `POST /api/tai-khoan/phu-huynh` hoặc `POST /api/tai-khoan/phu-huynh/{maPhuHuynh}/cap-tai-khoan`.

## 20. Ảnh đại diện trẻ

- `GET /api/tre-em/{maTre}/anh-dai-dien` — trả ảnh của trẻ; phụ huynh chỉ xem được ảnh trẻ đã liên kết với tài khoản của mình.
- `POST /api/tre-em/{maTre}/anh-dai-dien` — `ADMIN` hoặc `GIAOVIEN`; gửi `multipart/form-data` với trường file tên `file` và CSRF header `X-XSRF-TOKEN`. Chỉ nhận JPEG, PNG, WebP tối đa 5 MB.

Response upload: `{"anhDaiDien":"/api/tre-em/34/anh-dai-dien"}`. Các response hồ sơ trẻ có trường `anhDaiDien` là URL dùng trực tiếp trên giao diện. Nếu chưa tải ảnh hoặc file không còn tồn tại, API trả ảnh mặc định dành cho trẻ. File lưu ở `uploads/tre-em`; database chỉ lưu đường dẫn tương đối trong cột `TREEM.anhDaiDien`.

## Migration

Chạy theo thứ tự trên database hiện hữu, không xóa dữ liệu:

1. `database/migrations/20261023_phuhuynh_taikhoan_nullable.sql` — cho phép tạo hồ sơ chưa cấp tài khoản.
2. `database/migrations/20261023_parent_account_support.sql` — tạo bảng yêu cầu hỗ trợ tài khoản; không thêm cột vào `TAIKHOAN`.
