// ====================================================================================
// [NGHIỆP VỤ BẢO MẬT & XÁC THỰC JWT] - authen.js
// Middleware kiểm tra Bearer Access Token trong request header
// Chuẩn bảo mật RESTful API môn Node.js
// ====================================================================================

const jwt = require('jsonwebtoken');

/**
 * [NGHIỆP VỤ XÁC THỰC JWT] - Middleware chặn và giải mã Token
 * Header yêu cầu: Authorization: Bearer <token>
 *  - Nếu hợp lệ: Gán thông tin user vào `req.user` và cho phép gọi tiếp controller
 *  - Nếu thiếu hoặc hết hạn: Trả về HTTP 401 Unauthorized
 */
const authen = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const data = jwt.verify(token, process.env.JWT_SECRET || 'shhhhh');
            req.user = data.user;
            next();
        } else {
            return res.status(401).json({ status: 0, error: 'Không tìm thấy authorization token (Bearer token)' });
        }
    } catch (error) {
        return res.status(401).json({ status: 0, error: error.message || 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

module.exports = authen;
