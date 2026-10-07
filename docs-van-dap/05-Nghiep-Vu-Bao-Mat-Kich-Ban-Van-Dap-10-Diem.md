# CHUYÊN ĐỀ 05: TỔNG HỢP 25 CÂU HỎI VẤN ĐÁP "TRÚNG TỦ" & KỊCH BẢN ĐẠT ĐIỂM 10

---

## 🎯 NHÓM 1: KIẾN TRÚC & LUỒNG DỮ LIỆU (CÂU 1 - 5)

### ❓ Câu 1: Em hãy giải thích mô hình MVC trong dự án này?
* **Trả lời**:  
  "Dạ thưa cô, dự án áp dụng mô hình kiến trúc MVC phân tách rõ ràng:
  * **Model**: Nằm trong thư mục `models/`, định nghĩa lược đồ (Schema) và thao tác với cơ sở dữ liệu MongoDB qua Mongoose.
  * **Controller**: Nằm trong thư mục `controllers/`, đóng vai trò xử lý logic nghiệp vụ, nhận `(req, res)` từ route, gọi Model và phản hồi dữ liệu JSON.
  * **View**: Gồm các trang giao diện trong `views/` và giao diện SPA trong thư mục `public/`.
  * **Route**: Nằm trong thư mục `routes/`, làm nhiệm vụ định tuyến URL và chuyển tiếp yêu cầu đến hàm trong Controller."

### ❓ Câu 2: Luồng đi của 1 request `GET /products` diễn ra như thế nào?
* **Trả lời**:  
  "Dạ thưa cô, khi client gửi request `GET /products`:
  1. Yêu cầu đi vào `app.js`, qua các middleware kiểm tra CORS và phân tích header.
  2. `app.js` điều hướng sang file `routes/products.js`.
  3. Tại route `/`, hệ thống gọi hàm `ProductController.getAll`.
  4. Hàm `getAll` gọi `productModel.find().populate('category')` để lấy dữ liệu từ MongoDB.
  5. Khi có dữ liệu, Controller format lại và trả về `res.status(200).json(products)`.
  6. Frontend nhận JSON và render lên giao diện sản phẩm."

### ❓ Câu 3: Tệp `bin/www` dùng để làm gì? Tại sao không khởi động server ngay trong `app.js`?
* **Trả lời**:  
  "Dạ thưa cô, `bin/www` là file cấu hình khởi tạo HTTP Server và gán cổng (Port 3000). Việc tách `app.js` và `bin/www` giúp tách biệt giữa cấu hình ứng dụng (Routing, Middleware) và cấu hình mạng (Port, HTTP/HTTPS), giúp dự án dễ bảo trì và có thể chạy kiểm thử tự động (Unit Test) mà không cần phải thực sự mở cổng mạng ạ."

### ❓ Câu 4: Middleware trong Express hoạt động như thế nào? Em hãy chỉ ra 1 middleware tự viết hoặc có sẵn trong bài?
* **Trả lời**:  
  "Dạ thưa cô, Middleware là hàm trung gian có dạng `(req, res, next)`. Nó thực hiện một công việc cụ thể rồi gọi `next()` để chuyển sang hàm tiếp theo. Trong bài, em có sử dụng các middleware có sẵn như `express.json()` để đọc body JSON, `cookieParser()` để đọc cookie, và middleware xử lý lỗi 404/500 ở cuối file `app.js` ạ."

### ❓ Câu 5: CORS là gì và tại sao trong `app.js` em phải cấu hình CORS?
* **Trả lời**:  
  "Dạ thưa cô, CORS (Cross-Origin Resource Sharing) là cơ chế bảo mật của trình duyệt ngăn chặn một trang web ở tên miền này gửi request lấy dữ liệu từ một tên miền khác. Trong `app.js`, em cấu hình `app.use(cors({ origin: true, credentials: true }))` để cho phép trình duyệt của khách hàng gửi kèm cookie và gọi API từ các cổng khác nhau một cách an toàn ạ."

---

## 🎯 NHÓM 2: CƠ SỞ DỮ LIỆU & MONGOOSE (CÂU 6 - 10)

### ❓ Câu 6: NoSQL MongoDB khác gì với SQL (MySQL)?
* **Trả lời**:  
  "Dạ thưa cô, SQL lưu trữ dữ liệu theo bảng (Table), dòng (Row) và cột (Column) cố định và có ràng buộc khóa ngoại cứng. Còn MongoDB là NoSQL lưu trữ dưới dạng Document BSON trong các Collection, có cấu trúc linh hoạt (Schema-less), cho phép lồng mảng/đối tượng bên trong document và dễ dàng mở rộng theo chiều ngang (Horizontal Scaling) ạ."

### ❓ Câu 7: Phân biệt Schema và Model trong Mongoose?
* **Trả lời**:  
  "Dạ thưa cô, Schema là bản thiết kế quy định cấu trúc của Document (kiểu dữ liệu, validation, default). Còn Model là đối tượng hoàn chỉnh được biên dịch từ Schema, cung cấp các phương thức CRUD như `find()`, `create()`, `save()` để lập trình viên tương tác trực tiếp với MongoDB ạ."

### ❓ Câu 8: `.populate()` trong Mongoose dùng để làm gì? Cho ví dụ trong code của em?
* **Trả lời**:  
  "Dạ thưa cô, `.populate()` dùng để thay thế mã `ObjectId` tham chiếu bằng toàn bộ thông tin của document thuộc bảng liên kết (tương tự phép JOIN trong SQL).  
  *Ví dụ*: Trong `ProductController.js`, em dùng `productModel.find().populate('category')` để thay thế mã ObjectId của danh mục bằng thông tin chi tiết của danh mục (như tên, hình ảnh) để hiển thị lên sản phẩm ạ."

### ❓ Câu 9: Tại sao các hàm Controller đều dùng `async / await`? Nếu bỏ `await` thì sao?
* **Trả lời**:  
  "Dạ thưa cô, vì các thao tác truy vấn cơ sở dữ liệu qua Mongoose đều là các tác vụ bất đồng bộ (Asynchronous) trả về Promise. Từ khóa `await` giúp tạm dừng thực thi để đợi cơ sở dữ liệu trả về kết quả rồi mới chạy tiếp. Nếu bỏ `await`, biến hứng dữ liệu sẽ chỉ là một `Promise { <pending> }`, dẫn đến việc trả về dữ liệu rỗng cho client hoặc gây lỗi logic ạ."

### ❓ Câu 10: Hàm `.lean()` trong Mongoose có tác dụng gì?
* **Trả lời**:  
  "Dạ thưa cô, mặc định Mongoose trả về Mongoose Document chứa nhiều phương thức nội bộ (`save`, `validate`). Khi thêm `.lean()`, Mongoose sẽ trả về đối tượng JavaScript thuần (Plain JS Object). Việc này giúp giảm tải bộ nhớ, tăng tốc độ truy vấn từ 2 đến 3 lần và cho phép em tự do thêm các thuộc tính mới (như `c.productCount = ...`) vào object ạ."

---

## 🎯 NHÓM 3: CONTROLLERS & NGHIỆP VỤ CODE (CÂU 11 - 18)

### ❓ Câu 11: Em hãy giải thích hàm `CategoryController.getAll`?
* **Trả lời**:  
  "Dạ thưa cô:
  1. Em dùng `categoryModel.find().sort({ order: 1 }).lean()` để lấy toàn bộ danh mục sắp xếp theo thứ tự hiển thị.
  2. Sau đó, em dùng vòng lặp `for...of` gọi `productModel.countDocuments(...)` để đếm số lượng sản phẩm thực tế của từng danh mục và gán vào thuộc tính `productCount`.
  3. Cuối cùng, em trả về mã `200` cùng danh sách danh mục đã gắn số lượng sản phẩm.
  4. Toàn bộ logic được bọc trong `try...catch` để nếu có sự cố thì trả về lỗi 500 ạ."

### ❓ Câu 12: Tại sao hàm `CategoryController.create` lại trả về mã HTTP `201` thay vì `200`?
* **Trả lời**:  
  "Dạ thưa cô, theo chuẩn thiết kế RESTful API quốc tế, mã `200 OK` dùng cho các yêu cầu đọc hoặc xử lý chung thành công, còn mã `201 Created` được quy định dành riêng cho các thao tác tạo mới thành công một tài nguyên trên máy chủ ạ."

### ❓ Câu 13: Trong hàm `CategoryController.remove`, tại sao không xóa luôn mà phải kiểm tra `productCount`?
* **Trả lời**:  
  "Dạ thưa cô, đây là nghiệp vụ bảo toàn toàn vẹn dữ liệu: Nếu một danh mục đang có chứa các sản phẩm mà ta lại xóa danh mục đó đi, các sản phẩm sẽ bị mồ côi (không còn danh mục cha). Do đó em kiểm tra `countDocuments`, nếu `productCount > 0` thì chặn lại với thông báo yêu cầu chuyển sản phẩm sang danh mục khác hoặc chuyển danh mục sang trạng thái Ẩn thay vì xóa ạ."

### ❓ Câu 14: Tại sao trong hàm `ProductController.remove` em lại chuyển trạng thái sang `archived`?
* **Trả lời**:  
  "Dạ thưa cô, trong các hệ thống thương mại điện tử thực tế, nếu một sản phẩm đã từng phát sinh đơn hàng trong quá khứ (`billDetailModel.countDocuments({ product: id }) > 0`), ta không được phép xóa cứng (Hard Delete) khỏi database, vì sẽ làm rách dữ liệu lịch sử hóa đơn của kế toán. Thay vào đó, em chuyển trạng thái sang `archived` (Lưu trữ / Ngừng bán) để sản phẩm không xuất hiện trên cửa hàng nữa nhưng vẫn lưu giữ được lịch sử giao dịch ạ."

### ❓ Câu 15: Quy trình xử lý đơn hàng trong `BillController.create` gồm những bước nào?
* **Trả lời**:  
  "Dạ thưa cô, quy trình gồm 5 bước chặt chẽ:
  1. Lấy thông tin người nhận và giỏ hàng.
  2. Kiểm tra tồn kho: Nếu sản phẩm nào trong giỏ có số lượng mua lớn hơn tồn kho thì báo lỗi và dừng đặt hàng.
  3. Tạo bản ghi hóa đơn cha trong bảng `bills` với trạng thái `pending`.
  4. Lưu từng sản phẩm vào bảng `billdetails` và đồng thời trừ tồn kho tương ứng trong bảng `products` bằng toán tử `$inc: { quantity: -item.quantity }`.
  5. Xóa giỏ hàng và trả về mã `201` cùng mã hóa đơn ạ."

### ❓ Câu 16: Khi khách hàng hủy đơn trong `BillController.cancel`, hệ thống xử lý tồn kho như thế nào?
* **Trả lời**:  
  "Dạ thưa cô, hệ thống sẽ duyệt qua các chi tiết của đơn hàng đó trong `billdetails` và dùng toán tử `$inc: { quantity: +d.quantity }` để cộng hoàn trả lại số lượng tồn kho cho từng sản phẩm, đồng thời lưu lý do hủy vào lịch sử đơn hàng ạ."

### ❓ Câu 17: Phân biệt `findByIdAndUpdate` với tham số `{ new: true }` và không có `{ new: true }`?
* **Trả lời**:  
  "Dạ thưa cô, mặc định hàm `findByIdAndUpdate` của Mongoose sẽ trả về dữ liệu của document **trước khi sửa**. Khi ta thêm tùy chọn `{ new: true }`, Mongoose sẽ trả về đối tượng document **sau khi đã cập nhật xong**, giúp ta gửi dữ liệu mới nhất về cho client hiển thị ạ."

### ❓ Câu 18: Tham số `req` và `res` trong các hàm Controller từ đâu mà có?
* **Trả lời**:  
  "Dạ thưa cô, `req` (IncomingMessage) và `res` (ServerResponse) là 2 đối tượng cốt lõi do Express framework tự động khởi tạo và truyền vào mỗi khi có một HTTP request gửi tới server. Controller nhận 2 đối tượng này để trích xuất dữ liệu yêu cầu (`req.params`, `req.body`) và điều khiển phản hồi (`res.status`, `res.json`) ạ."

---

## 🎯 NHÓM 4: BẢO MẬT & XÁC THỰC (CÂU 19 - 22)

### ❓ Câu 19: Tại sao khi lấy danh sách user em lại dùng `.select('-password')`?
* **Trả lời**:  
  "Dạ thưa cô, trường `password` là thông tin cực kỳ nhạy cảm. Dấu trừ `-` trước tên trường `.select('-password')` chỉ thị cho Mongoose loại bỏ trường này ra khỏi câu lệnh truy vấn, đảm bảo mật khẩu không bao giờ bị lộ ra mạng hoặc trả về phía giao diện người dùng ạ."

### ❓ Câu 20: Chức năng Đăng nhập (`UserController.login`) hoạt động như thế nào?
* **Trả lời**:  
  "Dạ thưa cô, hàm `login`:
  1. Nhận email và password từ `req.body`.
  2. Tìm user khớp thông tin trong database.
  3. Kiểm tra nếu user bị khóa (`status === 'locked'`) thì từ chối với mã 403.
  4. Nếu hợp lệ, ghi mã ID người dùng vào cookie của trình duyệt với tùy chọn `{ httpOnly: true }` (để chống tấn công XSS đánh cắp cookie qua Javascript) và trả về mã 200 kèm thông tin user ạ."

### ❓ Câu 21: Trong `UserController.toggleStatus`, em bảo vệ quyền Admin như thế nào?
* **Trả lời**:  
  "Dạ thưa cô, em thực hiện 2 cơ chế bảo vệ:
  1. Không cho phép tài khoản Admin tự bấm khóa chính mình đang đăng nhập.
  2. Trước khi khóa hoặc hạ quyền 1 Admin, em đếm tổng số Admin đang hoạt động. Nếu chỉ còn 1 Admin duy nhất, hệ thống sẽ chặn không cho khóa để tránh trường hợp trang quản trị bị mất quyền kiểm soát hoàn toàn ạ."

### ❓ Câu 22: Mã lỗi `401 Unauthorized` và `403 Forbidden` khác nhau như thế nào?
* **Trả lời**:  
  "Dạ thưa cô:
  * `401 Unauthorized`: Nghĩa là người dùng **chưa đăng nhập** hoặc thông tin xác thực sai (chưa biết bạn là ai).
  * `403 Forbidden`: Nghĩa là hệ thống đã biết bạn là ai, nhưng bạn **không có quyền** truy cập (ví dụ tài khoản bị khóa hoặc khách hàng thường cố tình vào trang Admin) ạ."

---

## 🎯 NHÓM 5: THỬ THÁCH SỬA CODE TẠI CHỖ (CÂU 23 - 25)

### ❓ Câu 23: "Nếu cô muốn thêm 1 trường `discount` (giảm giá) vào sản phẩm thì em cần sửa ở những đâu?"
* **Trả lời**:  
  "Dạ thưa cô, em chỉ cần thực hiện 2 bước:
  1. Vào file `models/product.js`, bổ sung vào Schema: `discount: { type: Number, default: 0, min: 0, max: 100 }`.
  2. Vào `controllers/ProductController.js`, tại hàm `create` và `update`, thêm trích xuất trường `discount` từ `req.body` và lưu vào là xong ạ."

### ❓ Câu 24: "Nếu cô muốn tìm kiếm sản phẩm theo tên (Search) thì em viết hàm như thế nào trong Controller?"
* **Trả lời**:  
  "Dạ thưa cô, em sẽ viết hàm:
  ```javascript
  search: async (req, res) => {
      try {
          const keyword = req.query.keyword || '';
          const products = await productModel.find({
              name: { $regex: keyword, $options: 'i' } // $options: 'i' là tìm không phân biệt chữ hoa/thường
          }).populate('category');
          return res.status(200).json(products);
      } catch (err) {
          return res.status(500).json({ message: err.message });
      }
  }
  ```
  Và trong route em thêm: `router.get('/search', ProductController.search);` ạ."

### ❓ Câu 25: "Tại sao em tự tin bài này của em đạt điểm tối đa?"
* **Trả lời**:  
  "Dạ thưa cô, vì dự án của em được hoàn thiện toàn diện:
  1. Cấu trúc chuẩn mực theo mô hình MVC, tách biệt Model - Controller - Route.
  2. Toàn bộ các Controller đều tuân thủ khuôn mẫu chuẩn của cô: `async (req, res) => { try...catch }` và phản hồi đúng chuẩn RESTful status codes.
  3. Có đầy đủ kiểm tra ràng buộc dữ liệu (Validation), xử lý tồn kho khi đặt hàng và hoàn kho khi hủy đơn.
  4. Giao diện người dùng và trang quản trị Admin đều chạy mượt mà, kết nối trực tiếp với MongoDB ạ!"
