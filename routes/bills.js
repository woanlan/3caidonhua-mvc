var express = require('express');
var router = express.Router();
var BillController = require('../controllers/BillController');

// ====================================================================================
// [NGHIỆP VỤ ĐƠN HÀNG - ROUTES] - bills.js (Được alias cho cả /bills và /orders)
// Định tuyến các yêu cầu liên quan đến đơn hàng sang BillController xử lý
// ====================================================================================

// 1. [NGHIỆP VỤ ĐƠN HÀNG]: Lấy danh sách đơn hàng (GET /bills hoặc GET /orders)
router.get('/', BillController.getAll);

// 2. [NGHIỆP VỤ TRA CỨU ĐƠN]: Tra cứu tiến trình đơn hàng bằng Mã HD hoặc SĐT
router.get('/track/:query', BillController.track);
router.post('/track', BillController.track);

// 3. [NGHIỆP VỤ HỦY ĐƠN]: Khách hàng tự hủy đơn chưa bàn giao giao hàng (POST /bills/:id/cancel)
router.post('/:id/cancel', BillController.cancel);

// 4. [NGHIỆP VỤ ĐẶT HÀNG / CHECKOUT]: Tạo đơn hàng mới từ giỏ hàng (POST /bills hoặc POST /orders)
router.post('/', BillController.create);
router.post('/add', BillController.create);

// 5. [NGHIỆP VỤ ĐƠN HÀNG]: Xem chi tiết đơn hàng theo ID (GET /bills/:id)
router.get('/:id', BillController.getById);

// 6. [NGHIỆP VỤ XÁC NHẬN / CẬP NHẬT ĐƠN]: Admin duyệt đơn, đổi trạng thái, thanh toán (PUT /bills/:id)
router.put('/:id', BillController.update);

// 7. [NGHIỆP VỤ ĐƠN HÀNG]: Xóa đơn hàng (DELETE /bills/:id)
router.delete('/:id', BillController.remove);

module.exports = router;
