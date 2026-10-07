const userModel = require('../models/user');
const billModel = require('../models/bill');

// Helper lấy ID người dùng đang đăng nhập từ Cookie hoặc Header
function getAuthUserId(req) {
    return req.cookies?.userId || req.headers['x-user-id'] || null;
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

    // 5. Đăng ký tài khoản mới (Tạo người dùng)
    create: async (req, res) => {
        try {
            const { name, email, password, phone, address, role } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: 0, message: 'Vui lòng điền đầy đủ email và mật khẩu.' });
            }
            const existing = await userModel.findOne({ email: email.trim().toLowerCase() });
            if (existing) {
                return res.status(400).json({ status: 0, message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' });
            }
            const newUser = await userModel.create({
                name: name || 'Thành viên Gunpla',
                email: email.trim().toLowerCase(),
                password,
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
                name: newUser.name
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 6. Đăng nhập hệ thống
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: 0, message: 'Vui lòng nhập email và mật khẩu' });
            }

            const user = await userModel.findOne({ email: email.trim().toLowerCase(), password });
            if (!user) {
                return res.status(401).json({ status: 0, message: 'Email hoặc mật khẩu không chính xác' });
            }

            if (user.status === 'locked') {
                return res.status(403).json({ status: 0, message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
            }

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
                user: {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    phone: user.phone,
                    address: user.address,
                    createdAt: user.createdAt
                }
            });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
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
