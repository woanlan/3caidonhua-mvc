// ====================================================================================
// [NGHIỆP VỤ XÁC THỰC & NGƯỜI DÙNG] - UserController.js
// Quản lý: Đăng ký (Mã hóa Bcrypt) -> Đăng nhập (Cấp JWT Access / Refresh Token) 
// -> Phân quyền vai trò (User/Staff/Admin) -> Khóa / Mở khóa tài khoản
// ====================================================================================

const userModel = require('../models/user');
const billModel = require('../models/bill');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * [NGHIỆP VỤ XÁC THỰC] - Helper lấy ID người dùng từ Cookie, Header x-user-id hoặc Bearer Token JWT
 * @param {Request} req 
 * @returns {string|null} userId nếu đã xác thực
 */
function getAuthUserId(req) {
    if (req.cookies?.userId) return req.cookies.userId;
    if (req.headers['x-user-id']) return req.headers['x-user-id'];
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const data = jwt.verify(token, process.env.JWT_SECRET || 'shhhhh');
            if (data && data.user) return data.user._id || data.user.id;
        } catch (_) {}
    }
    return null;
}

const UserController = {
    /**
     * [NGHIỆP VỤ NGƯỜI DÙNG] - 1. Lấy danh sách tất cả người dùng (ẩn mật khẩu)
     * Kèm theo thống kê số đơn hàng đã đặt và tổng chi tiêu tích lũy
     * Endpoint: GET /users hoặc GET /api/users
     */
    getAll: async (req, res) => {
        try {
            const rawUsers = await userModel.find().sort({ createdAt: -1 });
            const result = [];

            for (const u of rawUsers) {
                const userOrders = await billModel.find({ user: u._id });
                const completedOrders = userOrders.filter(b => b.status === 'completed');
                const totalSpent = completedOrders.reduce((sum, b) => sum + (b.totalMoney || 0), 0);

                result.push({
                    id: u._id.toString(),
                    _id: u._id.toString(),
                    name: u.name,
                    email: u.email,
                    role: u.role || 'user',
                    status: u.status || 'active',
                    phone: u.phone || '',
                    address: u.address || '',
                    createdAt: u.createdAt,
                    orderCount: userOrders.length,
                    totalSpent: totalSpent
                });
            }

            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ NGƯỜI DÙNG] - 2. Lấy thông tin chi tiết một người dùng theo ID
     * Endpoint: GET /users/:id hoặc GET /api/users/:id
     */
    getById: async (req, res) => {
        try {
            const u = await userModel.findById(req.params.id).select('-password');
            if (!u) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

            const userOrders = await billModel.find({ user: u._id }).sort({ createdAt: -1 });
            const completedOrders = userOrders.filter(b => b.status === 'completed');
            const totalSpent = completedOrders.reduce((sum, b) => sum + (b.totalMoney || 0), 0);

            return res.status(200).json({
                id: u._id.toString(),
                _id: u._id.toString(),
                name: u.name,
                email: u.email,
                role: u.role || 'user',
                status: u.status || 'active',
                phone: u.phone || '',
                address: u.address || '',
                createdAt: u.createdAt,
                orderCount: userOrders.length,
                totalSpent,
                orders: userOrders.map(b => ({
                    id: b._id.toString(),
                    code: 'HD' + b._id.toString().slice(-6).toUpperCase(),
                    total: b.totalMoney,
                    status: b.status,
                    createdAt: b.createdAt
                }))
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ XÁC THỰC] - 3. Lấy thông tin tài khoản hiện tại đang đăng nhập
     * Endpoint: GET /users/me hoặc GET /api/users/me
     */
    getMe: async (req, res) => {
        try {
            const userId = getAuthUserId(req);
            if (!userId) {
                return res.status(401).json({ error: 'Chưa đăng nhập' });
            }
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(401).json({ error: 'Tài khoản không tồn tại' });
            }
            if (user.status === 'locked') {
                return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
            }
            return res.status(200).json({
                status: 1,
                id: user._id.toString(),
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                status: user.status || 'active',
                phone: user.phone || '',
                address: user.address || ''
            });
        } catch (err) {
            return res.status(401).json({ error: 'Chưa đăng nhập' });
        }
    },

    /**
     * [NGHIỆP VỤ NGƯỜI DÙNG] - 4. Cập nhật hồ sơ cá nhân (Họ tên, SĐT, Địa chỉ)
     * Endpoint: PUT /users/me hoặc PUT /api/users/me
     */
    updateMe: async (req, res) => {
        try {
            const userId = getAuthUserId(req);
            if (!userId) return res.status(401).json({ error: 'Chưa đăng nhập' });

            const { name, phone, address } = req.body;
            const updated = await userModel.findByIdAndUpdate(userId, { name, phone, address }, { new: true });
            return res.status(200).json({
                status: 1,
                message: 'Cập nhật thông tin thành công',
                id: updated._id.toString(),
                _id: updated._id.toString(),
                name: updated.name,
                email: updated.email,
                role: updated.role,
                status: updated.status,
                phone: updated.phone,
                address: updated.address
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ ĐĂNG KÝ TÀI KHOẢN] - 5. Đăng ký tài khoản mới (Mã hóa Bcrypt Hash)
     * Endpoint: POST /auth/register hoặc POST /api/auth/register hoặc POST /users/register
     * Nghiệp vụ:
     *  - Kiểm tra email hợp lệ, kiểm tra trùng lặp email
     *  - Kiểm tra mật khẩu khớp với confirm_password
     *  - Mã hóa mật khẩu an toàn với bcrypt salt 10 rounds
     *  - Tạo document trong MongoDB với role mặc định là 'user'
     */
    create: async (req, res) => {
        try {
            const { name, email, password, confirm_password, phone, address, role } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: 0, message: 'Vui lòng điền đầy đủ email và mật khẩu.' });
            }
            if (confirm_password && password !== confirm_password) {
                return res.status(400).json({ status: 0, message: 'Mật khẩu xác nhận không khớp.' });
            }
            const existing = await userModel.findOne({ email: email.trim().toLowerCase() });
            if (existing) {
                return res.status(400).json({ status: 0, message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' });
            }

            // BƯỚC 1: MÃ HÓA MẬT KHẨU BẰNG BCRYPT
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            // BƯỚC 2: LƯU TÀI KHOẢN MỚI VÀO MONGODB
            const newUser = await userModel.create({
                name: name || 'Thành viên Gunpla',
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                phone: phone || '',
                address: address || '',
                role: role || 'user',
                status: 'active'
            });

            return res.status(201).json({
                status: 1,
                message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
                id: newUser._id.toString(),
                email: newUser.email,
                name: newUser.name,
                user: {
                    _id: newUser._id.toString(),
                    email: newUser.email,
                    name: newUser.name
                }
            });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ ĐĂNG NHẬP & CẤP TOKEN JWT] - 6. Xác thực đăng nhập
     * Endpoint: POST /auth/login hoặc POST /api/auth/login hoặc POST /users/login
     * Nghiệp vụ:
     *  - So sánh mật khẩu bằng `bcrypt.compareSync`
     *  - Kiểm tra trạng thái tài khoản (nếu status === 'locked' -> Chặn đăng nhập)
     *  - Cấp cặp Token JWT chuẩn bảo mật:
     *      * access_token: Thời hạn 1 giờ (60 phút) dùng trong header Authorization: Bearer
     *      * refresh_token: Thời hạn 90 ngày dùng để lấy access_token mới khi hết hạn
     *  - Đặt Cookie `userId` phục vụ session giỏ hàng và duyệt web
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: 0, message: 'Vui lòng nhập email và mật khẩu' });
            }

            const user = await userModel.findOne({ email: email.trim().toLowerCase() });
            if (!user) {
                return res.status(401).json({ status: 0, message: 'Email hoặc mật khẩu không chính xác' });
            }

            // SO SÁNH MẬT KHẨU BĂM BCRYPT
            const isPasswordMatch = (user.password && user.password.startsWith('$2') && bcrypt.compareSync(password, user.password)) || (user.password === password);
            if (!isPasswordMatch) {
                return res.status(401).json({ status: 0, message: 'Email hoặc mật khẩu không chính xác' });
            }

            // KIỂM TRA TÀI KHOẢN CÓ ĐANG BỊ KHÓA HAY KHÔNG
            if (user.status === 'locked') {
                return res.status(403).json({ status: 0, message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
            }

            const safeUser = {
                _id: user._id.toString(),
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                status: user.status || 'active',
                phone: user.phone || '',
                address: user.address || ''
            };

            // TẠO CẶP TOKEN JWT (ACCESS_TOKEN & REFRESH_TOKEN)
            const access_token = jwt.sign({ user: safeUser }, process.env.JWT_SECRET || 'shhhhh', { expiresIn: 60 * 60 });
            const refresh_token = jwt.sign({ user: safeUser }, process.env.JWT_SECRET || 'shhhhh', { expiresIn: 90 * 24 * 60 * 60 });

            res.cookie('userId', user._id.toString(), { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
            return res.status(200).json({
                status: 1,
                message: 'Đăng nhập thành công',
                id: user._id.toString(),
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                status: user.status || 'active',
                phone: user.phone,
                address: user.address,
                access_token,
                refresh_token,
                user: safeUser
            });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ REFRESH TOKEN JWT] - Cấp access_token mới khi token cũ hết hạn
     * Endpoint: POST /auth/refresh-token hoặc POST /api/auth/refresh-token
     */
    refreshToken: async (req, res) => {
        try {
            const { refresh_token } = req.body;
            if (!refresh_token) {
                return res.status(400).json({ status: 0, error: 'Chưa cung cấp refresh_token' });
            }
            const data = jwt.verify(refresh_token, process.env.JWT_SECRET || 'shhhhh');
            const access_token = jwt.sign({ user: data.user }, process.env.JWT_SECRET || 'shhhhh', { expiresIn: 60 * 60 });
            const new_refresh_token = jwt.sign({ user: data.user }, process.env.JWT_SECRET || 'shhhhh', { expiresIn: 90 * 24 * 60 * 60 });
            return res.status(200).json({ status: 1, user: data.user, access_token, refresh_token: new_refresh_token });
        } catch (error) {
            return res.status(401).json({ status: 0, error: error.message });
        }
    },

    /**
     * [NGHIỆP VỤ ĐĂNG XUẤT] - 7. Xóa cookie đăng nhập
     * Endpoint: POST /auth/logout hoặc POST /api/auth/logout
     */
    logout: async (req, res) => {
        try {
            res.clearCookie('userId');
            return res.status(200).json({ status: 1, message: 'Đã đăng xuất thành công' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ QUẢN TRỊ NGƯỜI DÙNG] - 8. Cập nhật thông tin người dùng theo ID (Dành cho Admin)
     * Endpoint: PUT /users/:id hoặc PUT /api/users/:id
     */
    update: async (req, res) => {
        try {
            const updated = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
            if (!updated) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return res.status(200).json(updated);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ KHÓA TÀI KHOẢN] - 9. Khóa / Mở khóa tài khoản (Active <-> Locked)
     * Endpoint: POST /users/:id/toggle-status hoặc POST /api/users/:id/toggle-status
     * Ràng buộc nghiệp vụ:
     *  - Admin không thể tự khóa tài khoản của chính mình
     *  - Không thể khóa Quản trị viên (Admin) duy nhất còn lại của hệ thống
     */
    toggleStatus: async (req, res) => {
        try {
            const targetId = req.params.id;
            const currentUserId = getAuthUserId(req);

            if (currentUserId && currentUserId.toString() === targetId.toString()) {
                return res.status(400).json({ status: 0, message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
            }

            const targetUser = await userModel.findById(targetId);
            if (!targetUser) return res.status(404).json({ status: 0, message: 'Không tìm thấy tài khoản.' });

            if (targetUser.role === 'admin' && targetUser.status === 'active') {
                const activeAdminCount = await userModel.countDocuments({ role: 'admin', status: 'active' });
                if (activeAdminCount <= 1) {
                    return res.status(400).json({ status: 0, message: 'Không thể khóa Quản trị viên (Admin) duy nhất còn lại.' });
                }
            }

            targetUser.status = (targetUser.status === 'active') ? 'locked' : 'active';
            await targetUser.save();

            return res.status(200).json({
                status: 1,
                message: `Đã ${targetUser.status === 'active' ? 'mở khóa' : 'khóa'} tài khoản [${targetUser.email}].`,
                user: {
                    id: targetUser._id.toString(),
                    name: targetUser.name,
                    email: targetUser.email,
                    role: targetUser.role,
                    status: targetUser.status
                }
            });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ PHÂN QUYỀN VAI TRÒ] - 10. Thay đổi vai trò người dùng (user, staff, admin)
     * Endpoint: POST /users/:id/change-role hoặc POST /api/users/:id/change-role
     * Ràng buộc nghiệp vụ:
     *  - Không thể hạ quyền tài khoản Admin cuối cùng của hệ thống
     */
    changeRole: async (req, res) => {
        try {
            const targetId = req.params.id;
            const { role } = req.body;
            if (!['user', 'staff', 'admin'].includes(role)) {
                return res.status(400).json({ status: 0, message: 'Vai trò không hợp lệ.' });
            }

            const targetUser = await userModel.findById(targetId);
            if (!targetUser) return res.status(404).json({ status: 0, message: 'Không tìm thấy tài khoản.' });

            if (targetUser.role === 'admin' && role !== 'admin') {
                const adminCount = await userModel.countDocuments({ role: 'admin' });
                if (adminCount <= 1) {
                    return res.status(400).json({ status: 0, message: 'Không thể hạ quyền Quản trị viên (Admin) cuối cùng của hệ thống.' });
                }
            }

            targetUser.role = role;
            await targetUser.save();

            return res.status(200).json({
                status: 1,
                message: `Đã cập nhật vai trò tài khoản [${targetUser.email}] sang "${role}".`,
                user: {
                    id: targetUser._id.toString(),
                    name: targetUser.name,
                    email: targetUser.email,
                    role: targetUser.role,
                    status: targetUser.status
                }
            });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ XÓA TÀI KHOẢN AN TOÀN] - 11. Xóa người dùng
     * Endpoint: DELETE /users/:id hoặc DELETE /api/users/:id
     * Ràng buộc nghiệp vụ:
     *  - Không thể tự xóa tài khoản của chính mình
     *  - Không thể xóa Admin duy nhất còn lại
     *  - Nếu tài khoản đã từng mua hàng (phát sinh hóa đơn) -> Chuyển sang trạng thái "Khóa" để bảo toàn lịch sử bán hàng
     */
    remove: async (req, res) => {
        try {
            const targetId = req.params.id;
            const currentUserId = getAuthUserId(req);

            if (currentUserId && currentUserId.toString() === targetId.toString()) {
                return res.status(400).json({ status: 0, message: 'Bạn không thể tự xóa tài khoản của chính mình.' });
            }

            const targetUser = await userModel.findById(targetId);
            if (!targetUser) return res.status(404).json({ status: 0, message: 'Không tìm thấy tài khoản.' });

            if (targetUser.role === 'admin') {
                const adminCount = await userModel.countDocuments({ role: 'admin' });
                if (adminCount <= 1) {
                    return res.status(400).json({ status: 0, message: 'Không thể xóa Quản trị viên (Admin) cuối cùng.' });
                }
            }

            const orderCount = await billModel.countDocuments({ user: targetId });
            if (orderCount > 0) {
                targetUser.status = 'locked';
                await targetUser.save();
                return res.status(200).json({
                    status: 1,
                    message: `Tài khoản này có ${orderCount} đơn hàng nên đã được chuyển sang trạng thái "Khóa" để bảo toàn dữ liệu.`
                });
            }

            const deleted = await userModel.findByIdAndDelete(targetId);
            return res.status(200).json({ status: 1, message: 'Đã xóa tài khoản thành công.', deleted });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    }
};

module.exports = UserController;
