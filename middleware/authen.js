const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực token JWT
 * Theo đúng chuẩn tài liệu bài giảng Google Doc môn WEB503 (Bước 2)
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
