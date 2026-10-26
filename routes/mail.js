// ====================================================================================
// [NGHIỆP VỤ GỬI EMAIL / NODEMAILER] - mail.js
// Xử lý gửi email xác nhận đặt hàng, thông báo qua giao thức SMTP Gmail
// ====================================================================================

const express = require('express');
const router = express.Router();
const sendMail = require('../utils/sendMail');

/**
 * [NGHIỆP VỤ GỬI EMAIL] - Gửi email thông báo / hóa đơn đơn hàng
 * Endpoint: POST /send-mail hoặc POST /api/send-mail
 * Body: { to, subject, content }
 */
router.post("/send-mail", async function (req, res, next) {
    try {
        const { to, subject, content } = req.body;
        if (!to) {
            return res.status(400).json({ status: 0, message: "Vui lòng nhập địa chỉ email người nhận (to)." });
        }

        const mailOptions = {
            from: "3caidonhua Gunpla Studio <" + (process.env.MAIL_USER || "gunpla.studio.vn@gmail.com") + ">",
            to: to,
            subject: subject || "Thông báo từ 3caidonhua Studio",
            html: content || "<p>Cảm ơn bạn đã ghé thăm 3caidonhua Studio!</p>"
        };

        // Nếu đã cấu hình mật khẩu ứng dụng Gmail thực tế trong môi trường
        if (process.env.MAIL_USER && process.env.MAIL_PASS && process.env.MAIL_PASS !== 'your_app_password_here') {
            await sendMail.transporter.sendMail(mailOptions);
            return res.json({ status: 1, message: "Gửi mail thành công" });
        } else {
            // Môi trường dev / test mẫu: ghi nhận thành công và log ra console
            console.log(`[MAIL SIMULATION] To: ${to} | Subject: ${mailOptions.subject}`);
            return res.json({
                status: 1,
                message: "Gửi mail thành công (Chế độ mô phỏng / Cần cấu hình MAIL_USER & MAIL_PASS để gửi thật)",
                data: { to, subject: mailOptions.subject }
            });
        }
    } catch (err) {
        console.error('Lỗi gửi mail:', err);
        return res.json({ status: 0, message: "Gửi mail thất bại: " + err.message });
    }
});

module.exports = router;
