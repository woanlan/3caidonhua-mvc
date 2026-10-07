# CHUYÊN ĐỀ 01: KIẾN THỨC NỀN TẢNG, KIẾN TRÚC MVC & EXPRESSJS

---

### 1. NodeJS & ExpressJS là gì?
* **Node.js**: Là môi trường thực thi mã nguồn JavaScript phía Server (Runtime Environment), được xây dựng trên JavaScript Engine V8 của Google Chrome. Node.js hoạt động theo cơ chế đơn luồng (Single-threaded), Non-blocking I/O và hướng sự kiện (Event-driven), giúp xử lý hàng ngàn kết nối đồng thời với hiệu năng cực cao.
* **Express.js**: Là một framework web tối giản (minimalist) và linh hoạt cho Node.js, cung cấp bộ tính năng mạnh mẽ để xây dựng ứng dụng web và các dịch vụ RESTful API (hỗ trợ routing, middleware, template engine, tích hợp database dễ dàng).

---

### 2. Mô hình MVC (Model - View - Controller) trong bài của em được tổ chức như thế nào?
Dự án được phân chia độc lập và rõ ràng theo chuẩn công nghiệp:
1. **Model (`models/`)**: 
   * Đại diện cho tầng dữ liệu và cấu trúc cơ sở dữ liệu.
   * Định nghĩa các Schema (lược đồ dữ liệu) và tương tác trực tiếp với cơ sở dữ liệu MongoDB thông qua thư viện Mongoose ODM.
   * Ví dụ: `category.js`, `product.js`, `user.js`, `bill.js`, `billdetail.js`.
2. **View (`views/` & `public/`)**:
   * Đại diện cho tầng giao diện người dùng (User Interface).
   * Dự án của em kết hợp linh hoạt cả 2 chuẩn:
     * Giao diện Handlebars (`.hbs` trong thư mục `views/`) render từ server.
     * Giao diện SPA hiện đại (`public/`) với HTML5, CSS3, JavaScript tương tác qua API.
3. **Controller (`controllers/`)**:
   * Đóng vai trò là "Bộ não điều khiển" và xử lý logic nghiệp vụ (Business Logic).
   * Nhận yêu cầu từ client (`req`), xác thực dữ liệu, gọi Model để truy vấn hoặc lưu trữ dữ liệu, sau đó đóng gói kết quả phản hồi về client (`res`).
   * Ví dụ: `CategoryController.js`, `ProductController.js`, `UserController.js`, `BillController.js`, `BillDetailController.js`.
4. **Router (`routes/`)**:
   * Là tầng trung gian đóng vai trò điều hướng (Routing).
   * Lắng nghe các yêu cầu HTTP (GET, POST, PUT, PATCH, DELETE) tại các URL cụ thể và chuyển giao công việc trực tiếp cho hàm tương ứng trong Controller xử lý.
   * Ví dụ: `router.get('/', CategoryController.getAll);`

---

### 3. Vòng đời của một Request (Request Lifecycle) diễn ra như thế nào?
Khi người dùng bấm vào một chức năng trên website (Ví dụ: xem danh sách sản phẩm):
1. **Bước 1 (Client)**: Trình duyệt gửi một HTTP Request (ví dụ `GET /api/products`) tới Server.
2. **Bước 2 (Server & Middleware)**: Request đi vào `app.js`, đi qua các middleware toàn cục:
   * `cors()`: Kiểm tra quyền truy cập tên miền.
   * `express.json()`: Parse dữ liệu JSON từ body (nếu có).
   * `cookieParser()`: Đọc cookies (xác định user đang đăng nhập).
3. **Bước 3 (Routing)**: `app.use('/products', productRouter)` điều hướng request vào file `routes/products.js`. Tại đây, đường dẫn `/` khớp với `ProductController.getAll`.
4. **Bước 4 (Controller)**: Hàm `ProductController.getAll` được thực thi. Controller gọi `productModel.find().populate('category')` để yêu cầu dữ liệu từ MongoDB.
5. **Bước 5 (Database)**: MongoDB xử lý truy vấn và trả kết quả các document sản phẩm về cho Mongoose/Controller.
6. **Bước 6 (Response)**: Controller nhận dữ liệu, định dạng lại chuẩn và gọi `return res.status(200).json(products)`.
7. **Bước 7 (Client Render)**: Trình duyệt nhận được mảng JSON và hiển thị sản phẩm lên giao diện cho người dùng.

---

### 4. File `bin/www` và file `app.js` khác nhau như thế nào?
* **`app.js`**: Là nơi khởi tạo đối tượng ứng dụng Express (`const app = express()`), cấu hình các middleware (`cors`, `morgan`, `json`), kết nối cơ sở dữ liệu MongoDB và gắn (mount) các Router. `app.js` KHÔNG trực tiếp lắng nghe cổng mạng (port), giúp file này độc lập và dễ dàng viết Unit Test.
* **`bin/www`**: Là tệp điểm khởi động (Entry Point) của ứng dụng. Tệp này import `app` từ `app.js`, khởi tạo HTTP Server của Node.js (`http.createServer(app)`), gán cổng lắng nghe (`port 3000`), và xử lý các sự kiện mạng (bắt lỗi cổng trùng `onError`, thông báo đang lắng nghe `onListening`).

---

### 5. Middleware là gì? Kể tên các middleware có trong dự án?
* **Khái niệm**: Middleware là các hàm trung gian nằm giữa Request và Response. Nó có quyền truy cập vào đối tượng yêu cầu (`req`), đối tượng phản hồi (`res`) và hàm `next()` để chuyển quyền thực thi cho middleware tiếp theo trong chuỗi.
* **Các middleware trong dự án**:
  1. `cors()`: Xử lý chia sẻ tài nguyên giữa các nguồn khác nhau (Cross-Origin Resource Sharing).
  2. `logger('dev')` (Morgan): Ghi log chi tiết từng request (Method, URL, Status Code, thời gian phản hồi) ra terminal để lập trình viên theo dõi.
  3. `express.json()`: Tự động phân tích payload dạng JSON gửi lên trong `req.body`.
  4. `express.urlencoded({ extended: false })`: Phân tích dữ liệu gửi từ thẻ `<form>` truyền thống.
  5. `cookieParser()`: Đọc và phân tích các Cookie gửi kèm trong header request, lưu vào `req.cookies`.
  6. `express.static(path.join(__dirname, 'public'))`: Phục vụ các file tĩnh (HTML, CSS, JS, hình ảnh, video).
  7. **Error Handler**: Middleware bắt lỗi 404 và bắt lỗi ngoại lệ cấp server (500) ở cuối file `app.js`.

---

### 🎯 KỊCH BẢN VẤN ĐÁP CỦA GIÁO VIÊN:

**❓ Thầy/Cô hỏi: "Em hãy mở file `app.js` và chỉ cho cô biết middleware nào giúp em đọc được dữ liệu JSON từ client gửi lên?"**  
👉 **Sinh viên trả lời:**  
*"Dạ thưa cô, đó là middleware `app.use(express.json());` ở dòng 39 trong file `app.js`. Nhờ có middleware này mà trong Controller em mới có thể đọc được dữ liệu qua `req.body` ạ. Nếu không có dòng này thì `req.body` sẽ bị `undefined` ạ."*

**❓ Thầy/Cô hỏi: "Tại sao em lại tách riêng Controller ra khỏi Route mà không viết code xử lý trực tiếp luôn trong `routes/*.js`?"**  
👉 **Sinh viên trả lời:**  
*"Dạ thưa cô, việc tách riêng Controller giúp tuân thủ nguyên lý Single Responsibility (Đơn nhiệm) trong mô hình MVC:*
* *Route chỉ làm nhiệm vụ duy nhất là định tuyến URL.*
* *Controller đảm nhận toàn bộ logic nghiệp vụ, bắt lỗi và phản hồi.*
* *Cách làm này giúp code gọn gàng, dễ đọc, dễ viết Unit Test và khi dự án mở rộng thì việc bảo trì, sửa lỗi không làm ảnh hưởng lẫn nhau ạ."*
