# 3caidonhua — HTML/CSS/TypeScript + Node.js MVC + MySQL

Bản tổ chức lại từ giao diện 3caidonhua, giữ nguyên hero video và phong cách nền tối/đỏ. Frontend là View, backend trả JSON qua API. Không dùng React, Vue hay template EJS.

## 1. Chạy trên Windows / PowerShell

Cần **Node.js 24 trở lên** và **MySQL 8.0 trở lên** (hoặc MariaDB 10.6 trở lên). Nếu dùng XAMPP, bật dịch vụ MySQL. Không cần bật Apache vì Node phục vụ website.

Giải nén file ZIP. Mở terminal **ngay thư mục chứa package.json**. Bản ZIP này đặt package.json ở gốc, không có thêm một thư mục con bao ngoài.

```powershell
node -v
dir package.json
npm install
Copy-Item .env.example .env
```

Mở `.env` và đặt cấu hình đúng với máy:

```ini
PORT=3000
HOST=127.0.0.1
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gundamshop_mvc
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Nếu tài khoản MySQL có mật khẩu, điền vào DB_PASSWORD. DB_NAME mặc định dùng database mới `gundamshop_mvc`, không đụng vào bản đồ án cũ. Không nhập thông tin database thật vào mã nguồn công khai.

Tạo bảng và dữ liệu mẫu:

```powershell
npm run db:init
```

Script cần tài khoản có quyền CREATE DATABASE/TABLE. Script không DROP bảng hay xóa dữ liệu; seed không ghi đè sản phẩm có sẵn. Nếu đã có database cùng tên nhưng cấu trúc khác, đổi DB_NAME sang database mới thay vì chạy đè. `schema.sql` và `seed.sql` cũng có thể import thủ công sau khi bạn tạo/chọn database tương ứng.

Tạo admin: mở `.env`, tự điền `ADMIN_EMAIL` và `ADMIN_PASSWORD` (10–128 ký tự), rồi chạy:

```powershell
npm run admin:create
```

Script không cấp lại quyền hoặc ghi đè một email đã tồn tại. Sau khi tạo xong, xóa giá trị ADMIN_PASSWORD trong `.env`. Không có admin hay mật khẩu mặc định trong mã nguồn.

Khởi động:

```powershell
npm start
```

Mở http://localhost:3000. Chọn biểu tượng tài khoản để đăng nhập; vào http://localhost:3000/#admin để quản trị. Khách tự đăng ký sẽ có quyền customer. Server tự kiểm tra quyền, không dựa vào việc ẩn nút giao diện.

**Không mở HTML bằng file:// hoặc Live Server riêng**: frontend cần cùng origin với Node để gọi API và dùng cookie phiên. `npm start` tự sinh JavaScript từ TypeScript trước khi chạy.

## 2. Cấu trúc và trách nhiệm

```text
frontend/
  index.html                 View chung: trang chủ và các vùng giao diện
  pages/
    products.html            Điểm vào danh sách sản phẩm
    cart.html                Điểm vào giỏ hàng
    admin/index.html         Điểm vào quản trị
  css/style.css              Giao diện và responsive
  ts/api.ts                  Fetch API, kiểu dữ liệu, phiên hiện tại
  ts/app.ts                  Render giao diện và xử lý sự kiện
  js/                        JavaScript được tạo bởi npm run build
  assets/                    Video người dùng và ảnh poster
backend/src/
  config/database.ts         Connection pool, prepared queries, transaction helper
  routes/                    Đường dẫn API + middleware bảo vệ
  controllers/               Nhận HTTP, validate đầu vào, trả JSON
  models/                    Câu lệnh SQL và truy xuất dữ liệu
  services/                  Nghiệp vụ CRUD, giỏ hàng, đặt/hủy đơn
  middleware/                Xác thực, quyền admin, CSRF, xử lý lỗi
  utils/                     Kiểm tra dữ liệu, scrypt mật khẩu
  app.ts                     Ghép Express routes và static frontend
  server.ts                  Kiểm tra database và mở cổng
scripts/
  build.mjs                  Biên dịch cú pháp TS frontend sang JS
  init-db.ts                 Tạo database và seed
  create-admin.ts            Tạo admin từ biến môi trường
  verify-mysql.ts            Chạy kiểm thử với database test riêng
 database/
  schema.sql                 17 bảng ERD + bảng sessions
  seed.sql                   Danh mục và 3 kit minh họa
 tests/
  core.test.ts               Kiểm tra không cần MySQL đang chạy
  mysql.integration.test.ts  Kiểm tra tích hợp khi chủ động bật
.env.example                 Cấu hình mẫu, không chứa bí mật
package.json
package-lock.json
tsconfig.json
```

Các file trong `frontend/pages` là lối vào chuyển đến vùng giao diện chung (hash route); không nhân bản toàn bộ header/footer thành nhiều file. Phần View không truy vấn SQL và không tự quyết định giá thanh toán.

Luồng: View → API Route → middleware → Controller → Service khi có nghiệp vụ → Model/MySQL → JSON → View.

## 3. Đã thực hiện

- Tài khoản: đăng ký, đăng nhập, đăng xuất, nhận thông tin phiên. Mật khẩu băm scrypt với salt. Cookie HttpOnly/SameSite, session lưu database với token được băm. Cookie Secure khi NODE_ENV=production và dùng HTTPS.
- Phân quyền: khách không gọi được API admin. Chặn yêu cầu ghi khác origin, yêu cầu CSRF token cho thao tác đã đăng nhập. Giới hạn số lần login/register theo IP trong một tiến trình.
- Danh mục: thêm/xem/sửa/xóa. Không xóa được danh mục đang có sản phẩm sử dụng do FK.
- Sản phẩm: thêm/xem/sửa/ngừng bán. Ngừng bán là soft-delete bằng status=archived; lịch sử đơn được giữ.
- SKU: giao diện quản lý một SKU mặc định cho mỗi sản phẩm. Schema vẫn có quan hệ 1–N để mở rộng, nhưng chưa có màn quản lý nhiều SKU của cùng một sản phẩm; chưa nên nhập thêm nhiều SKU thủ công.
- Giỏ: lưu MySQL theo người dùng; thêm/xem/đổi số lượng/xóa. Không giữ hàng chỉ vì thêm vào giỏ.
- Đặt hàng COD: server lấy giá từ database, kiểm tra tồn kho, tạo order + items + payment pending, trừ tồn và dọn giỏ trong cùng transaction. Giá, tên, SKU và địa chỉ được chụp tại thời điểm đặt.
- Đơn: khách chỉ xem đơn của mình; admin xem tối đa 200 đơn gần nhất và đổi trạng thái theo thứ tự hợp lệ. Hủy đơn pending/confirmed hoàn tồn một lần. Không xóa cứng đơn.
- Giữ hero video toàn màn hình, responsive, poster và nút tạm dừng; tôn trọng giảm chuyển động.

Các thay đổi được lưu MySQL, không mất khi tải lại hoặc khởi động lại Node. Danh sách sản phẩm tải từ API; không dùng mảng sản phẩm giả trên frontend.

## 4. API chính

| Method | Endpoint | Quyền / công dụng |
|---|---|---|
| POST | /api/auth/register | Đăng ký customer |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/auth/me | Người đã đăng nhập |
| POST | /api/auth/logout | Người đã đăng nhập + CSRF |
| GET | /api/products | Sản phẩm đang bán |
| GET | /api/products/:id | Chi tiết sản phẩm |
| POST | /api/products | Admin, tạo sản phẩm và SKU mặc định |
| PUT | /api/products/:id | Admin, gửi toàn bộ trường form để sửa |
| DELETE | /api/products/:id | Admin, ngừng bán |
| GET | /api/categories | Danh sách danh mục |
| POST/PUT/DELETE | /api/categories[/:id] | Admin CRUD danh mục |
| GET | /api/metadata | Danh mục, thương hiệu, grade, series |
| GET | /api/cart | Giỏ người hiện tại |
| PUT | /api/cart/items/:variantId | Đặt số lượng tuyệt đối, body {quantity} |
| DELETE | /api/cart/items/:variantId | Xóa khỏi giỏ |
| GET/POST | /api/orders | Xem đơn cá nhân / đặt hàng từ giỏ server |
| GET | /api/admin/products | Admin xem cả sản phẩm ngừng bán |
| GET | /api/admin/orders | Admin xem đơn gần nhất |
| PATCH | /api/admin/orders/:id/status | Admin đổi status |

PUT sản phẩm nhận name, slug, description, categoryId, brandId, gradeId, seriesId, scale, sku, price, stock. API dùng prepared statements, không nối đầu vào người dùng vào SQL. Mỗi request ghi đã đăng nhập cần header X-CSRF-Token nhận từ API đăng nhập hoặc /auth/me; frontend tự gửi.

## 5. Phạm vi chưa triển khai

Schema có đủ 17 bảng nghiệp vụ, nhưng chưa có UI/API đầy đủ cho địa chỉ lưu sẵn, ảnh upload, thương hiệu/grade/series CRUD, coupon, review, shipment và đối soát thanh toán. Chưa có reset mật khẩu/email xác minh, phân trang danh mục, nhiều kho, preorder, nhập hàng, đổi trả, upload ảnh hoặc cổng thanh toán. Không tuyên bố đây là hệ thống thương mại hoàn thiện.

Thanh toán COD chỉ tạo bản ghi pending; chuyển đơn sang completed không tự chuyển tiền thành succeeded. Sau này cần nghiệp vụ xác nhận thu tiền riêng. Hiện thu phí vận chuyển 0 và chưa hỗ trợ giảm giá. Các thông số ảnh/giá mẫu cần thay bằng dữ liệu bán hàng thực tế. Nhãn logo chữ vẫn là bản tạm chờ logo người dùng.

## 6. Kiểm thử

```powershell
npm run build
npm run check
npm test
```

Đã chạy thành công kiểm tra TypeScript, cú pháp JavaScript và 4 nhóm test: đầu vào, chuyển trạng thái, mật khẩu, HTTP/static/video range và bảo vệ API khi chưa đăng nhập. Test MySQL tích hợp mặc định được SKIP.

Môi trường tạo mã không có MySQL chạy được; **chưa xác nhận end-to-end các truy vấn/transaction với MySQL thực tế**. Có script chạy kiểm thử riêng trên máy bạn:

```powershell
npm run test:mysql
```

Script tạo/chọn database riêng có tên bằng DB_NAME + `_test`, chạy schema/seed rồi bật kiểm thử tích hợp. Tài khoản .env cần quyền tạo database test. Script không đổi .env, không ghi vào database làm việc. Kiểm thử tạo rồi dọn những bản ghi riêng của nó; database test vẫn được giữ.

Test tích hợp bao gồm quyền admin/CSRF, CRUD, FK danh mục, giỏ lưu lại qua request, đặt đơn, giữ giá lịch sử, chống đặt đơn lần hai từ giỏ đã dọn và hoàn tồn đúng một lần khi hủy. Không thay thế kiểm thử đồng thời quy mô lớn hoặc kiểm thử trình duyệt trực quan.

## 7. Khi gặp lỗi

- `ENOENT package.json`: đang đứng sai thư mục. Chạy `dir package.json`; mở terminal ở thư mục có file này.
- `ECONNREFUSED`: chưa bật MySQL hoặc sai DB_HOST/DB_PORT.
- `Access denied`: DB_USER/DB_PASSWORD chưa đúng hoặc thiếu quyền.
- `Unknown database` / `Table doesn't exist`: chạy `npm run db:init` sau khi kiểm tra cấu hình.
- Trang quản trị báo không có quyền: đăng nhập email được tạo bằng `npm run admin:create`, không dùng tài khoản customer.
- Sửa TS chưa thấy thay đổi: chạy `npm run build`, tải lại trình duyệt. npm run dev chỉ theo dõi backend, không tự biên dịch frontend.
- Không chạy trên Node cũ: dùng Node.js 24+. Không cần cài TypeScript toàn cục.
