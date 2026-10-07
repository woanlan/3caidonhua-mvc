# CHUYÊN ĐỀ 03: GIẢI THÍCH CHI TIẾT TỪNG DÒNG CODE TRONG CONTROLLERS
*(Tài liệu cốt lõi giúp bạn tự tin trả lời bất kỳ câu hỏi nào khi giáo viên chỉ vào màn hình code)*

---

## 1. FILE: `controllers/CategoryController.js`

### 🔍 Hàm 1: `getAll: async (req, res) => { ... }`
```javascript
getAll: async (req, res) => {
    try {
        // Dòng 1: Truy vấn tất cả danh mục từ MongoDB, sắp xếp theo thứ tự hiển thị và thời gian tạo
        // .lean() giúp trả về đối tượng JavaScript thuần để có thể bổ sung thuộc tính mới
        const categories = await categoryModel.find().sort({ order: 1, createdAt: 1 }).lean();

        // Dòng 2: Duyệt qua từng danh mục để đếm số lượng sản phẩm thực tế đang thuộc về danh mục đó
        for (const c of categories) {
            c.id = c._id.toString(); // Chuyển ObjectId thành chuỗi ID để tương thích giao diện
            c.productCount = await productModel.countDocuments({
                $or: [{ category: c._id }, { categoryId: c._id }]
            });
        }

        // Dòng 3: Trả về mã HTTP 200 (Thành công) cùng danh sách danh mục đã gắn số lượng sản phẩm
        return res.status(200).json(categories);
    } catch (err) {
        // Dòng 4: Nếu có lỗi kết nối database hoặc cú pháp, bắt lỗi và trả về mã HTTP 500
        return res.status(500).json({ message: err.message });
    }
}
```

---

### 🔍 Hàm 2: `getById: async (req, res) => { ... }`
```javascript
getById: async (req, res) => {
    try {
        // Dòng 1: Tìm danh mục theo ID truyền trên đường dẫn URL (req.params.id)
        const category = await categoryModel.findById(req.params.id).lean();

        // Dòng 2: Kiểm tra nếu không tìm thấy bản ghi nào trong database
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

        // Dòng 3: Gắn thêm ID chuỗi và đếm số sản phẩm liên kết
        category.id = category._id.toString();
        category.productCount = await productModel.countDocuments({
            $or: [{ category: category._id }, { categoryId: category._id }]
        });

        // Dòng 4: Trả về mã 200 và đối tượng danh mục tìm thấy
        return res.status(200).json(category);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
```

---

### 🔍 Hàm 3: `create: async (req, res) => { ... }`
```javascript
create: async (req, res) => {
    try {
        // Dòng 1: Trích xuất các trường dữ liệu do client gửi lên trong thân request (req.body)
        const { name, slug, description, image, order, status } = req.body;

        // Dòng 2: Kiểm tra tính hợp lệ (Validation): tên danh mục không được để trống và tối thiểu 2 ký tự
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ status: 0, message: 'Tên danh mục phải có tối thiểu 2 ký tự.' });
        }

        // Dòng 3: Tự động tạo slug chuẩn SEO nếu người dùng không tự nhập slug
        const finalSlug = (slug && slug.trim()) ? toVietnameseSlug(slug) : toVietnameseSlug(name);

        // Dòng 4: Kiểm tra trùng lặp tên hoặc slug trong cơ sở dữ liệu
        const existing = await categoryModel.findOne({ $or: [{ name: name.trim() }, { slug: finalSlug }] });
        if (existing) {
            return res.status(400).json({ status: 0, message: 'Tên danh mục hoặc đường dẫn (slug) này đã tồn tại.' });
        }

        // Dòng 5: Gọi hàm categoryModel.create để lưu bản ghi mới vào MongoDB
        const newCategory = await categoryModel.create({
            name: name.trim(),
            slug: finalSlug,
            description: description || '',
            image: image || '/assets/products/rg-hinu.jpg',
            order: Number(order) || 1,
            status: status || 'active'
        });

        // Dòng 6: Trả về mã HTTP 201 (Created - Đã tạo thành công) và dữ liệu bản ghi mới
        return res.status(201).json(newCategory);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
```

---

### 🔍 Hàm 4: `update: async (req, res) => { ... }`
```javascript
update: async (req, res) => {
    try {
        // Dòng 1: Lấy ID từ URL (req.params.id) và thông tin cập nhật từ req.body
        const { id } = req.params;
        const { name, slug, description, image, order, status } = req.body;

        // Dòng 2: Tìm danh mục cần sửa theo ID
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ status: 0, message: 'Không tìm thấy danh mục' });
        }

        // Dòng 3: Cập nhật các trường nếu có dữ liệu mới gửi lên
        if (name) category.name = name.trim();
        if (slug) category.slug = toVietnameseSlug(slug);
        else if (name) category.slug = toVietnameseSlug(name);
        if (description !== undefined) category.description = description;
        if (image !== undefined) category.image = image;
        if (order !== undefined) category.order = Number(order);
        if (status !== undefined) category.status = status;

        // Dòng 4: Lưu các thay đổi xuống MongoDB
        const updated = await category.save();

        // Dòng 5: Trả về mã 200 và dữ liệu danh mục sau khi sửa
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
```

---

### 🔍 Hàm 5: `remove: async (req, res) => { ... }`
```javascript
remove: async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

        // ĐOẠN QUAN TRỌNG: Kiểm tra ràng buộc toàn vẹn dữ liệu
        // Nếu danh mục này đang có sản phẩm thì CHẶN không cho xóa để tránh mồ côi dữ liệu
        const productCount = await productModel.countDocuments({
            $or: [{ category: id }, { categoryId: id }]
        });

        if (productCount > 0) {
            return res.status(400).json({
                status: 0,
                message: `Chặn xóa: Danh mục "${category.name}" hiện đang có ${productCount} sản phẩm liên kết.`
            });
        }

        // Thực hiện xóa danh mục khi đã an toàn
        const deleted = await categoryModel.findByIdAndDelete(id);
        return res.status(200).json({ status: 1, message: `Đã xóa danh mục "${category.name}" thành công!`, deleted });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
```

---

## 2. FILE: `controllers/ProductController.js`

### 🔍 Điểm cốt lõi cần giải thích với giáo viên:
1. **Hàm `mapProduct(p)`**:
   * Chuẩn hóa dữ liệu Document của Mongoose thành cấu trúc JSON thân thiện với Frontend.
   * Tạo mã SKU dự phòng nếu thiếu (`KIT-XXXX`).
   * Gán nhãn thương hiệu (Bandai, Daban, Jijia) dựa trên tên sản phẩm.
   * Đảm bảo các trường `stock`, `quantity`, `id`, `_id` đồng nhất để giao diện không bị lỗi.
2. **`getAll`**:
   * Dùng `productModel.find().populate('category').sort({ createdAt: -1 })`.
   * `.populate('category')` lấy thông tin chi tiết của danh mục thay vì chỉ lấy mã ObjectId.
   * `.sort({ createdAt: -1 })` giúp sản phẩm mới tạo luôn hiển thị lên đầu tiên.
3. **`create`**:
   * Kiểm tra ràng buộc hợp lệ: Tên tối thiểu 2 ký tự, Giá và Tồn kho phải là số không âm.
   * Tự động sinh mã SKU theo chuẩn cấp độ (`HG`, `RG`, `MG`...) nếu người dùng không nhập.
   * Kiểm tra trùng mã SKU (`productModel.findOne({ sku: finalSku })`).
4. **`remove` (Nghiệp vụ thực tế TMĐT)**:
   * Kiểm tra xem sản phẩm này đã từng có trong đơn hàng nào chưa: `await billDetailModel.countDocuments({ product: id })`.
   * Nếu đã phát sinh đơn hàng: Chuyển trạng thái sang `archived` (Lưu trữ / Ngừng kinh doanh) thay vì xóa cứng, nhằm bảo toàn lịch sử hóa đơn bán hàng cho kế toán.

---

## 3. FILE: `controllers/UserController.js`

### 🔍 Điểm cốt lõi cần giải thích với giáo viên:
1. **Hàm `getAll` & `getById`**:
   * Dùng `.select('-password')` để KHÔNG BAO GIỜ gửi mật khẩu về phía Client. Đây là nguyên tắc bảo mật tối quan trọng trong phát triển Web.
   * Tính toán tổng số đơn hàng (`orderCount`) và tổng số tiền chi tiêu (`totalSpent`) của khách hàng để phục vụ quản trị chăm sóc khách hàng VIP.
2. **Hàm `login` (Đăng nhập)**:
   * Nhận `email` và `password` từ `req.body`.
   * Tìm người dùng trong database bằng `userModel.findOne({ email, password })`.
   * Kiểm tra trạng thái tài khoản: Nếu `status === 'locked'` thì từ chối đăng nhập với mã 403 (Forbidden).
   * Tạo Cookie phiên đăng nhập an toàn:
     `res.cookie('userId', user._id.toString(), { httpOnly: true, maxAge: 7 ngày });`
     *(Thuộc tính `httpOnly: true` ngăn chặn tấn công XSS đánh cắp cookie từ Javascript)*.
3. **Hàm `toggleStatus` & `changeRole` (Bảo vệ hệ thống)**:
   * Chặn người dùng tự khóa tài khoản của chính mình.
   * Chặn khóa hoặc hạ quyền của Quản trị viên (Admin) cuối cùng của hệ thống để tránh tình trạng hệ thống bị mất quyền quản trị.

---

## 4. FILE: `controllers/BillController.js` (Quy trình Đơn hàng & Kho)

### 🔍 Luồng xử lý đặt hàng `create` (Quy trình 5 bước kinh điển):
1. **Bước 1**: Nhận thông tin người nhận (`recipient`, `phone`, `address`, `paymentMethod`) và danh sách giỏ hàng.
2. **Bước 2 (Kiểm tra kho)**: Duyệt qua từng sản phẩm trong giỏ hàng, kiểm tra `prod.quantity < item.quantity`. Nếu kho không đủ hàng thì dừng lại và báo lỗi mã 400.
3. **Bước 3 (Tạo đơn hàng cha)**: Tạo bản ghi vào collection `bills` với trạng thái ban đầu là `pending` (Chờ xác nhận). Tự sinh mã vận đơn GHN.
4. **Bước 4 (Tạo chi tiết đơn hàng & Trừ kho)**:
   * Tạo các bản ghi vào collection `billdetails`.
   * Thực hiện trừ tồn kho an toàn: `productModel.findByIdAndUpdate(prod._id, { $inc: { quantity: -item.quantity } })`.
5. **Bước 5 (Dọn giỏ hàng & Phản hồi)**: Xóa sạch giỏ hàng tạm của người dùng và trả về mã 201 cùng thông tin hóa đơn.

---

### 🔍 Luồng xử lý hủy đơn hàng `cancel`:
1. Chỉ cho phép khách hàng hủy khi đơn hàng ở trạng thái `pending` hoặc `confirmed` (chưa bàn giao cho bên giao vận).
2. Khi hủy đơn thành công, hệ thống tự động hoàn lại số lượng tồn kho cho các sản phẩm trong đơn (`$inc: { quantity: +d.quantity }`).
3. Ghi lại lịch sử thay đổi trạng thái vào mảng `statusHistory` để phục vụ kiểm toán (Audit Log).
