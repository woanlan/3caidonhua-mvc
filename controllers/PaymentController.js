const crypto = require('crypto');
const querystring = require('qs');
const vnpayConfig = require('../config/vnpay');
const billModel = require('../models/bill');

// Hàm sắp xếp tham số theo alphabet đúng chuẩn VNPAY
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// Format ngày giờ YYYYMMDDHHmmss theo giờ Việt Nam
function formatDate(date) {
    const d = new Date(date);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return (
        d.getFullYear().toString() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds())
    );
}

const PaymentController = {
    // 1. Tạo URL thanh toán chuyển hướng sang VNPAY
    createPaymentUrl: async (req, res) => {
        try {
            let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection?.remoteAddress ||
                req.socket?.remoteAddress ||
                req.connection?.socket?.remoteAddress ||
                '127.0.0.1';

            if (ipAddr.includes('::1') || ipAddr.includes('127.0.0.1')) {
                ipAddr = '127.0.0.1';
            }

            const { orderId, amount, bankCode, orderInfo } = req.body;

            if (!orderId || !amount) {
                return res.status(400).json({ status: 0, message: 'Thiếu thông tin orderId hoặc số tiền amount.' });
            }

            const tmnCode = vnpayConfig.vnp_TmnCode;
            const secretKey = vnpayConfig.vnp_HashSecret;
            let vnpUrl = vnpayConfig.vnp_Url;
            const returnUrl = vnpayConfig.vnp_ReturnUrl;

            const date = new Date();
            const createDate = formatDate(date);

            // VNPAY quy định số tiền phải nhân với 100 (để khử số thập phân)
            const vnpAmount = Math.round(Number(amount) * 100);

            // Thông tin mô tả không dấu theo chuẩn VNPAY
            const cleanOrderInfo = (orderInfo || `Thanh toan don hang ${orderId}`)
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9 ]/g, ' ')
                .trim();

            let vnp_Params = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId.toString(),
                vnp_OrderInfo: cleanOrderInfo,
                vnp_OrderType: 'other',
                vnp_Amount: vnpAmount,
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate
            };

            if (bankCode && bankCode.trim()) {
                vnp_Params['vnp_BankCode'] = bankCode.trim();
            }

            // Sắp xếp các tham số theo bảng chữ cái A-Z
            vnp_Params = sortObject(vnp_Params);

            // Tạo chuỗi ký tự hash
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac('sha512', secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

            return res.status(200).json({
                status: 1,
                message: 'Tạo URL thanh toán VNPAY thành công',
                paymentUrl: vnpUrl
            });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    },

    // 2. Tiếp nhận kết quả thanh toán từ VNPAY chuyển hướng về (vnp_ReturnUrl)
    vnpayReturn: async (req, res) => {
        try {
            let vnp_Params = { ...req.query };
            const secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);

            const secretKey = vnpayConfig.vnp_HashSecret;
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac('sha512', secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const amount = Number(vnp_Params['vnp_Amount']) / 100;
            const transactionNo = vnp_Params['vnp_TransactionNo'];
            const bankCode = vnp_Params['vnp_BankCode'];

            let isSuccess = false;
            let message = '';

            // Kiểm tra chữ ký hợp lệ
            if (secureHash === signed) {
                if (responseCode === '00') {
                    isSuccess = true;
                    message = 'Giao dịch thanh toán VNPAY thành công!';

                    // Cập nhật trạng thái đơn hàng trong Database
                    try {
                        const bill = await billModel.findById(orderId);
                        if (bill) {
                            bill.paymentStatus = 'paid';
                            bill.status = (bill.status === 'pending') ? 'confirmed' : bill.status;
                            bill.amountPaid = amount;
                            bill.paymentMethod = 'VNPAY';
                            bill.statusHistory.push({
                                fromStatus: 'pending',
                                toStatus: bill.status,
                                action: 'Thanh toán trực tuyến VNPAY thành công',
                                actor: 'VNPAY Gateway',
                                note: `Mã giao dịch VNPAY: ${transactionNo} | Ngân hàng: ${bankCode}`,
                                timestamp: new Date()
                            });
                            await bill.save();
                        }
                    } catch (dbErr) {
                        console.error('Lỗi cập nhật đơn hàng sau thanh toán VNPAY:', dbErr);
                    }
                } else if (responseCode === '24') {
                    message = 'Khách hàng đã hủy giao dịch thanh toán.';
                } else {
                    message = `Giao dịch không thành công (Mã lỗi: ${responseCode}).`;
                }
            } else {
                message = 'Chữ ký không hợp lệ (Dữ liệu giao dịch có thể bị can thiệp).';
            }

            // Trả về trang thông báo kết quả giao diện đẹp
            const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kết quả thanh toán VNPAY - 3 Cây Đòn Hứa</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px 28px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .icon { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 20px; }
        .success { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 2px solid #10b981; }
        .fail { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 2px solid #ef4444; }
        h1 { font-size: 22px; margin-bottom: 10px; font-weight: 800; }
        p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.6; }
        .details { background: #0b1120; border-radius: 10px; padding: 16px; text-align: left; font-size: 13.5px; margin-bottom: 24px; line-height: 1.8; border: 1px solid #1e293b; }
        .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .label { color: #64748b; }
        .val { color: #f1f5f9; font-weight: 600; }
        .btn { display: block; width: 100%; padding: 14px; background: #e60012; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; transition: 0.2s; border: none; cursor: pointer; }
        .btn:hover { background: #cc0010; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon ${isSuccess ? 'success' : 'fail'}">${isSuccess ? '✓' : '✖'}</div>
        <h1 style="color: ${isSuccess ? '#10b981' : '#ef4444'}">${isSuccess ? 'THANH TOÁN THÀNH CÔNG!' : 'THANH TOÁN THẤT BẠI'}</h1>
        <p>${message}</p>
        
        <div class="details">
            <div class="row"><span class="label">Mã đơn hàng:</span><span class="val">#${orderId ? orderId.toString().slice(-6).toUpperCase() : 'N/A'}</span></div>
            <div class="row"><span class="label">Số tiền:</span><span class="val" style="color:#e60012;">${amount ? amount.toLocaleString('vi-VN') + ' đ' : '0 đ'}</span></div>
            <div class="row"><span class="label">Ngân hàng:</span><span class="val">${bankCode || 'VNPAY'}</span></div>
            <div class="row"><span class="label">Mã giao dịch VNPAY:</span><span class="val">${transactionNo || 'N/A'}</span></div>
            <div class="row"><span class="label">Cổng thanh toán:</span><span class="val">VNPAY Sandbox (NCB)</span></div>
        </div>

        <a href="/#account" class="btn">Quay lại quản lý đơn hàng →</a>
    </div>
</body>
</html>
            `;

            return res.send(html);
        } catch (err) {
            return res.status(500).send('Lỗi máy chủ khi xử lý phản hồi VNPAY: ' + err.message);
        }
    },

    // 3. Webhook IPN xử lý ngầm (Server call Server)
    vnpayIpn: async (req, res) => {
        try {
            let vnp_Params = { ...req.query };
            const secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);

            const secretKey = vnpayConfig.vnp_HashSecret;
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac('sha512', secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            if (secureHash !== signed) {
                return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
            }

            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const amount = Number(vnp_Params['vnp_Amount']) / 100;

            const bill = await billModel.findById(orderId);
            if (!bill) {
                return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }

            if (bill.amountPaid >= bill.totalMoney && bill.paymentStatus === 'paid') {
                return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
            }

            if (responseCode === '00') {
                bill.paymentStatus = 'paid';
                bill.status = (bill.status === 'pending') ? 'confirmed' : bill.status;
                bill.amountPaid = amount;
                await bill.save();
                return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
            } else {
                return res.status(200).json({ RspCode: '00', Message: 'Confirm Success (Payment not 00)' });
            }
        } catch (err) {
            return res.status(200).json({ RspCode: '99', Message: 'Unknown error: ' + err.message });
        }
    },

    // 4. Webhook tiếp nhận biến động số dư SePay / Open Banking (POST /payment/sepay_webhook)
    sepayWebhook: async (req, res) => {
        try {
            // SePay gửi webhook dạng JSON khi tài khoản Techcombank có biến động số dư
            const {
                gateway,
                accountNumber,
                transferType,
                transferAmount,
                content,
                referenceCode,
                orderCode,
                orderId
            } = req.body;

            // Bỏ qua nếu là giao dịch trừ tiền (tiền ra khỏi tài khoản)
            if (transferType && transferType !== 'in') {
                return res.status(200).json({ success: true, message: 'Bỏ qua biến động tiền ra (transferType != in)' });
            }

            const searchStr = `${content || ''} ${referenceCode || ''} ${orderCode || ''}`.toUpperCase();

            // Tìm đơn hàng theo mã đơn dạng HDXXXXXX hoặc theo ID
            let bill = null;
            const matchHD = searchStr.match(/HD([A-Z0-9]{6})/i);
            if (matchHD) {
                const codeSuffix = matchHD[1].toUpperCase();
                const allBills = await billModel.find().sort({ createdAt: -1 });
                bill = allBills.find(b => b._id.toString().slice(-6).toUpperCase() === codeSuffix);
            }

            if (!bill && (orderId || req.body.id)) {
                try {
                    bill = await billModel.findById(orderId || req.body.id);
                } catch (_) {}
            }

            if (!bill) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy đơn hàng khớp với nội dung chuyển khoản "${content || ''}"`
                });
            }

            const paidAmount = Number(transferAmount) || Number(req.body.amount) || bill.totalMoney || 0;
            const oldStatus = bill.status;

            // Tự động cập nhật thanh toán và chuyển trạng thái sang "Đang chuẩn bị hàng" (processing)
            bill.paymentStatus = 'paid';
            bill.amountPaid = paidAmount;
            bill.status = 'processing';

            // Ghi nhận lịch sử luồng trạng thái
            bill.statusHistory.push({
                fromStatus: oldStatus,
                toStatus: 'processing',
                action: 'SePay Webhook: Xác nhận thanh toán & Tự động lên đơn chuẩn bị hàng',
                actor: `Hệ thống SePay (${gateway || 'Techcombank'} - ${accountNumber || '8888868650'})`,
                note: `Đã nhận ${paidAmount.toLocaleString('vi-VN')}đ. Nội dung: "${content || ''}". Tự động kích hoạt quy trình đóng gói & giao hàng GHN.`,
                timestamp: new Date()
            });

            await bill.save();

            return res.status(200).json({
                success: true,
                message: 'Đã xử lý Webhook thành công! Đơn hàng đã chuyển sang khâu "Đang chuẩn bị hàng".',
                orderCode: 'HD' + bill._id.toString().slice(-6).toUpperCase(),
                billId: bill._id.toString(),
                status: bill.status,
                paymentStatus: bill.paymentStatus,
                amountPaid: bill.amountPaid
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = PaymentController;
