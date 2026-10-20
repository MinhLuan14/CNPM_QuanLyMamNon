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
