# 🦈 BabySharkEdu — Hệ thống Quản lý Mầm Non

**BabySharkEdu** là ứng dụng phần mềm hỗ trợ quản lý và vận hành các hoạt động tại trường mầm non. Hệ thống hướng đến việc số hóa quy trình quản lý trẻ em, giáo viên, phụ huynh, lớp học, thực đơn và học phí, giúp tập trung dữ liệu, giảm thao tác thủ công và nâng cao hiệu quả quản lý.

Dự án được phát triển trong khuôn khổ **môn Công nghệ phần mềm (CNPM)**, áp dụng kiến trúc Frontend – Backend – Database, quản lý mã nguồn bằng Git/GitHub và đóng gói ứng dụng bằng Docker.

---

## 📑 Mục lục

1. Giới thiệu
2. Thành viên nhóm và phân công công việc
3. Mục tiêu dự án
4. Chức năng hệ thống
5. Công nghệ sử dụng
6. Kiến trúc hệ thống
7. Tài khoản kiểm thử
8. Yêu cầu môi trường
9. Hướng dẫn cài đặt và chạy ứng dụng
10. Triển khai Docker trên máy local
11. Cơ sở dữ liệu và sao lưu
12. Công cụ phát triển
13. Định hướng phát triển

---

## 📌 1. Giới thiệu

BabySharkEdu được xây dựng nhằm hỗ trợ các nghiệp vụ quản lý trường mầm non trên một nền tảng thống nhất, với giao diện thân thiện và khả năng phân quyền theo vai trò người dùng.

Hệ thống hướng đến ba nhóm người dùng chính:

- **Quản trị viên (ADMIN):** Quản lý và kiểm soát các chức năng của hệ thống.
- **Giáo viên (GIAOVIEN):** Theo dõi thông tin lớp học, trẻ em và các hoạt động được phân công.
- **Phụ huynh (PHUHUYNH):** Tra cứu thông tin của trẻ và các thông tin liên quan theo quyền được cấp.

## 👥 2. Thành viên nhóm và phân công công việc

Dự án được thực hiện bởi 3 thành viên:

| STT | MSSV | Họ và tên | Phân công |
|:---:|---|---|---|
| 1 | 231A010696 | Nguyễn Minh Luân | Phân tích hệ thống, tài khoản, phân quyền, quản lý trẻ em và tích hợp |
| 2 | 231A290039 | Vũ Ngọc Minh Hoàng | Quản lý giáo viên, lớp học và hoạt động |
| 3 | 231A290096 | Trần Trung Nguyễn | Quản lý phụ huynh và giao diện người dùng |

### 2.1. Nguyễn Minh Luân — Phân tích và quản trị hệ thống

- Phân tích yêu cầu và thiết kế cấu trúc tổng thể.
- Xây dựng cấu trúc Backend và quy ước REST API.
- Phát triển đăng nhập, quản lý tài khoản và phân quyền.
- Phát triển chức năng quản lý hồ sơ trẻ em.
- Xử lý liên kết giữa trẻ em, phụ huynh và lớp học.
- Tích hợp module, kiểm thử và xử lý lỗi toàn hệ thống.

### 2.2. Vũ Ngọc Minh Hoàng — Quản lý giáo viên, lớp học và hoạt động

- Phát triển quản lý hồ sơ giáo viên.
- Xây dựng chức năng quản lý lớp học.
- Phát triển phân công giáo viên phụ trách lớp.
- Quản lý danh sách trẻ và sĩ số lớp.
- Phối hợp triển khai hoạt động, điểm danh, ăn và ngủ.
- Kiểm thử nghiệp vụ giáo viên và lớp học.

### 2.3. Trần Trung Nguyễn — Quản lý phụ huynh và giao diện người dùng

- Phát triển quản lý hồ sơ phụ huynh.
- Xây dựng giao diện dành cho phụ huynh.
- Hiển thị thông tin trẻ và hoạt động theo quyền được cấp.
- Hoàn thiện giao diện người dùng.
- Kết nối Frontend với Backend thông qua REST API.
- Kiểm thử các luồng sử dụng dành cho phụ huynh.

### 2.4. Nguyên tắc phối hợp

- Thống nhất cấu trúc dữ liệu và quy ước API.
- Phân chia module và phối hợp khi tích hợp.
- Sử dụng Git/GitHub để quản lý mã nguồn.
- Kiểm thử từng module trước khi tích hợp.
- Cùng kiểm thử tổng thể và hoàn thiện tài liệu dự án.

## 🎯 3. Mục tiêu dự án

- Xây dựng hệ thống quản lý thông tin trẻ em tập trung.
- Hỗ trợ quản lý hồ sơ giáo viên, phụ huynh và lớp học.
- Theo dõi quá trình học tập, sinh hoạt và chăm sóc trẻ.
- Hỗ trợ quản lý thực đơn, học phí và thanh toán.
- Phân quyền truy cập theo vai trò người dùng.
- Áp dụng Git/GitHub trong quản lý mã nguồn.
- Sử dụng Docker để đóng gói và vận hành ứng dụng trong môi trường thống nhất.

## 🧩 4. Chức năng hệ thống

### 4.1. Quản lý trẻ em

- Thêm, cập nhật, xóa và tra cứu thông tin trẻ.
- Quản lý hồ sơ cá nhân và ảnh đại diện.
- Theo dõi lớp học và trạng thái học tập.
- Liên kết trẻ với phụ huynh hoặc người giám hộ.

### 4.2. Quản lý giáo viên

- Quản lý hồ sơ và thông tin giáo viên.
- Quản lý tài khoản giáo viên.
- Phân công giáo viên phụ trách lớp.

### 4.3. Quản lý lớp học

- Thêm, sửa và xóa lớp học.
- Quản lý phòng học, độ tuổi và sĩ số tối đa.
- Quản lý danh sách trẻ theo lớp.
- Theo dõi sĩ số và phân công giáo viên.

### 4.4. Quản lý hoạt động

- Theo dõi hoạt động học tập và sinh hoạt.
- Hỗ trợ quản lý điểm danh.
- Theo dõi tình hình ăn, ngủ và chăm sóc trẻ.

### 4.5. Quản lý thực đơn và món ăn

- Quản lý thông tin món ăn.
- Quản lý loại món, thành phần và trạng thái món ăn.
- Tạo thực đơn theo tuần.
- Quản lý thực đơn theo ngày và từng bữa ăn.

### 4.6. Quản lý học phí và thanh toán

- Lập phiếu học phí theo tháng cho trẻ.
- Quản lý các khoản phí và chi tiết học phí.
- Tính tổng tiền và thiết lập hạn thanh toán.
- Hỗ trợ theo dõi tình trạng học phí và thanh toán theo phạm vi triển khai.

### 4.7. Quản lý tài khoản và phân quyền

- Đăng nhập và đăng xuất.
- Quản lý tài khoản người dùng.
- Phân quyền ADMIN, GIAOVIEN và PHUHUYNH.
- Đổi mật khẩu và hỗ trợ tài khoản.
- Kiểm soát quyền truy cập vào các chức năng tương ứng.

## 🛠️ 5. Công nghệ sử dụng

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Frontend | ReactJS 19 | Xây dựng giao diện |
| Frontend Tooling | Vite 8 | Phát triển và đóng gói ứng dụng |
| Ngôn ngữ Frontend | HTML5, CSS3, JavaScript | Giao diện và tương tác |
| Backend | Java 21 | Xử lý phía máy chủ |
| Backend Framework | Spring Boot | Xây dựng ứng dụng và nghiệp vụ |
| API | Spring Web / REST API | Giao tiếp Frontend – Backend |
| Build Tool | Maven | Quản lý thư viện và biên dịch |
| Database | Microsoft SQL Server | Lưu trữ dữ liệu |
| Version Control | Git | Quản lý phiên bản |
| Repository | GitHub | Lưu trữ mã nguồn |
| Containerization | Docker / Docker Compose | Đóng gói và vận hành ứng dụng |
| Web Server | Nginx | Phục vụ Frontend và chuyển tiếp API |
| API Testing | Postman | Kiểm thử REST API |

## 🏗️ 6. Kiến trúc hệ thống

BabySharkEdu được tổ chức theo mô hình ba thành phần:

```text
┌────────────────────────────────────┐
│             FRONTEND               │
│          ReactJS + Vite            │
│                                    │
│       Giao diện người dùng         │
│             Nginx                  │
└─────────────────┬──────────────────┘
                  │
                  │ HTTP / REST API
                  ▼
┌────────────────────────────────────┐
│              BACKEND               │
│         Java + Spring Boot         │
│                                    │
│    Controller → Service → Repository
│                                    │
│       Xử lý nghiệp vụ và phân quyền│
└─────────────────┬──────────────────┘
                  │
                  │ JDBC
                  ▼
┌────────────────────────────────────┐
│              DATABASE              │
│         Microsoft SQL Server       │
│                                    │
│   Tài khoản, trẻ em, giáo viên,     │
│   phụ huynh, lớp học và nghiệp vụ   │
└────────────────────────────────────┘
```

### Luồng xử lý

1. Người dùng thao tác trên giao diện ReactJS.
2. Frontend gửi yêu cầu đến Backend thông qua REST API.
3. Nginx tiếp nhận các yêu cầu `/api` và chuyển tiếp đến Backend.
4. Backend kiểm tra dữ liệu, quyền truy cập và xử lý nghiệp vụ.
5. Backend truy vấn hoặc cập nhật dữ liệu trong SQL Server.
6. Kết quả được trả về Frontend để hiển thị.

## 🔐 7. Tài khoản kiểm thử

Các tài khoản dưới đây phục vụ kiểm thử đăng nhập và phân quyền trong môi trường demo.

| STT | Vai trò | Tên đăng nhập | Mật khẩu |
|:---:|---|---|---|
| 1 | ADMIN | `admin` | `12345` |
| 2 | PHUHUYNH | `nguyenminhluan0388046213` | `Luan12345` |
| 3 | GIAOVIEN | `nguyenngoclangv4321` | `Lan12345` |

**Lưu ý:** Chỉ sử dụng tài khoản mẫu trong môi trường kiểm thử. Không sử dụng mật khẩu mẫu cho môi trường thực tế. Không đưa thông tin đăng nhập hoặc dữ liệu nhạy cảm lên repository công khai.

## 💻 8. Yêu cầu môi trường

Để chạy dự án, cần chuẩn bị:

| Công cụ | Mục đích |
|---|---|
| Git | Tải mã nguồn |
| JDK 21 | Chạy Backend |
| Maven | Biên dịch Backend |
| Node.js 22 và npm | Cài đặt và build Frontend |
| Microsoft SQL Server | Lưu trữ dữ liệu |
| SQL Server Management Studio | Quản lý database |
| Docker Desktop | Chạy các container |
| Docker Compose | Quản lý nhiều dịch vụ Docker |

## 🚀 9. Hướng dẫn cài đặt và chạy ứng dụng

### Bước 1. Tải mã nguồn

```bash
git clone https://github.com/MinhLuan14/CNPM_QuanLyMamNon.git
cd CNPM_QuanLyMamNon
```

### Bước 2. Cấu hình cơ sở dữ liệu

1. Khởi động SQL Server.
2. Mở SQL Server Management Studio.
3. Khôi phục database `QLMamNon` từ file backup `.bak` hoặc import file `.bacpac` vào SQL Server.
4. Cấu hình thông tin kết nối Backend theo môi trường sử dụng.

Ví dụ:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=QLMamNon;encrypt=true;trustServerCertificate=true
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

Không lưu thông tin xác thực thật trực tiếp trong mã nguồn.

### Bước 3. Chạy Backend

Mở Terminal tại thư mục `backend`:

```powershell
cd backend
mvn spring-boot:run
```

### Bước 4. Chạy Frontend

Mở Terminal khác tại thư mục `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Các bước trên dành cho môi trường phát triển riêng biệt. Nếu sử dụng Docker, thực hiện theo mục 10.

## 🐳 10. Triển khai Docker trên máy local

BabySharkEdu đã được đóng gói và chạy thử nghiệm bằng Docker Desktop trên máy tính cá nhân.

### 10.1. Mô hình triển khai

```text
             WINDOWS HOST
                  │
            Docker Desktop
                  │
          Docker Compose Network
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
┌───────────────┐   ┌────────────────┐
│   FRONTEND    │   │    BACKEND     │
│ React + Nginx │──▶│ Spring Boot    │
│ Container     │   │ Container      │
│ Port 8080:80  │   │ Port 8888      │
└───────────────┘   └───────┬────────┘
                            │
                            │ JDBC
                            ▼
                  ┌──────────────────┐
                  │  SQL SERVER      │
                  │  Windows Host    │
                  │  Port 1433       │
                  └──────────────────┘
```

### 10.2. Cách khởi động

Mở PowerShell tại thư mục gốc dự án:

```powershell
docker compose up -d
```

Kiểm tra trạng thái container:

```powershell
docker compose ps
```

Truy cập ứng dụng tại:

**http://localhost:8080**

### 10.3. Một số lệnh Docker thường dùng

Khởi động lại ứng dụng:

```powershell
docker compose restart
```

Xem log Backend:

```powershell
docker compose logs -f backend
```

Xem log Frontend:

```powershell
docker compose logs -f frontend
```

Dừng các container:

```powershell
docker compose down
```

Lưu ý: `docker compose down` dừng và gỡ container/network của dự án, không đồng nghĩa với việc xóa database SQL Server trên Windows. Thư mục upload được lưu thông qua volume để duy trì dữ liệu bên ngoài container.

### 10.4. Trạng thái triển khai

- Frontend chạy trong Docker container và được phục vụ bởi Nginx.
- Backend chạy trong Docker container bằng Spring Boot.
- Frontend giao tiếp với Backend thông qua đường dẫn `/api`.
- SQL Server hiện chạy trên máy Windows host, Backend kết nối thông qua `host.docker.internal`.
- Đã kiểm tra truy cập giao diện, kết nối cơ sở dữ liệu, đăng nhập và phân quyền.

**Phạm vi hiện tại:** Triển khai Docker local để chạy thử nghiệm và trình diễn. Hệ thống chưa được triển khai thành website public trên VPS hoặc tên miền Internet.

## 🗄️ 11. Cơ sở dữ liệu và sao lưu

Database sử dụng: **QLMamNon** – Microsoft SQL Server.

Các loại file lưu trữ:

| Định dạng | Công dụng |
|---|---|
| `.bak` | Sao lưu và phục hồi database SQL Server |
| `.bacpac` | Đóng gói cấu trúc và dữ liệu để chuyển database |
| `.sql` | Lưu script cấu trúc bảng, khóa và ràng buộc |

Các file sao lưu chứa dữ liệu demo được lưu riêng, không đưa lên repository GitHub công khai.

Tài liệu và dữ liệu bàn giao dự án:

**[Mở thư mục tài liệu BabySharkEdu trên Google Drive](https://drive.google.com/file/d/1NKWw_0R_fHseNMj7kVR0utbXNM_WJyoF/view?usp=drive_link)**

## 🧰 12. Công cụ phát triển

- **Visual Studio Code / IntelliJ IDEA:** Viết mã nguồn và gỡ lỗi.
- **Git / GitHub:** Quản lý phiên bản và cộng tác nhóm.
- **Postman:** Kiểm thử REST API.
- **SQL Server Management Studio:** Quản lý cơ sở dữ liệu.
- **Docker Desktop:** Xây dựng và vận hành container.
- **Docker Compose:** Quản lý các dịch vụ của ứng dụng.

## 🔮 13. Định hướng phát triển

- Hoàn thiện quản lý hồ sơ trẻ em, giáo viên, phụ huynh và lớp học.
- Nâng cao cơ chế xác thực, phân quyền và bảo vệ dữ liệu.
- Hoàn thiện nghiệp vụ điểm danh, ăn, ngủ và sinh hoạt.
- Hoàn thiện quản lý học phí, thanh toán và thống kê.
- Bổ sung thông báo giữa nhà trường và phụ huynh.
- Tối ưu giao diện trên máy tính và điện thoại.
- Bổ sung kiểm thử tự động.
- Triển khai hệ thống trên VPS Linux với tên miền và HTTPS.

---

**BabySharkEdu — Hỗ trợ quản lý mầm non tập trung, trực quan và hiệu quả.**

*Đồ án môn Công nghệ phần mềm (CNPM).*