# 📚 BỘ TÀI LIỆU VẤN ĐÁP & BẢO VỆ MÔN WEB503 (NODEJS - EXPRESS - MONGODB)
### DỰ ÁN: WEBSITE BÁN HÀNG MÔ HÌNH NHỰA GUNDAM (3 CÂY ĐÒN HỨA)

---

## 🧭 HƯỚNG DẪN ÔN THI NHANH DÀNH CHO SINH VIÊN
Bộ tài liệu này được biên soạn độc quyền và bám sát 100% mã nguồn thực tế của dự án, đúng chuẩn khung chương trình giảng dạy của giáo viên FPT Polytechnic.

### 📁 Danh mục các tài liệu trong thư mục này:
1. **[01-Kien-Thuc-Nen-Tang-MVC-Express.md](./01-Kien-Thuc-Nen-Tang-MVC-Express.md)**: 
   * Bản chất của NodeJS, ExpressJS.
   * Mô hình MVC trong dự án (Model, View, Controller, Route).
   * Vòng đời của 1 Request (Request Lifecycle) từ Frontend đến Database.
   * Middleware trong Express (`cors`, `cookie-parser`, `express.json`).
   * Sự khác biệt giữa `bin/www` và `app.js`.

2. **[02-Co-So-Du-Lieu-Mongoose-MongoDB.md](./02-Co-So-Du-Lieu-Mongoose-MongoDB.md)**:
   * Bản chất NoSQL MongoDB vs RDBMS (MySQL, SQL Server).
   * Mongoose ODM, Schema, Model, `_id`, `ObjectId`.
   * Khóa ngoại và cách liên kết bảng qua `.populate()`.
   * Phân tích chi tiết 5 Models: `category`, `product`, `user`, `bill`, `billdetail`.
   * Xử lý bất đồng bộ (`async / await`, `Promise`).
   * Các hàm Mongoose phổ biến: `find()`, `findById()`, `create()`, `countDocuments()`, `.lean()`, `.select()`.

3. **[03-Giai-Thich-Tung-Dong-Code-Controllers.md](./03-Giai-Thich-Tung-Dong-Code-Controllers.md)**:
   * **Phần quan trọng nhất để ăn trọn điểm vấn đáp code**:
   * Giải thích chi tiết từng dòng code trong `CategoryController.js`.
   * Giải thích chi tiết từng dòng code trong `ProductController.js`.
   * Giải thích chi tiết từng dòng code trong `UserController.js`.
   * Giải thích chi tiết từng dòng code trong `BillController.js`.
   * Giải thích chi tiết từng dòng code trong `BillDetailController.js`.

4. **[04-Routes-RESTful-API-Params-Body-Status.md](./04-Routes-RESTful-API-Params-Body-Status.md)**:
   * Chuẩn RESTful API và các phương thức HTTP: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
   * Phân biệt rõ: `req.params`, `req.body`, `req.query`, `req.cookies`, `req.headers`.
   * Bảng ý nghĩa các mã HTTP Status Code: `200`, `201`, `400`, `401`, `403`, `404`, `500`.
   * Tại sao phải bọc `try...catch` ở từng Controller?

5. **[05-Nghiep-Vu-Bao-Mat-Kich-Ban-Van-Dap-10-Diem.md](./05-Nghiep-Vu-Bao-Mat-Kich-Ban-Van-Dap-10-Diem.md)**:
   * **25 câu hỏi trúng tủ giáo viên hay hỏi nhất** kèm kịch bản trả lời mẫu.
   * Xử lý logic nghiệp vụ nâng cao: Trừ tồn kho khi mua hàng, hoàn kho khi hủy đơn, chặn xóa danh mục khi còn sản phẩm, lưu trữ sản phẩm (soft-delete), bảo vệ tài khoản Admin cuối cùng.
   * Bảo mật: Không lộ password (`select('-password')`), cookie `httpOnly`.

6. **[Tra-Cuu-Nhanh-Van-Dap.html](./Tra-Cuu-Nhanh-Van-Dap.html)**:
   * File HTML giao diện đồ họa trực quan, có thanh tìm kiếm câu hỏi, chia theo từng tab chuyên đề.
   * Bạn chỉ cần nhấp đúp chuột để mở bằng trình duyệt (Chrome/Edge/Cốc Cốc) hoặc mở trên điện thoại để ôn bài mọi lúc mọi nơi!

---

## 💡 BÍ KÍP ĐẠT ĐIỂM TỐI ĐA (9 - 10 ĐIỂM) KHI ĐI CHẤM BÀI:
1. **Tác phong**: Chào hỏi thầy/cô lịch sự, tự tin, mở sẵn màn hình VS Code (mở thư mục `controllers`, `models`, `routes`) và trình duyệt chạy sẵn website.
2. **Nguyên tắc "3 bước trả lời"**:
   * **Bước 1 (Định nghĩa)**: Nêu rõ khái niệm thầy cô đang hỏi (ví dụ: Controller là gì).
   * **Bước 2 (Chỉ vào code)**: Mở đúng file và đúng dòng code trong dự án chứng minh (ví dụ: Mở `CategoryController.js` dòng 15).
   * **Bước 3 (Nêu lý do thiết kế)**: Giải thích vì sao em làm như vậy (ví dụ: bọc `try...catch` để server không bị crash và trả mã 500 chuẩn RESTful).
