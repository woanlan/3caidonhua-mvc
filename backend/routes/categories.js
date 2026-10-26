var express = require('express');
var router = express.Router();
var CategoryController = require('../controllers/CategoryController');

/**
 * Routes Quản lý Danh mục (Categories)
 * Chuẩn MVC: Route định tuyến request đến hàm xử lý trong CategoryController
 */

// 1. Lấy danh sách danh mục (GET /categories hoặc GET /api/categories)
router.get('/', CategoryController.getAll);

// 2. Lấy chi tiết danh mục theo ID (GET /categories/:id)
router.get('/:id', CategoryController.getById);

// 3. Thêm mới danh mục (POST /categories/add hoặc POST /categories)
router.post('/add', CategoryController.create);
router.post('/', CategoryController.create);

// 4. Cập nhật danh mục (PUT /categories/edit/:id hoặc PUT /categories/:id)
router.put('/edit/:id', CategoryController.update);
router.put('/:id', CategoryController.update);

// 5. Bật / Tắt trạng thái hiển thị danh mục (PATCH /categories/:id/toggle-status)
router.patch('/:id/toggle-status', CategoryController.toggleStatus);

// 6. Xóa danh mục (DELETE /categories/delete/:id hoặc DELETE /categories/:id)
router.delete('/delete/:id', CategoryController.remove);
router.delete('/:id', CategoryController.remove);

module.exports = router;
