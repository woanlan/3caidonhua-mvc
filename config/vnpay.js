/**
 * Cấu hình Cổng thanh toán VNPAY Sandbox
 * Thông tin Merchant test được VNPAY cấp chính thức cho: cuckydangiu111@gmail.com
 */
module.exports = {
    vnp_TmnCode: process.env.VNP_TMN_CODE || 'E8A17P1W',
    vnp_HashSecret: process.env.VNP_HASH_SECRET || 'ERCMXDKYJKEIFVJZUMHNTRXHUBWINNFA',
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_Api: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    vnp_ReturnUrl: 'http://localhost:3000/api/payment/vnpay_return'
};
