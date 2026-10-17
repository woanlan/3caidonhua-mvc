const nodemailer = require("nodemailer");

/**
 * Cấu hình Nodemailer Transporter
 * Theo đúng chuẩn tài liệu bài giảng Google Doc môn WEB503 (Bước 2)
 */
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER || 'gunpla.studio.vn@gmail.com',
        pass: process.env.MAIL_PASS || 'your_app_password_here'
    }
});

module.exports = { transporter };
