var express = require('express');
var router = express.Router();
var ProductController = require('../controllers/ProductController');

/**
 * Routes Quản lý Sản phẩm (Products)
 * Chuẩn MVC: Route chuyển tiếp request trực tiếp cho ProductController
 */

// 1. Danh sách sản phẩm (hỗ trợ cả RESTful chuẩn và các URL bài giảng FPT)
router.get('/', ProductController.getAll);
router.get('/list-product', ProductController.getAll);
router.get('/list-product-with-category', ProductController.getAll);
router.get('/detail-by-id', ProductController.getById);
router.get('/detail-find-by-id', ProductController.getById);

// 2. Lấy danh sách sản phẩm theo danh mục
router.get('/by-category/:categoryId', ProductController.getByCategory);

// 3. Lấy chi tiết theo ID (GET /products/:id)
router.get('/:id', ProductController.getById);

// 4. Thêm sản phẩm mới (POST /products/add hoặc POST /products)
router.post('/add', ProductController.create);
router.post('/', ProductController.create);

// 5. Cập nhật sản phẩm (PUT /products/edit/:id hoặc PUT /products/:id)
router.put('/edit/:id', ProductController.update);
router.put('/:id', ProductController.update);

// 6. Bật / Tắt trạng thái mở bán (PATCH /products/:id/toggle-status)
router.patch('/:id/toggle-status', ProductController.toggleStatus);

// 7. Xóa hoặc Lưu trữ sản phẩm (DELETE /products/delete/:id hoặc DELETE /products/:id)
router.delete('/delete/:id', ProductController.remove);
router.delete('/:id', ProductController.remove);

module.exports = router;
