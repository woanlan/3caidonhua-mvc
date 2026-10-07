const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

/**
 * Routes Cổng thanh toán VNPAY Sandbox
 */

// 1. Tạo URL chuyển hướng sang cổng thanh toán VNPAY (POST /payment/create_payment_url)
router.post('/create_payment_url', PaymentController.createPaymentUrl);

// 2. Tiếp nhận kết quả thanh toán khi khách hàng quay lại (GET /payment/vnpay_return)
router.get('/vnpay_return', PaymentController.vnpayReturn);

// 3. Webhook IPN xử lý ngầm giữa VNPAY và Server (GET /payment/vnpay_ipn)
router.get('/vnpay_ipn', PaymentController.vnpayIpn);

// 4. Webhook SePay / Open Banking tiếp nhận biến động số dư Techcombank/MoMo (POST /payment/sepay_webhook)
router.post('/sepay_webhook', PaymentController.sepayWebhook);
router.post('/webhook', PaymentController.sepayWebhook);

module.exports = router;
