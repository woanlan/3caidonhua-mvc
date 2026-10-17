const userModel = require('../models/user');
const billModel = require('../models/bill');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper lấy ID người dùng đang đăng nhập từ Cookie, Header x-user-id hoặc Bearer Token JWT
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
    // 1. Lấy danh sách tất cả người dùng (không trả mật khẩu)
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

    // 2. Lấy chi tiết người dùng theo ID
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

    // 3. Lấy thông tin tài khoản hiện tại đang đăng nhập
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

    // 4. Cập nhật thông tin tài khoản cá nhân đang đăng nhập
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

    // 5. Đăng ký tài khoản mới (Tạo người dùng với Bcrypt Hash)
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

            // Mã hóa mật khẩu bằng bcrypt theo đúng chuẩn bài giảng Google Doc
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

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

    // 6. Đăng nhập hệ thống (Bcrypt Compare + Cấp JWT Access Token & Refresh Token)
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

            // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu đã băm bcrypt và mật khẩu cũ)
            const isPasswordMatch = (user.password && user.password.startsWith('$2') && bcrypt.compareSync(password, user.password)) || (user.password === password);
            if (!isPasswordMatch) {
                return res.status(401).json({ status: 0, message: 'Email hoặc mật khẩu không chính xác' });
            }

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

            // Tạo access_token và refresh_token theo đúng chuẩn bài giảng Google Doc
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

    // Cấp lại access_token bằng refresh_token theo đúng chuẩn Google Doc
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

    // 7. Đăng xuất
    logout: async (req, res) => {
        try {
            res.clearCookie('userId');
            return res.status(200).json({ status: 1, message: 'Đã đăng xuất thành công' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 8. Cập nhật thông tin người dùng theo ID (cho admin)
    update: async (req, res) => {
        try {
            const updated = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
            if (!updated) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return res.status(200).json(updated);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 9. Khóa / Mở khóa tài khoản
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

    // 10. Thay đổi vai trò người dùng (user, staff, admin)
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

    // 11. Xóa người dùng
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
