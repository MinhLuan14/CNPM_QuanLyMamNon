# 🦈 BabySharkEdu — Hệ thống Quản lý Mầm Non

**BabySharkEdu** là ứng dụng phần mềm hỗ trợ quản lý và vận hành các hoạt động tại trường mầm non. Hệ thống hướng đến việc số hóa quy trình quản lý trẻ em, giáo viên, phụ huynh và lớp học, giúp tập trung dữ liệu, giảm thao tác thủ công và nâng cao hiệu quả quản lý.

Dự án được phát triển trong khuôn khổ **môn Công nghệ phần mềm (CNPM)**, áp dụng mô hình kiến trúc Frontend – Backend – Database và các công cụ hỗ trợ phát triển phần mềm theo nhóm.

---

## 📑 Mục lục

- [1. Giới thiệu](#-1-giới-thiệu)
- [2. Thành viên nhóm](#-2-thành-viên-nhóm)
- [3. Mục tiêu dự án](#-3-mục-tiêu-dự-án)
- [4. Chức năng hệ thống](#-4-chức-năng-hệ-thống)
- [5. Công nghệ sử dụng](#-5-công-nghệ-sử-dụng)
- [6. Kiến trúc hệ thống](#-6-kiến-trúc-hệ-thống)
- [7. Tài khoản kiểm thử](#-7-tài-khoản-kiểm-thử)
- [8. Yêu cầu môi trường](#-8-yêu-cầu-môi-trường)
- [9. Hướng dẫn cài đặt](#-9-hướng-dẫn-cài-đặt)
- [10. Công cụ phát triển](#-10-công-cụ-phát-triển)
- [11. Định hướng phát triển](#-11-định-hướng-phát-triển)

---

## 📌 1. Giới thiệu

Trong hoạt động quản lý trường mầm non, việc lưu trữ thông tin trẻ em, quản lý lớp học, phân công giáo viên và theo dõi các hoạt động hằng ngày đòi hỏi dữ liệu phải được tổ chức khoa học, chính xác và dễ dàng tra cứu.

**BabySharkEdu** được xây dựng nhằm hỗ trợ các nghiệp vụ quản lý này trên một nền tảng thống nhất, với giao diện thân thiện và khả năng phân quyền theo vai trò người dùng.

Hệ thống hướng đến ba nhóm người dùng chính:

- **Quản trị viên (ADMIN):** Quản lý và kiểm soát các chức năng của hệ thống.
- **Giáo viên (GIAOVIEN):** Theo dõi thông tin lớp học, trẻ em và các hoạt động được phân công.
- **Phụ huynh (PHUHUYNH):** Tra cứu thông tin của trẻ và các thông tin liên quan theo quyền được cấp.

## 👥 2. Thành viên nhóm

| STT | MSSV | Họ và tên |
|:---:|---|---|
| 1 | 231A010696 | Nguyễn Minh Luân |
| 2 | 231A290039 | Vũ Ngọc Minh Hoàng |
| 3 | 231A290096 | Trần Trung Nguyễn |

## 🎯 3. Mục tiêu dự án

- Xây dựng hệ thống quản lý thông tin trẻ em tập trung.
- Hỗ trợ quản lý hồ sơ giáo viên, phụ huynh và lớp học.
- Hỗ trợ theo dõi quá trình học tập, sinh hoạt và chăm sóc trẻ.
- Hạn chế việc lưu trữ và xử lý dữ liệu bằng giấy tờ hoặc bảng tính thủ công.
- Tổ chức hệ thống theo kiến trúc Frontend – Backend – Database.
- Áp dụng Git và GitHub để quản lý mã nguồn, kiểm soát phiên bản và phối hợp làm việc nhóm.
- Sử dụng Docker để hỗ trợ đóng gói và triển khai ứng dụng trong môi trường thống nhất.

## 🧩 4. Chức năng hệ thống

### 4.1. Quản lý trẻ em
- Thêm, cập nhật, xóa và tra cứu thông tin trẻ.
- Quản lý hồ sơ cá nhân của trẻ.
- Theo dõi lớp học và thông tin liên quan đến trẻ.
- Liên kết thông tin trẻ với phụ huynh hoặc người giám hộ.

### 4.2. Quản lý giáo viên
- Quản lý hồ sơ và thông tin giáo viên.
- Theo dõi danh sách giáo viên.
- Phân công giáo viên phụ trách lớp học.

### 4.3. Quản lý lớp học
- Tạo mới và cập nhật thông tin lớp.
- Quản lý danh sách trẻ theo từng lớp.
- Quản lý giáo viên phụ trách.
- Theo dõi sĩ số lớp học.

### 4.4. Quản lý hoạt động
- Theo dõi các hoạt động học tập và sinh hoạt của trẻ.
- Hỗ trợ quản lý thông tin điểm danh.
- Theo dõi tình hình ăn, ngủ và chăm sóc trẻ.
- Lưu trữ các thông tin cần thiết trong quá trình vận hành lớp học.

### 4.5. Quản lý tài khoản và phân quyền
- Đăng nhập hệ thống.
- Quản lý tài khoản người dùng.
- Phân quyền theo vai trò: ADMIN, GIAOVIEN và PHUHUYNH.
- Kiểm soát quyền truy cập vào các chức năng tương ứng.

> **Lưu ý:** Danh sách trên mô tả phạm vi chức năng của dự án. Mức độ hoàn thiện của từng chức năng phụ thuộc vào tiến độ triển khai thực tế.

## 🛠️ 5. Công nghệ sử dụng

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Frontend | ReactJS | Xây dựng giao diện người dùng |
| Giao diện | HTML5, CSS3, JavaScript | Xây dựng cấu trúc, trình bày và xử lý tương tác |
| Frontend Tooling | Vite | Khởi chạy môi trường phát triển và đóng gói ứng dụng |
| Backend | Java | Ngôn ngữ lập trình phía máy chủ |
| Backend Framework | Spring Boot | Xây dựng ứng dụng và xử lý nghiệp vụ |
| API | Spring Web / REST API | Giao tiếp giữa Frontend và Backend |
| Build Tool | Maven | Quản lý thư viện và quy trình biên dịch |
| Database | Microsoft SQL Server | Lưu trữ dữ liệu nghiệp vụ |
| Version Control | Git | Quản lý phiên bản mã nguồn |
| Repository | GitHub | Lưu trữ mã nguồn và cộng tác nhóm |
| Containerization | Docker | Đóng gói và hỗ trợ triển khai ứng dụng |
| API Testing | Postman | Kiểm thử các REST API |

## 🏗️ 6. Kiến trúc hệ thống

BabySharkEdu được tổ chức theo mô hình ba thành phần chính:

```text
┌────────────────────────────────────┐
│              FRONTEND              │
│          ReactJS + Vite             │
│                                    │
│       Giao diện người dùng          │
└─────────────────┬──────────────────┘
                  │
                  │ HTTP / REST API
                  ▼
┌────────────────────────────────────┐
│               BACKEND              │
│          Java + Spring Boot         │
│                                    │
│   Controller → Service → Repository │
│                                    │
│   Xử lý nghiệp vụ và phân quyền     │
└─────────────────┬──────────────────┘
                  │
                  │ Truy vấn dữ liệu
                  ▼
┌────────────────────────────────────┐
│              DATABASE              │
│          Microsoft SQL Server       │
│                                    │
│   Tài khoản, trẻ em, giáo viên,     │
│   phụ huynh, lớp học và dữ liệu     │
│   nghiệp vụ liên quan               │
└────────────────────────────────────┘
```

**Luồng xử lý cơ bản:**

1. Người dùng thao tác trên giao diện ReactJS.
2. Frontend gửi yêu cầu đến Backend thông qua REST API.
3. Backend tiếp nhận yêu cầu, kiểm tra dữ liệu, quyền truy cập và xử lý nghiệp vụ.
4. Backend truy vấn hoặc cập nhật dữ liệu trong SQL Server.
5. Kết quả được trả về Frontend để hiển thị cho người dùng.

## 🔐 7. Tài khoản kiểm thử

Các tài khoản dưới đây được sử dụng để kiểm tra chức năng đăng nhập và phân quyền theo vai trò.

| STT | Vai trò | Tên đăng nhập | Mật khẩu | Trạng thái |
|:---:|---|---|---|---|
| 1 | Quản trị viên (ADMIN) | `admin` | `12345` | Hoạt động |
| 2 | Phụ huynh (PHUHUYNH) | `ph_demo_2026` | `Parent123!` | Hoạt động |
| 3 | Giáo viên (GIAOVIEN) | `gv_quynhnga` | `Teacher123!` | Hoạt động |

**Lưu ý bảo mật:**
- Đây là thông tin tài khoản phục vụ kiểm thử trong môi trường phát triển.
- Không sử dụng các mật khẩu mẫu này cho môi trường thực tế.
- Không lưu mật khẩu dạng văn bản thuần trong cơ sở dữ liệu khi triển khai chính thức.
- Không đưa thông tin đăng nhập hoặc dữ liệu nhạy cảm lên repository công khai nếu chưa được phép.

## 💻 8. Yêu cầu môi trường

Để chạy dự án trên máy tính cá nhân, cần chuẩn bị các công cụ sau:

| Công cụ | Mục đích |
|---|---|
| Git | Tải mã nguồn và quản lý phiên bản |
| JDK | Biên dịch và chạy Backend Java |
| Maven hoặc Maven Wrapper | Quản lý dependencies và chạy ứng dụng Spring Boot |
| Node.js và npm | Cài đặt thư viện và chạy Frontend ReactJS |
| Microsoft SQL Server | Lưu trữ dữ liệu hệ thống |
| SQL Server Management Studio (SSMS) | Quản lý và truy vấn cơ sở dữ liệu |
| Postman | Kiểm thử API |
| Docker Desktop | Chạy các thành phần trong container nếu dự án đã cấu hình Docker |

**Lưu ý:** Phiên bản JDK, Node.js và SQL Server cần tương thích với cấu hình thực tế của dự án. Kiểm tra `pom.xml`, `package.json` và các file cấu hình trước khi cài đặt.

## 🚀 9. Hướng dẫn cài đặt

### Bước 1. Tải mã nguồn

```bash
git clone https://github.com/MinhLuan14/CNPM_QuanLyMamNon.git
cd CNPM_QuanLyMamNon
```

Nếu repository đã được đổi tên, hãy sử dụng URL GitHub hiện tại của dự án.

### Bước 2. Cấu hình cơ sở dữ liệu

1. Khởi động Microsoft SQL Server.
2. Mở SQL Server Management Studio.
3. Tạo hoặc khôi phục cơ sở dữ liệu theo cấu hình của dự án.
4. Cập nhật thông tin kết nối trong file `application.properties` hoặc `application.yml` của Backend.

Ví dụ cấu hình kết nối:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=QLMamNon;encrypt=true;trustServerCertificate=true
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

> Thay đổi tên máy chủ, cổng kết nối, tên database và thông tin xác thực theo môi trường thực tế. Các biến môi trường cần được khai báo trước khi chạy ứng dụng.

### Bước 3. Khởi chạy Backend

Mở Terminal tại thư mục `backend`:

```bash
cd backend
```

Trên Windows, nếu dự án có Maven Wrapper:

```powershell
.\mvnw.cmd spring-boot:run
```

Hoặc sử dụng Maven đã cài đặt:

```bash
mvn spring-boot:run
```

Sau khi Backend khởi động thành công, kiểm tra log để xác nhận ứng dụng đã kết nối được với cơ sở dữ liệu.

### Bước 4. Khởi chạy Frontend

Mở một Terminal mới tại thư mục `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập giao diện trên Terminal. Mở địa chỉ đó bằng trình duyệt để sử dụng ứng dụng.

> **Lưu ý:** Các lệnh trên giả định repository có hai thư mục `backend` và `frontend` ở thư mục gốc. Nếu cấu trúc thực tế khác, hãy điều chỉnh đường dẫn tương ứng.

## 🧰 10. Công cụ phát triển

- **Visual Studio Code / IntelliJ IDEA:** Viết mã nguồn và gỡ lỗi.
- **Git / GitHub:** Quản lý phiên bản, nhánh phát triển và cộng tác nhóm.
- **Postman:** Kiểm thử yêu cầu và phản hồi của REST API.
- **SQL Server Management Studio:** Thiết kế, truy vấn và quản lý cơ sở dữ liệu.
- **Docker Desktop:** Hỗ trợ xây dựng và vận hành môi trường container khi có cấu hình tương ứng.

## 🔮 11. Định hướng phát triển

Trong các giai đoạn tiếp theo, BabySharkEdu có thể được mở rộng theo những hướng sau:

- Hoàn thiện quản lý hồ sơ trẻ em, giáo viên, phụ huynh và lớp học.
- Nâng cao cơ chế xác thực, phân quyền và bảo vệ dữ liệu.
- Hoàn thiện các nghiệp vụ theo dõi điểm danh, ăn, ngủ và sinh hoạt.
- Bổ sung chức năng thông báo và trao đổi thông tin giữa nhà trường với phụ huynh.
- Cải thiện giao diện theo hướng thân thiện, trực quan và tương thích với nhiều thiết bị.
- Bổ sung kiểm thử tự động và chuẩn hóa quy trình triển khai bằng Docker.

---

**BabySharkEdu — Hỗ trợ quản lý mầm non tập trung, trực quan và hiệu quả.**

*Đồ án môn Công nghệ phần mềm (CNPM).*
## 👥 2. Thành viên nhóm và phân công công việc

Dự án BabySharkEdu được thực hiện bởi 3 thành viên. Công việc được phân chia theo các module nghiệp vụ nhằm đảm bảo tính độc lập trong phát triển, thuận tiện khi tích hợp và thống nhất trong quá trình xây dựng hệ thống.

### 2.1. Nguyễn Minh Luân — Phân tích và quản trị hệ thống

**Module phụ trách:** Tài khoản, phân quyền, quản lý trẻ em và tích hợp hệ thống.

**Nhiệm vụ:**
- Phân tích yêu cầu và thiết kế cấu trúc tổng thể của hệ thống.
- Xây dựng cấu trúc Backend, thống nhất quy ước REST API và cơ chế phân quyền.
- Phát triển chức năng đăng nhập, quản lý tài khoản và kiểm soát quyền truy cập.
- Phát triển chức năng quản lý hồ sơ trẻ em.
- Xử lý mối liên kết giữa trẻ em, phụ huynh và lớp học.
- Tích hợp các module, kiểm thử chức năng và phối hợp xử lý lỗi toàn hệ thống.

### 2.2. Vũ Ngọc Minh Hoàng — Quản lý giáo viên, lớp học và hoạt động

**Module phụ trách:** Quản lý giáo viên, lớp học và hoạt động chăm sóc trẻ.

**Nhiệm vụ:**
- Phát triển chức năng quản lý hồ sơ giáo viên.
- Xây dựng chức năng tạo mới, cập nhật và quản lý thông tin lớp học.
- Phát triển chức năng phân công giáo viên phụ trách lớp.
- Quản lý danh sách trẻ và theo dõi sĩ số theo từng lớp.
- Phối hợp triển khai các chức năng theo dõi hoạt động, điểm danh, ăn và ngủ của trẻ theo phạm vi dự án.
- Kiểm thử các nghiệp vụ liên quan đến giáo viên và lớp học.

### 2.3. Trần Trung Nguyễn — Quản lý phụ huynh và giao diện người dùng

**Module phụ trách:** Quản lý phụ huynh, giao diện và các chức năng dành cho phụ huynh.

**Nhiệm vụ:**
- Phát triển chức năng quản lý hồ sơ phụ huynh và người giám hộ.
- Xây dựng giao diện tra cứu thông tin trẻ dành cho phụ huynh.
- Hiển thị thông tin lớp học, hoạt động và tình hình chăm sóc trẻ theo quyền được cấp.
- Phối hợp xây dựng, hoàn thiện giao diện người dùng và đảm bảo tính nhất quán giữa các màn hình.
- Kết nối giao diện với Backend thông qua REST API.
- Kiểm thử các luồng sử dụng dành cho phụ huynh và phối hợp sửa lỗi giao diện.

### 2.4. Nguyên tắc phối hợp thực hiện

- Các thành viên chịu trách nhiệm chính đối với module được phân công và phối hợp khi có nghiệp vụ liên quan.
- Thống nhất cấu trúc dữ liệu, quy ước API và quy tắc phân quyền trước khi tích hợp.
- Sử dụng Git và GitHub để quản lý mã nguồn, theo dõi thay đổi và phối hợp phát triển.
- Kiểm thử từng module trước khi tích hợp vào hệ thống chung.
- Cả nhóm cùng tham gia kiểm thử tổng thể, hoàn thiện tài liệu và chuẩn bị báo cáo đồ án.
# 🦈 babySharkEdu – Hệ thống quản lý mầm non

## 📋 Danh sách công việc (To-do List)

### 1. Quản lý phụ huynh và trẻ em
- [x] Quản lý hồ sơ phụ huynh
- [x] Thêm, sửa, xóa và xem thông tin phụ huynh
- [x] Quản lý thông tin trẻ em
- [x] Thêm, sửa, xóa và xem thông tin trẻ em
- [x] Liên kết phụ huynh với trẻ em
- [x] Hiển thị danh sách trẻ em theo phụ huynh

### 2. Quản lý lớp học
- [x] Xây dựng chức năng thêm lớp học
- [x] Xây dựng chức năng sửa thông tin lớp học
- [x] Xây dựng chức năng xóa lớp học
- [x] Hiển thị danh sách lớp học
- [x] Quản lý phòng học và độ tuổi
- [x] Thiết lập sĩ số tối đa của lớp
- [x] Hiển thị danh sách trẻ em trong từng lớp
- [x] Phân lớp cho trẻ em
- [x] Kiểm tra sĩ số trước khi thêm trẻ vào lớp

### 3. Quản lý giáo viên và phân công
- [x] Xây dựng chức năng thêm giáo viên
- [x] Xây dựng chức năng sửa thông tin giáo viên
- [x] Xây dựng chức năng xóa giáo viên
- [x] Hiển thị danh sách giáo viên
- [x] Quản lý tài khoản giáo viên
- [x] Phân công giáo viên chủ nhiệm
- [x] Phân công giáo viên phụ trách lớp
- [ ] Quản lý thời gian phân công
- [ ] Kiểm tra trùng lịch và phân công

### 4. Quản lý thực đơn và món ăn
- [x] Xây dựng chức năng thêm món ăn
- [x] Xây dựng chức năng sửa thông tin món ăn
- [x] Xây dựng chức năng xóa món ăn
- [x] Quản lý thành phần và loại món ăn
- [x] Quản lý trạng thái món ăn
- [x] Tạo thực đơn theo tuần
- [x] Quản lý thực đơn theo ngày
- [x] Phân chia các bữa ăn trong ngày
- [x] Gán món ăn vào từng bữa
- [x] Xem thực đơn theo tuần và ngày
- [ ] Kiểm tra ngày áp dụng của thực đơn

### 5. Quản lý học phí và thanh toán
- [x] Lập phiếu học phí theo tháng cho trẻ
- [x] Quản lý các khoản phí
- [x] Quản lý chi tiết học phí
- [x] Tính tổng tiền học phí
- [x] Thiết lập hạn thanh toán
- [ ] Theo dõi trạng thái học phí
- [ ] Theo dõi học phí chưa thanh toán
- [ ] Ghi nhận thanh toán
- [ ] Quản lý phương thức thanh toán
- [ ] Lưu mã giao dịch và thời gian thanh toán
- [ ] Xem lịch sử thanh toán
- [ ] Thống kê doanh thu và công nợ

### 6. Hoàn thiện hệ thống
- [x] Xây dựng chức năng đăng nhập
- [x] Xây dựng chức năng đăng xuất
- [x] Mã hóa mật khẩu an toàn
- [x] Phân quyền quản trị viên
- [x] Phân quyền giáo viên
- [x] Phân quyền phụ huynh
- [x] Kiểm tra và xác thực dữ liệu đầu vào
- [x] Xử lý lỗi phía backend
- [x] Hoàn thiện giao diện người dùng
- [ ] Tối ưu giao diện trên máy tính và điện thoại
- [ ] Kiểm thử các chức năng
- [ ] Kiểm thử quan hệ và tính toàn vẹn dữ liệu
- [ ] Kiểm thử bảo mật và phân quyền
- [ ] Hoàn thiện tài liệu hướng dẫn sử dụng
- [ ] Hoàn thiện README và hướng dẫn cài đặt
- [ ] Kiểm tra cấu hình và triển khai hệ thống

---

## 📊 Tiến độ dự án

- **Hoàn thành:** Quản lý phụ huynh và trẻ em
- **Tiếp theo:** Quản lý lớp học
- **Đang phát triển:** Các chức năng quản lý giáo viên, thực đơn, học phí và hoàn thiện hệ thống

> Lưu ý: Đánh dấu `[x]` khi chức năng đã được triển khai và kiểm thử thành công. Các mục chưa hoàn thành giữ nguyên `[ ]`.

## Hồ sơ cá nhân và hỗ trợ tài khoản

Profile dùng chung cho phụ huynh và giáo viên. Các API dưới đây dùng phiên đăng nhập hiện tại (cookie session); request ghi dữ liệu cần gửi CSRF token trong header `X-XSRF-TOKEN`.

### Hồ sơ cá nhân

- `GET /api/profile`: lấy hồ sơ theo tài khoản đang đăng nhập; không nhận mã hồ sơ từ client.
- `PUT /api/profile`: cập nhật số điện thoại, email và địa chỉ liên hệ được phép sửa.
- `POST /api/auth/change-password`: đổi mật khẩu cho chính tài khoản đang đăng nhập.

Ví dụ cập nhật hồ sơ:

```http
PUT /api/profile
Content-Type: application/json
X-XSRF-TOKEN: <csrf-token>
```

```json
{
  "soDienThoai": "0912345678",
  "email": "an@example.com",
  "diaChiLH": "Quận Bình Thạnh, TP. Hồ Chí Minh"
}
```

Ví dụ đổi mật khẩu:

```http
POST /api/auth/change-password
Content-Type: application/json
X-XSRF-TOKEN: <csrf-token>
```

```json
{
  "matKhauHienTai": "mat-khau-hien-tai",
  "matKhauMoi": "mat-khau-moi-an-toan",
  "xacNhanMatKhauMoi": "mat-khau-moi-an-toan"
}
```

Kết quả thành công: `{"message":"Đổi mật khẩu thành công."}`. Mật khẩu mới tối thiểu 8 ký tự; tài khoản bị khóa không thể đổi mật khẩu.

### Hỗ trợ tài khoản

- `POST /api/auth/yeu-cau-ho-tro`: gửi yêu cầu hỗ trợ, không cần đăng nhập. `loaiTaiKhoan` nhận `PHUHUYNH` hoặc `GIAOVIEN`.
- `GET /api/yeu-cau-ho-tro`: nhân viên có quyền xem các yêu cầu.
- `PATCH /api/yeu-cau-ho-tro/{maYeuCau}`: nhân viên cập nhật/trạng thái xác minh yêu cầu.
- `POST /api/yeu-cau-ho-tro/{maYeuCau}/cap-lai-mat-khau`: chỉ ADMIN được cấp mật khẩu tạm cho yêu cầu đã xác minh; mật khẩu chỉ trả về một lần và response có `Cache-Control: no-store`.

Ví dụ gửi yêu cầu:

```json
{
  "hoTen": "Nguyễn Văn An",
  "soDienThoai": "0912345678",
  "email": "an@example.com",
  "loaiYeuCau": "QUEN_MAT_KHAU",
  "noiDung": "Cần hỗ trợ truy cập tài khoản",
  "loaiTaiKhoan": "PHUHUYNH"
}
```

Hiện dự án chưa cấu hình nhà cung cấp SMS/OTP. Gửi yêu cầu không có nghĩa là OTP đã được gửi hoặc danh tính đã được xác minh; nhân viên phải xác minh theo quy trình nội bộ trước khi ADMIN cấp lại mật khẩu. Không triển khai đặt lại mật khẩu tự động chỉ dựa trên số điện thoại.

### Tự khôi phục tài khoản qua email

- `POST /api/auth/forgot-username`: gửi tên đăng nhập đến email hồ sơ đã đăng ký.
- `POST /api/auth/forgot-password`: gửi mật khẩu tạm thời đến email hồ sơ đã đăng ký.
- Đăng nhập bằng mật khẩu tạm thời sẽ yêu cầu đổi mật khẩu ngay. Cho đến khi đổi thành công, người dùng chỉ được kiểm tra phiên, đổi mật khẩu hoặc đăng xuất.
- Endpoint đặt lại mật khẩu qua token cũ đã ngừng hoạt động; các bảng khôi phục hiện hữu vẫn được giữ nguyên.

Các endpoint trả cùng thông báo trung lập cho email có hoặc không có tài khoản để hạn chế dò tài khoản; phản hồi không xác nhận rằng email đã gửi thành công. Khi SMTP lỗi, mật khẩu trong database không bị thay đổi. Mật khẩu tạm thời chỉ được giữ trong bộ nhớ trong lúc gửi và được lưu bằng BCrypt sau khi gửi thành công; không ghi mật khẩu vào log. Yêu cầu bị giới hạn tối đa 5 lần/giờ theo email và 10 lần/giờ theo IP.

Trước khi sử dụng, cấu hình các biến môi trường backend:

| Biến | Mô tả |
|---|---|
| `DB_USERNAME` / `DB_PASSWORD` | Tài khoản kết nối SQL Server; mật khẩu không được lưu trong source |
| `VIETQR_CLIENT_ID` / `VIETQR_API_KEY` | Thông tin xác thực VietQR chỉ dùng ở backend |
| `MB_ACCOUNT_NO` / `MB_ACCOUNT_NAME` | Tài khoản nhận tiền dùng để tạo QR VietQR |
| `MAIL_HOST` | Máy chủ SMTP |
| `MAIL_PORT` | Cổng SMTP, mặc định `587` |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Tài khoản SMTP và mật khẩu ứng dụng |
| `MAIL_FROM` | Địa chỉ người gửi được SMTP cho phép |
| `ACCOUNT_RECOVERY_HASH_SECRET` | Bí mật ngẫu nhiên riêng, tối thiểu 32 ký tự, dùng HMAC để lưu mã định danh rate limit |

Không đưa mật khẩu SMTP hoặc HMAC secret vào Git. Với nhà cung cấp yêu cầu xác thực hai bước, dùng app password và đặt cùng bí mật trong secret store của môi trường triển khai; biến môi trường phải được cấp cho đúng tiến trình backend trước khi khởi động lại. Nếu thiếu cấu hình, backend vẫn khởi động nhưng endpoint khôi phục trả lỗi dịch vụ chưa sẵn sàng; log chẩn đoán chỉ ghi trạng thái cấu hình có/thiếu, không ghi giá trị.

Nếu `/api/auth/forgot-password` trả HTTP 503 với thông báo “Không thể tiếp nhận yêu cầu lúc này”, backend đã từ chối trước bước tra cứu tài khoản hoặc gửi email vì SQL Server không cấp được application lock cho rate limit. Log backend ghi `resultCode`/`resultMeaning` khi SQL Server trả mã âm (ví dụ timeout), hoặc `sqlState`/`vendorCode` khi câu lệnh lỗi; các giá trị email, IP, hash khóa, token và thông tin xác thực không được ghi. Mã khóa được cấp là `0` hoặc `1`.

`sp_getapplock` với `LockOwner='Transaction'` yêu cầu transaction vật lý đang mở trên SQL Server. Hibernate/JPA có thể đã mở transaction ở Spring nhưng chưa bắt đầu transaction SQL khi lệnh khóa là thao tác JDBC đầu tiên; khi đó `@@TRANCOUNT=0` và SQL Server trả `-999`. Rate limiter dùng khóa theo `Session` thay thế, giữ khóa đến callback hoàn tất transaction (commit hoặc rollback), rồi gọi `sp_releaseapplock` trên cùng connection. Như vậy request đồng thời vẫn được tuần tự hóa qua phần kiểm tra và ghi lượt yêu cầu; timeout vẫn bị từ chối thay vì bỏ qua rate limit.

Tạo các bảng bổ sung bằng cách kiểm tra và áp dụng `database/migrations/20261025_account_recovery.sql` trên đúng database SQL Server. Migration chỉ tạo bảng token và bảng giới hạn yêu cầu còn thiếu; không sửa các bảng nghiệp vụ hiện tại và không tự chạy khi ứng dụng khởi động.

Trước khi bật mật khẩu tạm thời, áp dụng `database/migrations/20261025_taikhoan_must_change_password.sql` để thêm cột `mustChangePassword` có mặc định `0`. Migration này bảo toàn dữ liệu hiện tại; các tài khoản/mật khẩu tạm thời mới được đánh dấu bắt buộc đổi.

### Database

Để hỗ trợ yêu cầu tài khoản giáo viên, áp dụng `database/migrations/20261023_support_teacher_account.sql` sau `database/migrations/20261023_parent_account_support.sql` trên đúng database `QLMamNon`. Migration phụ huynh tạo bảng yêu cầu hỗ trợ; migration giáo viên thêm quan hệ hồ sơ giáo viên và loại tài khoản vào bảng đó.

Profile giáo viên cần hai cột `ngaySinh` và `trinhDoChuyenMon`; script schema gốc chưa khai báo chúng. Nếu database chưa có, áp dụng `database/migrations/20261023_giaovien_profile_fields.sql`. Luồng tạo hồ sơ phụ huynh hiện hỗ trợ hồ sơ chưa có tài khoản; nếu `dbo.PHUHUYNH.maTaiKhoan` đang `NOT NULL`, cần sao lưu và áp dụng `database/migrations/20261023_phuhuynh_taikhoan_nullable.sql`. Migration giữ khóa ngoại tài khoản và duy nhất có lọc cho các giá trị khác `NULL`; nó không xóa dữ liệu hồ sơ.

Kiểm tra schema và sao lưu database trước khi chạy migration; các migration không tự chạy khi ứng dụng khởi động và chưa được chạy trên SQL Server trong lần triển khai này.
