var express = require('express');
var router = express.Router();
var BillController = require('../controllers/BillController');

/**
 * Routes Quản lý Đơn hàng (Bills / Orders)
 * Chuẩn MVC: Route chuyển tiếp request trực tiếp cho BillController
 */

// 1. Danh sách đơn hàng (GET /bills hoặc GET /orders)
router.get('/', BillController.getAll);

// 2. Tra cứu đơn hàng theo Mã hoặc SĐT (GET /bills/track/:query hoặc POST /bills/track)
router.get('/track/:query', BillController.track);
router.post('/track', BillController.track);

// 3. Khách hàng hủy đơn hàng (POST /bills/:id/cancel hoặc POST /orders/:id/cancel)
router.post('/:id/cancel', BillController.cancel);

// 4. Tạo đơn hàng mới (POST /bills hoặc POST /orders hoặc POST /bills/add)
router.post('/', BillController.create);
router.post('/add', BillController.create);

// 5. Chi tiết đơn hàng theo ID (GET /bills/:id)
router.get('/:id', BillController.getById);

// 6. Cập nhật đơn hàng (PUT /bills/:id)
router.put('/:id', BillController.update);

// 7. Xóa đơn hàng (DELETE /bills/:id)
router.delete('/:id', BillController.remove);

module.exports = router;
