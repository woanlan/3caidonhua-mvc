const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

// ====================================================================================
// [NGHIỆP VỤ THANH TOÁN - ROUTES] - payment.js
// Định tuyến các yêu cầu thanh toán VNPAY Sandbox và Webhook SePay/VietQR
// ====================================================================================

// 1. [NGHIỆP VỤ THANH TOÁN VNPAY]: Tạo liên kết thanh toán sang cổng VNPAY Sandbox
// Endpoint: POST /payment/create_payment_url
router.post('/create_payment_url', PaymentController.createPaymentUrl);

// 2. [NGHIỆP VỤ THANH TOÁN VNPAY]: Tiếp nhận kết quả thanh toán khi khách chuyển hướng về web
// Endpoint: GET /payment/vnpay_return
router.get('/vnpay_return', PaymentController.vnpayReturn);

// 3. [NGHIỆP VỤ THANH TOÁN VNPAY]: Webhook IPN xử lý ngầm máy chủ VNPAY gọi sang
// Endpoint: GET /payment/vnpay_ipn
router.get('/vnpay_ipn', PaymentController.vnpayIpn);

// 4. [NGHIỆP VỤ THANH TOÁN VIETQR / SEPAY]: Webhook nhận thông báo biến động số dư ngân hàng
// Endpoint: POST /payment/sepay_webhook hoặc POST /payment/webhook
router.post('/sepay_webhook', PaymentController.sepayWebhook);
router.post('/webhook', PaymentController.sepayWebhook);

module.exports = router;
