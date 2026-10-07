# CHUYÊN ĐỀ 02: CƠ SỞ DỮ LIỆU MONGODB & THƯ VIỆN MONGOOSE

---

### 1. MongoDB là gì? Điểm khác biệt giữa MongoDB và SQL truyền thống?
* **MongoDB**: Là hệ quản trị cơ sở dữ liệu NoSQL (Not Only SQL) hướng tài liệu (Document-oriented). Dữ liệu được lưu trữ dưới dạng BSON (Binary JSON), có cấu trúc linh hoạt (Schema-less), hỗ trợ mở rộng quy mô lớn (Scale-out) dễ dàng.
* **Bảng so sánh thuật ngữ tương đương**:

| Thuật ngữ SQL (MySQL / SQL Server) | Thuật ngữ NoSQL (MongoDB) | Ý nghĩa trong dự án |
| :--- | :--- | :--- |
| **Database** | **Database** | Cơ sở dữ liệu `3caidonhua` |
| **Table** (Bảng) | **Collection** (Bộ sưu tập) | `categories`, `products`, `users`, `bills`, `billdetails` |
| **Row / Record** (Bản ghi) | **Document** (Tài liệu) | Một sản phẩm hoặc một đơn hàng cụ thể |
| **Column** (Cột) | **Field** (Trường dữ liệu) | `name`, `price`, `quantity`, `status` |
| **Primary Key** (Khóa chính) | **`_id` (ObjectId)** | Định danh duy nhất 24 ký tự hex tự sinh |
| **Foreign Key** (Khóa ngoại) | **Reference (ObjectId + ref)** | Liên kết `category` trong `product` |
| **JOIN** | **`.populate()` / `$lookup`** | Nối bảng lấy dữ liệu quan hệ |

---

### 2. Mongoose là gì? Phân biệt Schema và Model trong Mongoose?
* **Mongoose**: Là thư viện ODM (Object Data Modeling) dành cho Node.js và MongoDB. Nó cung cấp giải pháp lập mô hình dữ liệu dựa trên Schema, kiểm tra kiểu dữ liệu (Validation), tạo quan hệ và cung cấp các hàm truy vấn tiện lợi.
* **Schema**: Là bản thiết kế (Blueprint) định nghĩa cấu trúc của Document: gồm những trường nào, kiểu dữ liệu gì (`String`, `Number`, `ObjectId`), giá trị mặc định (`default`), ràng buộc hợp lệ (`required`, `min`, `max`, `unique`, `enum`).
  * *Ví dụ*: `const productSchema = new Schema({ name: { type: String, required: true }, ... })`
* **Model**: Là đối tượng khởi tạo từ Schema, đóng vai trò như một cầu nối (Interface) trực tiếp với Collection trong cơ sở dữ liệu để thực hiện các thao tác CRUD (`find`, `create`, `update`, `delete`).
  * *Ví dụ*: `module.exports = mongoose.model('product', productSchema);`

---

### 3. Khóa chính `_id` và kiểu dữ liệu `ObjectId` là gì?
* Mỗi Document trong MongoDB khi được tạo ra luôn có một trường khóa chính mặc định là `_id`.
* Kiểu dữ liệu của nó là `ObjectId` gồm **12 bytes (24 ký tự hexa)** được tạo ngẫu nhiên nhưng có quy luật:
  * 4 bytes đầu: Dấu thời gian (Timestamp) lúc Document được tạo.
  * 5 bytes tiếp theo: Định danh duy nhất của máy chủ và tiến trình (Machine ID + Process ID).
  * 3 bytes cuối: Bộ đếm tự tăng (Counter).
* Nhờ cấu trúc này, `_id` trong MongoDB đảm bảo tính độc nhất toàn cầu (Globally Unique) mà không cần hệ thống khóa tập trung.

---

### 4. Khóa ngoại và cách liên kết dữ liệu bằng `.populate()`
Trong MongoDB, các collection không có ràng buộc khóa ngoại cứng như SQL, nhưng Mongoose hỗ trợ liên kết thông qua thuộc tính `ref`:
* Khai báo trong Schema:
  ```javascript
  category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'category', 
      required: true 
  }
  ```
* Truy vấn bằng `.populate()`:
  ```javascript
  const product = await productModel.findById(id).populate('category');
  ```
  * Khi gọi `.populate('category')`, Mongoose sẽ tự động lấy giá trị `ObjectId` của trường `category`, truy vấn sang collection `categories` và thay thế trường đó bằng toàn bộ thông tin của danh mục (tên danh mục, hình ảnh, slug...).

---

### 5. Phân tích chi tiết 5 Models trong dự án:

#### 1. `models/category.js` (Danh mục sản phẩm)
* `name`: Tên danh mục (bắt buộc, không trùng `unique: true`, tối thiểu 2 ký tự).
* `slug`: Đường dẫn URL thân thiện cho SEO (tự sinh từ tiếng Việt không dấu).
* `description`: Mô tả chi tiết danh mục.
* `image`: Ảnh đại diện của danh mục.
* `order`: Thứ tự hiển thị ưu tiên (1, 2, 3...).
* `status`: Trạng thái danh mục (`active`: đang hiển thị, `inactive`: đang ẩn).
* `{ timestamps: true }`: Tự động tạo 2 trường `createdAt` và `updatedAt`.

#### 2. `models/product.js` (Sản phẩm mô hình Gundam)
* `name`: Tên sản phẩm Gunpla.
* `sku`: Mã ký hiệu kho duy nhất (`unique, uppercase`), ví dụ `RG-9812`.
* `price`: Giá bán (số nguyên/thực, tối thiểu `>= 0`).
* `quantity`: Số lượng hàng tồn kho (số nguyên `>= 0`).
* `image`: Đường dẫn hình ảnh sản phẩm.
* `grade`: Phân cấp mô hình Gundam (`HG`, `RG`, `MG`, `PG`, `SD`, `Mega Size`...).
* `scale`: Tỉ lệ mô hình (`1/144`, `1/100`, `1/60`, `1/48`...).
* `category`: Khóa ngoại tham chiếu đến Model `category`.
* `status`: Trạng thái kinh doanh (`active`: đang bán, `inactive`: tạm dừng, `archived`: đã lưu trữ lịch sử).
* `lowStockThreshold`: Ngưỡng cảnh báo sắp hết hàng (mặc định là 5 bộ).

#### 3. `models/user.js` (Người dùng & Tài khoản)
* `name`: Họ và tên khách hàng hoặc quản trị viên.
* `email`: Địa chỉ email duy nhất (`unique: true`), dùng để đăng nhập.
* `password`: Mật khẩu tài khoản.
* `role`: Phân quyền người dùng (`user`: khách mua hàng, `staff`: nhân viên, `admin`: quản trị viên tối cao).
* `status`: Trạng thái tài khoản (`active`: hoạt động, `locked`: bị khóa).
* `phone`, `address`: Số điện thoại và địa chỉ giao hàng.

#### 4. `models/bill.js` (Đơn hàng)
* `user`: Khóa ngoại liên kết với tài khoản mua hàng (`ref: 'user'`).
* `totalMoney`: Tổng số tiền thanh toán của đơn hàng.
* `paymentMethod`: Phương thức thanh toán (`COD`, `Online`, `Banking`, `VIETQR`).
* `status`: Vòng đời đơn hàng (`pending`, `confirmed`, `processing`, `shipping`, `delivered`, `completed`, `cancelled`...).
* `paymentStatus`: Trạng thái thanh toán (`unpaid`, `paid`, `refunded`).
* `shippingAddress`, `phoneNumber`, `recipientName`: Thông tin người nhận hàng.
* `carrier`: Đơn vị vận chuyển (Giao Hàng Nhanh - GHN).
* `trackingNumber`: Mã vận đơn theo dõi tiến trình giao hàng.

#### 5. `models/billdetail.js` (Chi tiết đơn vị sản phẩm trong đơn)
* `bill`: Khóa ngoại liên kết tới đơn hàng cha (`ref: 'bill'`).
* `product`: Khóa ngoại liên kết tới sản phẩm được mua (`ref: 'product'`).
* `quantity`: Số lượng mua của sản phẩm đó.
* `price`: Đơn giá tại thời điểm đặt mua (đảm bảo không bị thay đổi nếu sau này giá sản phẩm tăng/giảm).

---

### 6. Tại sao phải sử dụng `async / await` khi thao tác với Mongoose?
* Tất cả các hàm truy vấn của Mongoose (`find`, `create`, `save`, `updateOne`...) đều tương tác qua mạng tới máy chủ MongoDB, do đó chúng đều là các hàm **Bất đồng bộ (Asynchronous)** và trả về một `Promise`.
* Từ khóa `await` yêu cầu Node.js dừng đợi cho đến khi cơ sở dữ liệu thực hiện xong và trả kết quả về rồi mới thực thi tiếp dòng code bên dưới.
* **Nếu quên từ khóa `await`**: Biến nhận dữ liệu sẽ chỉ là một `Promise { <pending> }` chưa có kết quả, dẫn đến code bị sai logic hoặc trả về dữ liệu rỗng cho client!

---

### 7. Bảng tổng hợp các hàm Mongoose phổ biến trong bài:

| Hàm Mongoose | Mục đích sử dụng | Ví dụ trong code |
| :--- | :--- | :--- |
| `Model.find(query)` | Lấy danh sách nhiều documents thỏa mãn điều kiện | `categoryModel.find().sort({ order: 1 })` |
| `Model.findById(id)` | Tìm 1 document theo mã `_id` | `productModel.findById(req.params.id)` |
| `Model.findOne(query)` | Tìm 1 document đầu tiên khớp với điều kiện | `userModel.findOne({ email: req.body.email })` |
| `Model.create(data)` | Thêm mới 1 document vào database | `categoryModel.create(req.body)` |
| `Model.findByIdAndUpdate(id, data, { new: true })` | Cập nhật document theo `_id` và trả về bản ghi mới nhất | `categoryModel.findByIdAndUpdate(id, data, { new: true })` |
| `Model.findByIdAndDelete(id)` | Xóa vĩnh viễn 1 document theo `_id` | `categoryModel.findByIdAndDelete(id)` |
| `Model.countDocuments(query)` | Đếm số lượng document thỏa điều kiện | `productModel.countDocuments({ category: id })` |
| `.sort({ field: 1 / -1 })` | Sắp xếp kết quả (1: tăng dần, -1: giảm dần) | `.sort({ createdAt: -1 })` |
| `.select('-password')` | Loại bỏ trường nhạy cảm khỏi kết quả trả về | `userModel.find().select('-password')` |
| `.lean()` | Trả về Plain JavaScript Object thuần (nhẹ và nhanh hơn) | `categoryModel.find().lean()` |

---

### 🎯 KỊCH BẢN VẤN ĐÁP CỦA GIÁO VIÊN:

**❓ Thầy/Cô hỏi: "Tại sao ở model `product` em lại để `category: { type: ObjectId, ref: 'category' }` mà không lưu luôn tên danh mục vào sản phẩm?"**  
👉 **Sinh viên trả lời:**  
*"Dạ thưa cô, đây là kỹ thuật tham chiếu chuẩn trong cơ sở dữ liệu quan hệ (Normalizing data):*
* *Nếu lưu trực tiếp tên danh mục vào sản phẩm, khi người quản trị đổi tên danh mục thì sẽ phải tìm và cập nhật lại hàng ngàn sản phẩm, rất dễ gây bất đồng bộ dữ liệu.*
* *Bằng cách lưu `ObjectId` và dùng thuộc tính `ref: 'category'`, ta chỉ cần lưu mã tham chiếu. Khi cần hiển thị, ta dùng `.populate('category')` là lấy được đầy đủ tên và thông tin mới nhất của danh mục đó ạ."*
