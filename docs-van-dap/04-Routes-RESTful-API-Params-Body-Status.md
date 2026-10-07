# CHUYÊN ĐỀ 04: ROUTING, RESTFUL API, HTTP STATUS CODES & REQUEST DATA

---

### 1. RESTful API là gì?
* **REST (Representational State Transfer)**: Là một kiểu kiến trúc phần mềm phổ biến cho các ứng dụng phân tán, sử dụng các giao thức chuẩn của web (HTTP) để trao đổi dữ liệu.
* **RESTful API**: Là dịch vụ web tuân thủ các nguyên tắc thiết kế của REST:
  * Không lưu trạng thái trên server (Stateless).
  * Sử dụng các định dạng chuẩn (thường là JSON) để trao đổi thông tin.
  * Định danh tài nguyên rõ ràng qua URL (ví dụ: `/categories`, `/products`, `/bills`).
  * Sử dụng các phương thức HTTP chuẩn (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) để biểu diễn hành động CRUD.

---

### 2. Các phương thức HTTP (HTTP Methods) tương ứng với hành động CRUD:

| Phương thức HTTP | Ý nghĩa thao tác | Hành động CRUD | Ví dụ trong dự án |
| :--- | :--- | :--- | :--- |
| **GET** | Đọc / Truy vấn dữ liệu | **Read** | `GET /api/categories` (Xem danh sách) |
| **POST** | Tạo mới tài nguyên | **Create** | `POST /api/products` (Thêm sản phẩm mới) |
| **PUT** | Cập nhật toàn bộ bản ghi | **Update** | `PUT /api/categories/:id` (Sửa thông tin) |
| **PATCH** | Cập nhật một phần trường dữ liệu | **Update** | `PATCH /api/users/:id/role` (Đổi quyền) |
| **DELETE** | Xóa tài nguyên | **Delete** | `DELETE /api/products/:id` (Xóa sản phẩm) |

---

### 3. Phân biệt `req.params`, `req.body`, `req.query`, `req.cookies`:
Đây là câu hỏi xuất hiện trong **90% các buổi vấn đáp chấm bài** của giảng viên FPT Polytechnic!

#### 🔹 `req.params` (Route Parameters):
* **Bản chất**: Lấy các giá trị biến được định nghĩa trực tiếp trên cấu trúc URL thông qua dấu hai chấm `:`.
* **Ví dụ khai báo Route**: `router.get('/:id', CategoryController.getById);`
* **Khi client gọi**: `GET /api/categories/65f123456789abcdef123456`
* **Trong Controller đọc ra**: `const id = req.params.id;` (Giá trị là `'65f123456789abcdef123456'`).

#### 🔹 `req.body` (Request Body):
* **Bản chất**: Lấy dữ liệu được đóng gói trong phần thân (Body) của gói tin HTTP. Thường được sử dụng khi gửi dữ liệu lớn, phức tạp hoặc nhạy cảm trong các phương thức `POST`, `PUT`, `PATCH`.
* **Cần có middleware**: Phải có `app.use(express.json())` ở `app.js` để parse dữ liệu.
* **Ví dụ client gửi JSON**: `{ "name": "RG Hi-Nu Gundam", "price": 1150000 }`
* **Trong Controller đọc ra**: `const { name, price } = req.body;`

#### 🔹 `req.query` (Query Parameters / Search Params):
* **Bản chất**: Lấy các tham số nằm sau dấu chấm hỏi `?` trên đường dẫn URL, nối với nhau bằng dấu `&`. Thường dùng để lọc dữ liệu, tìm kiếm hoặc phân trang.
* **Khi client gọi**: `GET /api/products/detail-by-id?id=65f12345&tab=specs`
* **Trong Controller đọc ra**: `const id = req.query.id;` và `const tab = req.query.tab;`

#### 🔹 `req.cookies`:
* **Bản chất**: Lấy các thông tin phiên làm việc lưu trong Cookie của trình duyệt gửi lên server.
* **Cần có middleware**: `app.use(cookieParser())` trong `app.js`.
* **Ví dụ trong dự án**: `const userId = req.cookies.userId;` (Dùng để xác định người dùng đang đăng nhập mà không cần truyền lại ID mỗi lần).

---

### 4. Bảng mã trạng thái HTTP (HTTP Status Codes) chuẩn trong dự án:

| Mã trạng thái | Tên tiếng Anh | Ý nghĩa sử dụng | Vị trí áp dụng trong code |
| :---: | :--- | :--- | :--- |
| **200** | **OK** | Yêu cầu thực hiện thành công | Lấy danh sách, cập nhật thông tin thành công |
| **201** | **Created** | Tạo mới bản ghi thành công | `create` sản phẩm, danh mục, đơn hàng mới |
| **400** | **Bad Request** | Dữ liệu client gửi lên sai hoặc thiếu | Tên danh mục < 2 ký tự, thiếu email/mật khẩu, SKU trùng |
| **401** | **Unauthorized** | Chưa xác thực / Đăng nhập thất bại | Sai mật khẩu đăng nhập, chưa đăng nhập khi gọi `/users/me` |
| **403** | **Forbidden** | Bị cấm truy cập | Tài khoản đang bị khóa (`status === 'locked'`) |
| **404** | **Not Found** | Không tìm thấy tài nguyên | ID sản phẩm hoặc danh mục không tồn tại |
| **500** | **Internal Server Error** | Lỗi máy chủ / Cơ sở dữ liệu | Khối `catch (err)` bắt lỗi kết nối hoặc cú pháp DB |

---

### 5. Tại sao cần phải bọc `try...catch` ở từng hàm trong Controller?
1. **Chống sập máy chủ (Prevent Server Crash)**: Trong Node.js, nếu một Promise bị từ chối (Unhandled Promise Rejection) mà không được xử lý bằng `try...catch`, toàn bộ tiến trình ứng dụng Node.js sẽ bị dừng đột ngột (crash), khiến tất cả người dùng khác trên website đều mất kết nối.
2. **Phản hồi thông tin lỗi thân thiện (Graceful Error Handling)**: Khối `catch (err)` giúp bắt lấy lỗi, ghi nhận thông điệp lỗi và trả về cho client mã HTTP 500 kèm JSON `{ message: err.message }`, giúp giao diện người dùng hiển thị thông báo lỗi rõ ràng thay vì bị treo vô tận (Infinite Loading).

---

### 🎯 KỊCH BẢN VẤN ĐÁP CỦA GIÁO VIÊN:

**❓ Thầy/Cô hỏi: "Em hãy phân biệt sự khác nhau giữa `req.params` và `req.query`?"**  
👉 **Sinh viên trả lời:**  
*"Dạ thưa cô:*
* *`req.params` là tham số bắt buộc nằm trong cấu trúc đường dẫn được định nghĩa trước bằng dấu hai chấm (ví dụ: `/products/:id`), dùng để xác định trực tiếp một tài nguyên cụ thể.*
* *`req.query` là các tham số tùy chọn nằm sau dấu chấm hỏi `?` (ví dụ: `/products?category=HG&page=2`), dùng để lọc, tìm kiếm hoặc phân trang mà không làm thay đổi cấu trúc của route ạ."*
