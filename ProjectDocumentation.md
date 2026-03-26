# 🧸 Toy Rental Management System - Comprehensive Documentation

## 1.  Giới thiệu Dự án (Project Introduction)
Dự án **Toy Rental Management System** là một nền tảng web ứng dụng mô hình kinh doanh cho thuê đồ chơi trẻ em. Hệ thống kết nối giữa cửa hàng (Admin/Employee) và Khách hàng (Renter), giúp khách hàng dễ dàng tìm kiếm, đặt thuê đồ chơi trực tuyến, thanh toán (COD hoặc VNPay) và giúp cửa hàng quản lý kho, duyệt đơn hàng, kiểm tra tình trạng đồ chơi lúc giao/nhận (Inspection).

### Các Role (Quyền) trong hệ thống:
- **Khách hàng (Renter)**: Tìm kiếm đồ chơi, đặt thuê, theo dõi lịch sử đơn hàng cá nhân của mình.
- **Nhân viên (Employee)**: Được cấp quyền truy cập vào Admin Dashboard. Có thể quản lý và duyệt đơn đặt thuê, thực hiện quy trình bàn giao đồ (Pickup) và thu hồi đồ khi khách trả (Return), ghi chú tình trạng đồ vật và phụ phí (nếu có).
- **Quản trị viên (Admin)**: Có toàn quyền của Nhân viên. Có quyền Quản lý danh sách Đồ chơi (Thêm/Sửa/Xóa/Upload ảnh S3), xem tổng quan biểu đồ doanh thu (Stats) và Quản lý/Phân quyền người dùng.

---

## 2. 🛠 Công nghệ Sử dụng (Technology Stack)

### Backend (Node.js & Express)
- **Framework/Runtime:** Node.js, Express.js (Xây dựng RESTful API).
- **Database:** MongoDB (Sử dụng thư viện Mongoose ODM để định nghĩa Schema, quan hệ và truy vấn).
- **Authentication & Security:** JSON Web Token (JWT) cho tính năng Access Token & Refresh Token an toàn, sử dụng thư viện `bcryptjs` (mã hóa mật khẩu 1 chiều).
- **Lưu trữ ảnh (Cloud Storage):** AWS S3 (Sử dụng `@aws-sdk/client-s3` và `multer` để tiếp nhận và đưa ảnh lên cloud).
- **Payment Gateway:** VNPay Sandbox (Tích hợp thanh toán trực tuyến tiền cọc và phí thuê).
- **Email Service:** Nodemailer kết hợp với Google App Passwords (Gửi mã OTP quên mật khẩu).

### Frontend (React.js)
- **Framework:** React.js 18 (Sử dụng Vite để khởi tạo dự án và Hot Module Replacement cực nhanh).
- **Routing:** React Router DOM (Hỗ trợ định tuyến và bảo mật các trang Protected Routes của Admin).
- **Styling:** React-Bootstrap kết hợp với Vanilla CSS. CSS được viết theo dạng class có tiền tố (e.g., `.mt-` cho Manage Toys) để ngăn chặn rò rỉ (CSS Leakage).
- **Icons:** Lucide React (Bộ icon hiện đại, thay thế cho FontAwesome).
- **State Management:** Custom React Context và Hooks (`useAuth`, `useBooking`) thay cho Redux để giữ code nhẹ và dễ hiểu.
- **HTTP/API Client:** Axios (Tích hợp cấu hình đặc biệt sử dụng Interceptors để gắn Access Token và Cơ chế tự động gọi API Refresh Token khi bị lỗi 401).
- **Toast Notifications:** React-Toastify.

---

## 3.  Cấu trúc Kiến trúc (Architecture Structure)

Mô hình hệ thống tuân theo chuẩn **Client-Server Architecture**, chia tách hoàn toàn hai ứng dụng, giao tiếp qua định dạng JSON thông qua các Endpoint RESTful.

### Backend (`/be`)
- **`server.js`**: File Entry point của hệ thống. Khởi tạo Express app, cấu hình Middleware chung (CORS, body-parser, morgan), gán global Router và cơ chế Error Handling tập trung.
- **`config/db.js`**: File khởi tạo kết nối Mongoose tới MongoDB thông qua URI nằm trong `.env`.
- **`routes/api.js`**: Khai báo danh sách chi tiết các URL endpoint của ứng dụng (Auth, Users, Toys, Bookings, Inspections...).
- **`controllers/`**: Chứa logic nghiệp vụ (Business Logic) trực tiếp sau khi Route tiếp nhận. (e.g., `authController.fetchUser`, `bookingController.confirmOrder`).
- **`models/`**: Khai báo kiến trúc CSDL NoSQL thông qua Mongoose Schemas (`Booking`, `Inspection`, `Invoice`, `Rating`, `Toy`, `ToyDetail`, `Transaction`, `User`). Đảm nhiệm luôn việc móc nối logic (Populate) khi cần join bảng.
- **`middleware/`**: Các bộ lọc Request trước khi đưa vào Controller:
  - `authMiddleware.js`: Bắt và giải mã Bearer Token từ Headers. Phân quyền truy cập dựa trên Role.
  - `errorMiddleware.js`: Gom lỗi cuối cùng của app để ném ra Response thống nhất định dạng.
  - `uploadMiddleware.js`: Cấu hình Multer lưu ảnh vào RAM tạm để bắn sang S3.
- **`DB/`**: Thư mục lưu trữ tĩnh bản sao (Export) dạng JSON của toàn bộ Database tại thời điểm gần đây nhất để phục vụ cho Test/Seeding.

### Frontend (`/fe`)
- **`src/pages/`**: Các View (Màn hình) của dự án (`ManageToys.jsx`, `ManageBookings.jsx`, `Login.jsx`...).
- **`src/components/`**: Các mảnh Component nhỏ có thể tái sử dụng (`Header`, `Footer`, `AdminSidebar`, `HeroBanner`).
- **`src/services/`**: Lớp Interface trung gian gói các Endpoints API bằng hàm JS (ví dụ `bookingService.confirmBooking`) để gọi từ UI mà không cần quan tâm URI cụ thể là gì.
- **`src/hooks/`**: Các Custom Hook bọc Logic gọi API bằng Context để các trang trong web chia sẻ trạng thái tập trung (`useAuth` bọc thông tin User, `useBooking` bọc danh sách Đơn hàng).
- **`src/utils/`**: Các hàm Helper (Format Date, Money). Quan trọng nhất là `axiosInstance.js` nơi cấu hình Request/Response Interceptor.

---

## 4. Cụm Logic & Luồng Xử Lý Chính (Core Business Flows)

### A. Luồng Đăng nhập & An ninh Vòng đời phiên (Auth Cycle)
1. **Đăng nhập**: Phía Client gửi form `{ email, password }`. Backend đối chiếu hash trong DB. Thành công cấp 2 token: **Access Token** (Sống 15 phút, nằm ẩn trên bộ nhớ Client) và **Refresh Token** (Sống 7 ngày, được lưu thẳng vào Collection Users của DB làm bảo chứng).
2. **Gắn Token**: Các API cần đăng nhập (như duyệt đơn đặt hàng), nhánh Axios sẽ tự móc Access Token từ Local Storage ghép vào HTTP Headers: `Authorization: Bearer <token>`.
3. **Tự động làm mới (Interceptor)**: Nếu User thao tác lâu, Access Token hết thời gian, Server sẽ từ chối API với lỗi `401 Unauthorized`. Phía Frontend (Axios Response Interceptor) sẽ *tạm ngưng* request lỗi đó, lấy Refresh Token ở Local gọi ngầm API cấp Token mới. Cấp thành công -> Gỡ lệnh gọi bị lỗi ra gửi lại kèm Token mới. UI không bị giật hay bắt User login lại.
4. **Đăng xuất an toàn**: Không chỉ xoá ở Frontend mà còn gọi `/api/auth/logout`. Backend tìm User và set `token = null` trong cơ sở dữ liệu. Ngăn ngừa triệt để việc kẻ gian đánh cắp chuỗi Refresh Token để sinh Token mới vô hạn.

### B. Luồng Đặt Thuê Đồ Chơi (Booking & Checkout Flow)
1. Khách xem Menu tại Frontend, chọn món và Click thuê. Khách chọn ngày Bắt đầu (Start) và Ngày trả hàng (End). 
2. Hệ thống tính số giờ tự động: Tiền thuê = `(Số ngày * 24h) * pricePerHour`. Yêu cầu khách chốt phương thức: Tiền mặt (COD) hoặc VNPay.
3. Nếu khách chọn **VNPay**, Server sẽ mix một URL Payment hash MD5 và gửi về trình duyệt để chuyển tới trang thanh toán nháp của VNPay. Khi khách trả tiền thành công chuyển hướng trả về Frontend.
4. Server lưu thông tin tạo một tài liệu `Booking` với trạng thái `PENDING_APPROVED` và một `Transaction` (Lịch sử thanh toán). 

### C. Luồng Duyệt Đơn & Theo Dõi Tình Trạng (Staff / Inspection Flow)
1. **Duyệt Đơn (Approve)**: Admin/Employee đăng nhập vào Quản lý đơn, bấm Duyệt. Trạng thái Booking thành `APPROVED` (Cho biết hàng đã sẵn sàng giao).
2. **Bàn giao cho khách (Pickup Inspection)**: Khách đến lấy hoặc shiper mang đi. Employee thao tác **Ghi nhận Giao Hàng**. Form xuất hiện bắt buộc staff xác nhận Tình trạng vật lý ban đầu (Mới/Xước/...), nhắc nhở việc thu tiền COD tiền cọc (Deposit) đã đủ chưa, và **Upload ảnh chụp thực tế**. Trạng thái Booking đổi sang `ACTIVE` (Khách đang cầm đồ chơi). Đồ chơi thực tế cũng đổi sang trạng thái `RENTED`.
3. **Thu hồi đồ (Return Inspection)**: Khách trả hàng. Employee thao tác **Ghi nhận Thu hồi**. Quy trình tương tự: Xác nhận hình thể mới nhất, Surcharge (nếu mất chi tiết hỏng hóc nhập số tiền phạt vào đây), và chụp ảnh chứng cứ lưu lên Server. 
4. **Kết thúc (Complete)**: Sau khi thu phí bù trừ hoàn cọc. Hệ thống thả đồ chơi trở lại kho `AVAILABLE` và Booking chuyển sang `COMPLETE`.

---

## 5. Các Danh Mục API Bắt Buộc (API Endpoints & JSON Reference)

### Cụm 1: Account & Authentication
- **`POST /api/auth/login`**: Đăng nhập.
  - *Request JSON*:
    ```json
    { "email": "employee@example.com", "password": "password123" }
    ```
  - *Response JSON (200 OK)*:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": { "_id": "67...", "email": "...", "role": "EMPLOYEE", "name": "..." },
      "accessToken": "eyJhb...", "refreshToken": "eyJhb..."
    }
    ```

- **`POST /api/auth/refresh-token`**: Xin cấp lại token.
  - *Request JSON*: `{ "refreshToken": "eyJ..." }`

- **`POST /api/auth/logout`**: Đăng xuất xóa phiên DB (Cần gửi kèm Bearer Access Token trong Header).

### Cụm 2: Toy Management (Bắt buộc Lọc phía Backend)
- **`GET /api/toys?search=Lego&category=LEGO&page=1`**: Lấy danh sách đồ chơi theo Filters. Tránh gọi tất cả làm chết máy Client. Trang quản trị luôn hiển thị đúng thông tin của 1 trang từ API này.
  - *Response JSON*:
    ```json
    {
      "success": true,
      "data": [{ "_id": "...", "title": "Lego Police", "pricePerHour": 50000, "status": "AVAILABLE" }],
      "pagination": { "current": 1, "pages": 5, "total": 45 }
    }
    ```

- **`POST /api/toys`** (Role: ADMIN): Đưa Sản phẩm lên.
  - *Request*:
    ```json
    {
      "title": "Xe đua F1 Điều khiển",
      "category": "CAR",
      "pricePerHour": 25000,
      "depositValue": 500000,
      "thumbnail": "https://s3.amazonaws.com/image.jpg",
      "description": "Xe có pin đầy đủ...",
      "images": ["url1", "url2"]
    }
    ```

### Cụm 3: Booking Management
- **`POST /api/bookings`** (Role: USER): Người đăng ký Thuê.
  - *Request JSON*:
    ```json
    {
      "toyId": "65ab...",
      "startDate": "2026-04-01T10:00:00Z",
      "endDate": "2026-04-02T10:00:00Z",
      "paymentMethod": "cod",
      "message": "Gọi điện trước khi giao"
    }
    ```
- **`PATCH /api/bookings/:id/confirm`** (Role: ADMIN/EMPLOYEE): Gật đầu cho phép khách thuê. Cập nhật booking status. Mọi việc khác tự động xử lý.

### Cụm 4: Inspections & Inventory Tracking
- **`POST /api/bookings/:bookingId/inspections`** (Role: ADMIN/EMPLOYEE): Thực thi Kiểm tra hiện trạng khi có thay đổi sở hữu tạm thời. (Pickup hoặc Return).
  - *Request JSON*:
    ```json
    {
      "type": "return", 
      "condition": "Broken",
      "surcharge": 50000,
      "notes": "Mất bánh xe trái",
      "imageUrl": ["https://s3.v.v.v./mat_banh.jpg"]
    }
    ```

---

## 6.  Hướng dẫn Setup Nhanh (Step-by-Step Local Run Guide)

Cung cấp hướng dẫn toàn tập để Clone dự án về một máy tính trống, seeding dữ liệu mẫu y hệt DB đang chạy, setup Back-end và khởi động Front-End.

### Yêu cầu Tiên quyết (Prerequisites):
- Đã cài **Node.js** (Lts v18 / v20).
- Đã cài **MongoDB Community Server** (đang run ở localhost cổng 27017, không set biến root pwd) kèm tools MongoDB Compass UI.

### Bước 1: Setup Dữ liệu Mẫu (Database Seeding)
Nếu Database bị dọn sạch (hoặc máy mới). Có thể đẩy dữ liệu từ các file `DB/*.json` do Backend xuất ra để khôi phục nhanh:
1. Mở phần mềm Database UI: **MongoDB Compass**.
2. Click **Connect** tới URI mặc định: `mongodb://127.0.0.1:27017`.
3. Bấm vào nút `+` kế bên chữ Databases. Điền tên DB Name là `toy_rental_db`. (Bắt buộc). Collection name đầu tiên tạo tạm là `users`.
4. Sau khi lọt vào `toy_rental_db` bên khung trái. Lần lượt bấm dấu `+` tạo đủ mâm trống rỗng: `users`, `toys`, `bookings`, `transactions`, `inspections`, `toydetails`.
5. Xổ vào folder `ProjectFinal/be/DB` của project. Tại góc màn hình Compass, của mỗi collection chọn tab `ADD DATA` -> `Import JSON`. Móc file có tên tương tự bỏ vào. Xong nhấn "Import". 
*(Các tài khoản gốc như Admin đã có mã băm mật khẩu đầy đủ chạy được luôn)*.
6. Data mẫu cho tài khoản admin Tk : [EMAIL_ADDRESS] Mk: admin

### Bước 2: Setup và Khởi động Backend (`/be`)
1. Dùng terminal, `cd be/`
2. Run lệnh cài cắm: `npm install`
3. Cấu hình biến môi trường `.env`: 
   - Đổi file `.env.sample` thành tên `.env`. (Hoặc nhân bản lên)
   - Lưu ý trong file có các key về `MONGO_URI` luôn phải map đúng port máy (e.g. `127.0.0.1:27017/toy_rental_db`).
   - Phân đoạn `AWS_S3` và Email nếu cấu hình thật S3/App Passwords thì đồ chơi up ảnh hoặc quên mật khẩu mới hoạt động. Có thể giữ nguyên giá trị nếu không test up ảnh hoặc forget PW.
4. Lên sóng máy chủ API: `npm start`
5. Dấu hiệu sống sót: Tại Terminal máy in ra `Connected to MongoDB!` và `Restaurant API Server running on port 9999`.

### Bước 3: Setup Frontend React (`/fe`)
1. Tại tab terminal khác, `cd fe/`
2. Request cài thư viện npm: `npm install`
3. Cấu trúc biến môi trường Vite `.env`:
   - Duplicate file `.env.sample` thành `.env.`
   - Đảm bảo có dòng trỏ URI tới Backend (Cổng mặc định là 9999).
     `VITE_API_BASE_URL=http://localhost:9999/api`
4. Lên sóng UI web app: `npm run dev`
5. Mở trình duyệt Web nhập địa chỉ: `http://localhost:5173` (hoặc con số hiển thị trên terminal). Màn hình User Client sẽ bật sáng.
6. Thử test các tính năng hệ thống. Dành cho đường vào Admin thì góc phải User menu chọn "Management Mode". Đồ chơi thay đổi trạng thái và logic sẽ đồng bộ với dữ liệu đã gắp.
