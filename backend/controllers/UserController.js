// ====================================================================================
// [NGHIỆP VỤ XÁC THỰC & NGƯỜI DÙNG] - UserController.js
// Quản lý: Đăng ký (Mã hóa Bcrypt) -> Đăng nhập (Cấp JWT Access / Refresh Token) 
// -> Phân quyền vai trò (User/Staff/Admin) -> Khóa / Mở khóa tài khoản
// ====================================================================================

const mongoose = require('mongoose');
const userModel = require('../models/user');
const billModel = require('../models/bill');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    getFallbackUsers,
    findFallbackUserByEmail,
    findFallbackUserById,
    addFallbackUser,
    getFallbackBills
} = require('../utils/fallbackStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * [NGHIỆP VỤ XÁC THỰC] - Helper giải mã người dùng từ Bearer Token JWT hoặc Cookie
 */
function getAuthTokenUser(req) {
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const data = jwt.verify(token, process.env.JWT_SECRET || 'shhhhh');
            if (data && data.user) return data.user;
        } catch (_) {}
    }
    return null;
}

/**
 * [NGHIỆP VỤ XÁC THỰC] - Helper lấy ID người dùng từ Cookie, Header x-user-id hoặc Bearer Token JWT
 * @param {Request} req 
 * @returns {string|null} userId nếu đã xác thực
 */
function getAuthUserId(req) {
    if (req.cookies?.userId) return req.cookies.userId;
    if (req.headers['x-user-id']) return req.headers['x-user-id'];
    const tokenUser = getAuthTokenUser(req);
    if (tokenUser) return tokenUser._id || tokenUser.id;
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
            if (!isDbConnected()) {
                const users = getFallbackUsers();
                const bills = getFallbackBills();
                const result = users.map(u => {
                    const userOrders = bills.filter(b => b.userId === u.id || b.recipient === u.name);
                    const completedOrders = userOrders.filter(b => b.status === 'completed');
                    const totalSpent = completedOrders.reduce((sum, b) => sum + (b.totalMoney || b.total || 0), 0);
                    return {
                        id: String(u._id || u.id),
                        _id: String(u._id || u.id),
                        name: u.name,
                        email: u.email,
                        role: u.role || 'user',
                        status: u.status || 'active',
                        phone: u.phone || '',
                        address: u.address || '',
                        createdAt: u.createdAt,
                        orderCount: userOrders.length,
                        totalSpent
                    };
                });
                return res.status(200).json(result);
            }

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
            if (!isDbConnected()) {
                const u = findFallbackUserById(req.params.id);
                if (!u) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
                const userOrders = getFallbackBills().filter(b => b.userId === u.id);
                const completedOrders = userOrders.filter(b => b.status === 'completed');
                const totalSpent = completedOrders.reduce((sum, b) => sum + (b.totalMoney || b.total || 0), 0);
                return res.status(200).json({
                    id: String(u._id || u.id),
                    _id: String(u._id || u.id),
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
                        id: b.id,
                        code: b.code,
                        total: b.totalMoney || b.total,
                        status: b.status,
                        createdAt: b.createdAt
                    }))
                });
            }

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
     * Endpoint: GET /users/me hoặc GET /api/users/me hoặc GET /api/auth/me
     */
    getMe: async (req, res) => {
        try {
            const userId = getAuthUserId(req);
            const tokenUser = getAuthTokenUser(req);
            if (!userId && !tokenUser) {
                return res.status(401).json({ error: 'Chưa đăng nhập' });
            }

            let user = null;
            if (isDbConnected() && userId && /^[0-9a-fA-F]{24}$/.test(String(userId))) {
                try {
                    user = await userModel.findById(userId);
                } catch (_) {}
            }
            if (!user && userId) {
                user = findFallbackUserById(userId);
            }
            if (!user && tokenUser?.email) {
                if (isDbConnected()) {
                    try {
                        user = await userModel.findOne({ email: tokenUser.email.toLowerCase() });
                    } catch (_) {}
                }
                if (!user) {
                    user = findFallbackUserByEmail(tokenUser.email) || tokenUser;
                }
            }

            if (!user) {
                return res.status(401).json({ error: 'Tài khoản không tồn tại' });
            }
            if (user.status === 'locked') {
                return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
            }
            const uid = (user._id || user.id).toString();
            return res.status(200).json({
                status: 1,
                id: uid,
                _id: uid,
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
            const tokenUser = getAuthTokenUser(req);
            if (!userId && !tokenUser) return res.status(401).json({ error: 'Chưa đăng nhập' });

            const { name, phone, address } = req.body;
            let updated = null;

            if (isDbConnected() && userId && /^[0-9a-fA-F]{24}$/.test(String(userId))) {
                updated = await userModel.findByIdAndUpdate(userId, { name, phone, address }, { new: true });
            }

            if (!updated) {
                const fbUser = findFallbackUserById(userId) || (tokenUser?.email ? findFallbackUserByEmail(tokenUser.email) : null);
                if (fbUser) {
                    if (name !== undefined) fbUser.name = name;
                    if (phone !== undefined) fbUser.phone = phone;
                    if (address !== undefined) fbUser.address = address;
                    updated = fbUser;
                } else if (tokenUser) {
                    updated = addFallbackUser({ ...tokenUser, name: name || tokenUser.name, phone: phone || tokenUser.phone, address: address || tokenUser.address });
                }
            }

            if (!updated) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

            const uid = (updated._id || updated.id).toString();
            return res.status(200).json({
                status: 1,
                message: 'Cập nhật thông tin thành công',
                id: uid,
                _id: uid,
                name: updated.name,
                email: updated.email,
                role: updated.role || 'user',
                status: updated.status || 'active',
                phone: updated.phone || '',
                address: updated.address || ''
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ ĐĂNG KÝ TÀI KHOẢN] - 5. Đăng ký tài khoản mới (Mã hóa Bcrypt Hash)
     * Endpoint: POST /auth/register hoặc POST /api/auth/register hoặc POST /users/register
     */
    create: async (req, res) => {
        try {
            const { name, email, password, confirm_password, confirmPassword, phone, address, role } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: 0, message: 'Vui lòng điền đầy đủ email và mật khẩu.' });
            }
            const confirmPw = confirmPassword !== undefined ? confirmPassword : confirm_password;
            if (confirmPw && password !== confirmPw) {
                return res.status(400).json({ status: 0, message: 'Mật khẩu xác nhận không khớp.' });
            }

            const cleanEmail = email.trim().toLowerCase();

            // Kiểm tra trùng email trên cả MongoDB (nếu đang kết nối) và Fallback Store
            let existing = findFallbackUserByEmail(cleanEmail);
            if (!existing && isDbConnected()) {
                existing = await userModel.findOne({ email: cleanEmail });
            }
            if (existing) {
                return res.status(400).json({ status: 0, message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' });
            }

            // BƯỚC 1: MÃ HÓA MẬT KHẨU BẰNG BCRYPT
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            let createdUser = null;
            if (isDbConnected()) {
                // BƯỚC 2A: LƯU TÀI KHOẢN MỚI VÀO MONGODB
                const newUser = await userModel.create({
                    name: name || 'Thành viên Gunpla',
                    email: cleanEmail,
                    password: hashedPassword,
                    phone: phone || '',
                    address: address || '',
                    role: role || 'user',
                    status: 'active'
                });
                createdUser = {
                    _id: newUser._id.toString(),
                    id: newUser._id.toString(),
                    name: newUser.name,
                    email: newUser.email,
                    password: hashedPassword,
                    plainPassword: password,
                    phone: newUser.phone || '',
                    address: newUser.address || '',
                    role: newUser.role || 'user',
                    status: 'active',
                    createdAt: newUser.createdAt
                };
                addFallbackUser(createdUser);
            } else {
                // BƯỚC 2B: LƯU TÀI KHOẢN MỚI VÀO BỘ NHỚ FALLBACK (TRÊN RENDER KHI KHÔNG CÓ MONGODB LOCAL)
                createdUser = addFallbackUser({
                    name: name || 'Thành viên Gunpla',
                    email: cleanEmail,
                    password: hashedPassword,
                    plainPassword: password,
                    phone: phone || '',
                    address: address || '',
                    role: role || 'user',
                    status: 'active'
                });
            }

            return res.status(201).json({
                status: 1,
                message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
                id: createdUser.id,
                _id: createdUser._id,
                email: createdUser.email,
                name: createdUser.name,
                user: {
                    _id: createdUser._id,
                    id: createdUser.id,
                    email: createdUser.email,
                    name: createdUser.name
                }
            });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ ĐĂNG NHẬP & CẤP TOKEN JWT] - 6. Xác thực đăng nhập
     * Endpoint: POST /auth/login hoặc POST /api/auth/login hoặc POST /users/login
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: 0, message: 'Vui lòng nhập email và mật khẩu' });
            }

            const cleanEmail = email.trim().toLowerCase();
            let user = null;

            if (isDbConnected()) {
                user = await userModel.findOne({ email: cleanEmail });
            }
            if (!user) {
                user = findFallbackUserByEmail(cleanEmail);
            }

            if (!user) {
                return res.status(401).json({ status: 0, message: 'Email hoặc mật khẩu không chính xác' });
            }

            // SO SÁNH MẬT KHẨU BĂM BCRYPT HOẶC PLAIN PASSWORD
            const isPasswordMatch =
                (user.password && user.password.startsWith('$2') && bcrypt.compareSync(password, user.password)) ||
                (user.password === password) ||
                (user.plainPassword && user.plainPassword === password);

            if (!isPasswordMatch) {
                return res.status(401).json({ status: 0, message: 'Email hoặc mật khẩu không chính xác' });
            }

            // KIỂM TRA TÀI KHOẢN CÓ ĐANG BỊ KHÓA HAY KHÔNG
            if (user.status === 'locked') {
                return res.status(403).json({ status: 0, message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
            }

            const uid = (user._id || user.id).toString();
            const safeUser = {
                _id: uid,
                id: uid,
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

            res.cookie('userId', uid, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
            return res.status(200).json({
                status: 1,
                message: 'Đăng nhập thành công',
                id: uid,
                _id: uid,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                status: user.status || 'active',
                phone: user.phone || '',
                address: user.address || '',
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
            if (!isDbConnected()) {
                const u = findFallbackUserById(req.params.id);
                if (!u) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
                Object.assign(u, req.body);
                return res.status(200).json(u);
            }
            const updated = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
            if (!updated) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return res.status(200).json(updated);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    /**
     * [NGHIỆP VỤ KHÓA TÀI KHOẢN] - 9. Khóa / Mở khóa tài khoản (Active <-> Locked)
     * Endpoint: POST /users/:id/toggle-status hoặc PATCH /api/users/:id/toggle-status
     */
    toggleStatus: async (req, res) => {
        try {
            const targetId = req.params.id;
            const currentUserId = getAuthUserId(req);

            if (currentUserId && currentUserId.toString() === targetId.toString()) {
                return res.status(400).json({ status: 0, message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
            }

            if (!isDbConnected()) {
                const targetUser = findFallbackUserById(targetId);
                if (!targetUser) return res.status(404).json({ status: 0, message: 'Không tìm thấy tài khoản.' });
                if (targetUser.role === 'admin' && targetUser.status === 'active') {
                    const activeAdminCount = getFallbackUsers().filter(u => u.role === 'admin' && u.status === 'active').length;
                    if (activeAdminCount <= 1) {
                        return res.status(400).json({ status: 0, message: 'Không thể khóa Quản trị viên (Admin) duy nhất còn lại.' });
                    }
                }
                targetUser.status = (targetUser.status === 'active') ? 'locked' : 'active';
                return res.status(200).json({
                    status: 1,
                    message: `Đã ${targetUser.status === 'active' ? 'mở khóa' : 'khóa'} tài khoản [${targetUser.email}].`,
                    user: targetUser
                });
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
     * Endpoint: POST /users/:id/change-role hoặc PATCH /api/users/:id/role
     */
    changeRole: async (req, res) => {
        try {
            const targetId = req.params.id;
            const { role } = req.body;
            if (!['user', 'staff', 'admin'].includes(role)) {
                return res.status(400).json({ status: 0, message: 'Vai trò không hợp lệ.' });
            }

            if (!isDbConnected()) {
                const targetUser = findFallbackUserById(targetId);
                if (!targetUser) return res.status(404).json({ status: 0, message: 'Không tìm thấy tài khoản.' });
                if (targetUser.role === 'admin' && role !== 'admin') {
                    const adminCount = getFallbackUsers().filter(u => u.role === 'admin').length;
                    if (adminCount <= 1) {
                        return res.status(400).json({ status: 0, message: 'Không thể hạ quyền Quản trị viên (Admin) cuối cùng của hệ thống.' });
                    }
                }
                targetUser.role = role;
                return res.status(200).json({
                    status: 1,
                    message: `Đã cập nhật vai trò tài khoản [${targetUser.email}] sang "${role}".`,
                    user: targetUser
                });
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
     */
    remove: async (req, res) => {
        try {
            const targetId = req.params.id;
            const currentUserId = getAuthUserId(req);

            if (currentUserId && currentUserId.toString() === targetId.toString()) {
                return res.status(400).json({ status: 0, message: 'Bạn không thể tự xóa tài khoản của chính mình.' });
            }

            if (!isDbConnected()) {
                const users = getFallbackUsers();
                const idx = users.findIndex(u => String(u._id) === String(targetId) || String(u.id) === String(targetId));
                if (idx === -1) return res.status(404).json({ status: 0, message: 'Không tìm thấy tài khoản.' });
                const [deleted] = users.splice(idx, 1);
                return res.status(200).json({ status: 1, message: 'Đã xóa tài khoản thành công.', deleted });
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
