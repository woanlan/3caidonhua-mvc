var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController');
var authen = require('../middleware/authen');

/**
 * Routes Quản lý Người dùng & Xác thực (Users & Auth)
 * Chuẩn MVC: Route chuyển tiếp request trực tiếp cho UserController
 */

// 1. Danh sách người dùng (GET /users hoặc GET /api/users)
router.get('/', UserController.getAll);

// 2. Thông tin tài khoản đang đăng nhập (GET /users/me, GET /auth/me)
router.get('/me', UserController.getMe);
router.put('/me', UserController.updateMe);
router.patch('/me', UserController.updateMe);

// Route kiểm tra xác thực JWT bằng Header Authorization (Bearer Token) theo chuẩn bài giảng
router.get('/profile-jwt', authen, (req, res) => {
    res.status(200).json({ status: 1, message: 'Xác thực JWT thành công!', user: req.user });
});

// 3. Đăng ký, Đăng nhập, Đăng xuất, Refresh Token
router.post('/register', UserController.create);
router.post('/login', UserController.login);
router.post('/refresh-token', UserController.refreshToken);
router.post('/logout', UserController.logout);

// 4. Chi tiết người dùng theo ID (GET /users/:id)
router.get('/:id', UserController.getById);

// 5. Cập nhật thông tin người dùng theo ID (PUT /users/:id)
router.put('/:id', UserController.update);

// 6. Khóa / Mở khóa tài khoản (PATCH /users/:id/toggle-status)
router.patch('/:id/toggle-status', UserController.toggleStatus);

// 7. Thay đổi vai trò người dùng (PATCH /users/:id/role)
router.patch('/:id/role', UserController.changeRole);

// 8. Xóa tài khoản (DELETE /users/:id)
router.delete('/:id', UserController.remove);

module.exports = router;
