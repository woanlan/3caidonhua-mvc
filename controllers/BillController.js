const billModel = require('../models/bill');
const billDetailModel = require('../models/billdetail');
const productModel = require('../models/product');
const userModel = require('../models/user');
const { cartsByUser, getUserId } = require('../routes/cart');

// Helper ánh xạ dữ liệu đơn hàng kèm danh sách chi tiết sản phẩm
async function mapBillWithDetails(b) {
    const details = await billDetailModel.find({ bill: b._id }).populate('product');
    const items = details.map(d => ({
        id: d.product?._id?.toString() || d._id.toString(),
        productId: d.product?._id?.toString() || '',
        name: d.product?.name || 'Mô hình Gunpla Bandai',
        sku: d.product?.sku || ('KIT-' + (d.product?._id ? d.product._id.toString().slice(-4).toUpperCase() : '0000')),
        grade: d.product?.grade || '',
        scale: d.product?.scale || '',
        image: d.product?.image || '/assets/hero-poster.jpg',
        quantity: d.quantity || 1,
        price: d.price || 0,
        subtotal: (d.price || 0) * (d.quantity || 1)
    }));

    let step = 1;
    if (b.status === 'confirmed' || b.status === 'processing') step = 2;
    else if (b.status === 'shipping' || b.status === 'delivered') step = 3;
    else if (b.status === 'completed') step = 4;
    else step = 0; // cancelled, failed_delivery, returning, returned

    return {
        id: b._id.toString(),
        _id: b._id.toString(),
        code: 'HD' + b._id.toString().slice(-6).toUpperCase(),
        recipient: b.user?.name || b.recipientName || b.shippingAddress || 'Khách hàng',
        phone: b.phoneNumber || b.user?.phone || '0907652267',
        address: b.shippingAddress || b.user?.address || 'Việt Nam',
        note: b.note || '',
        paymentMethod: b.paymentMethod || 'COD',
        total: b.totalMoney || 0,
        status: b.status || 'pending',
        paymentStatus: b.paymentStatus || 'unpaid',
        codStatus: b.codStatus || 'uncollected',
        amountPaid: b.amountPaid || 0,
        amountRefunded: b.amountRefunded || 0,
        carrier: b.carrier || 'Giao Hàng Nhanh (GHN)',
        trackingNumber: b.trackingNumber || ('GHN' + b._id.toString().slice(-6).toUpperCase()),
        step: step,
        createdAt: b.createdAt,
        returnRequests: b.returnRequests || [],
        statusHistory: b.statusHistory || [],
        items: items.length > 0 ? items : [{ name: 'Mô hình Gunpla Bandai', quantity: 1, price: b.totalMoney || 0, image: '/assets/products/rg-hinu.jpg', grade: 'HG', scale: '1/144', subtotal: b.totalMoney || 0 }]
    };
}

const BillController = {
    // 1. Lấy tất cả đơn hàng
    getAll: async (req, res) => {
        try {
            const userId = req.cookies?.userId;
            let query = {};
            if (userId) {
                const user = await userModel.findById(userId);
                if (user && user.role !== 'admin') {
                    query = { user: user._id };
                }
            }

            const bills = await billModel.find(query).populate('user').sort({ createdAt: -1 });
            const result = [];
            for (const b of bills) {
                result.push(await mapBillWithDetails(b));
            }
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 2. Lấy chi tiết đơn hàng theo ID
    getById: async (req, res) => {
        try {
            const bill = await billModel.findById(req.params.id).populate('user');
            if (!bill) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }
            const data = await mapBillWithDetails(bill);
            return res.status(200).json(data);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 3. Tạo mới đơn hàng (Checkout)
    create: async (req, res) => {
        try {
            const { recipient, phone, address, paymentMethod, note, items } = req.body;
            const uid = getUserId(req);
            const cart = (cartsByUser && cartsByUser[uid]) ? cartsByUser[uid] : (items || []);

            let user = null;
            if (req.cookies?.userId) {
                user = await userModel.findById(req.cookies.userId);
            }
            if (!user) {
                user = await userModel.findOne({ email: 'cuckydangiu111@gmail.com' }) || await userModel.findOne();
            }

            // Kiểm tra tồn kho trước khi đặt hàng
            if (cart.length > 0) {
                for (const item of cart) {
                    const prod = await productModel.findById(item.variantId || item.id || item.product || item.productId);
                    if (prod && prod.quantity < item.quantity) {
                        return res.status(400).json({
                            status: 0,
                            message: `Sản phẩm "${prod.name}" không đủ số lượng tồn kho (chỉ còn ${prod.quantity} bộ, yêu cầu ${item.quantity} bộ).`
                        });
                    }
                }
            }

            let totalMoney = 0;
            if (cart.length > 0) {
                totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            } else {
                totalMoney = Number(req.body.totalMoney) || 1150000;
            }

            const isPrepaid = (paymentMethod === 'Online' || paymentMethod === 'Banking');

            const newBill = await billModel.create({
                user: user._id,
                totalMoney: totalMoney,
                paymentMethod: paymentMethod || 'COD',
                status: 'pending',
                paymentStatus: 'unpaid',
                codStatus: 'uncollected',
                amountPaid: 0,
                shippingAddress: address || 'Việt Nam',
                phoneNumber: phone || '0907652267',
                recipientName: recipient || user.name || 'Khách hàng',
                note: note || '',
                carrier: 'Giao Hàng Nhanh (GHN)',
                statusHistory: [
                    {
                        fromStatus: '',
                        toStatus: 'pending',
                        action: 'Đặt hàng thành công',
                        actor: 'Khách hàng',
                        note: `Phương thức thanh toán: ${paymentMethod || 'COD'}`,
                        timestamp: new Date()
                    }
                ]
            });

            newBill.trackingNumber = 'GHN' + newBill._id.toString().slice(-6).toUpperCase();
            await newBill.save();

            // Lưu chi tiết đơn hàng và trừ tồn kho
            if (cart.length > 0) {
                for (const item of cart) {
                    let prod = null;
                    try {
                        prod = await productModel.findById(item.variantId || item.id || item.product || item.productId);
                    } catch (e) {}

                    if (prod) {
                        await billDetailModel.create({
                            bill: newBill._id,
                            product: prod._id,
                            quantity: item.quantity,
                            price: item.price
                        });

                        await productModel.findByIdAndUpdate(prod._id, { $inc: { quantity: -item.quantity } });
                    }
                }
                if (cartsByUser && cartsByUser[uid]) {
                    cartsByUser[uid] = [];
                }
            }

            return res.status(201).json({
                status: 1,
                message: 'Đặt hàng thành công',
                id: newBill._id.toString(),
                _id: newBill._id.toString(),
                code: 'HD' + newBill._id.toString().slice(-6).toUpperCase(),
                bill: newBill
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 4. Cập nhật đơn hàng
    update: async (req, res) => {
        try {
            const bill = await billModel.findById(req.params.id);
            if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

            const oldStatus = bill.status;
            const newStatus = req.body.status;

            if (req.body.paymentStatus) bill.paymentStatus = req.body.paymentStatus;
            if (newStatus) bill.status = newStatus;
            if (req.body.amountPaid !== undefined) {
                bill.amountPaid = Number(req.body.amountPaid);
            } else if (req.body.paymentStatus === 'paid' && (!bill.amountPaid || bill.amountPaid === 0)) {
                bill.amountPaid = bill.totalMoney || 0;
            }
            if (req.body.note) bill.note = req.body.note;

            // Xử lý ghi lịch sử tiến trình đơn hàng
            if (newStatus && newStatus !== oldStatus) {
                let actionText = `Chuyển trạng thái sang "${newStatus}"`;
                if (newStatus === 'processing') actionText = 'Xác nhận thanh toán & Bắt đầu chuẩn bị hàng';
                else if (newStatus === 'confirmed') actionText = 'Xác nhận đơn hàng';
                else if (newStatus === 'shipping') actionText = 'Bàn giao cho đơn vị vận chuyển (GHN)';

                bill.statusHistory.push({
                    fromStatus: oldStatus,
                    toStatus: newStatus,
                    action: actionText,
                    actor: req.body.actor || 'Khách hàng / Quản trị viên',
                    note: req.body.reason || req.body.note || 'Xác nhận chuyển khoản QR thành công',
                    timestamp: new Date()
                });
            }

            // Gán các trường bổ sung khác nếu có
            for (const key of Object.keys(req.body)) {
                if (!['status', 'paymentStatus', 'amountPaid', 'note', 'statusHistory'].includes(key)) {
                    bill[key] = req.body[key];
                }
            }

            await bill.save();
            return res.status(200).json(bill);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 5. Xóa đơn hàng
    remove: async (req, res) => {
        try {
            await billDetailModel.deleteMany({ bill: req.params.id });
            const deleted = await billModel.findByIdAndDelete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            return res.status(200).json({ message: 'Xóa đơn hàng thành công', deleted });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 6. Tra cứu đơn hàng theo Mã đơn hoặc Số điện thoại
    track: async (req, res) => {
        try {
            const q = (req.params.query || req.body.query || req.body.code || req.body.phone || '').trim();
            if (!q) {
                return res.status(400).json({ status: 0, message: 'Vui lòng nhập Mã đơn hàng hoặc Số điện thoại cần tra cứu.' });
            }

            const cleanCode = q.replace(/^HD/i, '').toLowerCase();
            const allBills = await billModel.find().populate('user').sort({ createdAt: -1 });

            const bills = allBills.filter(b => {
                const code = b._id.toString().slice(-6).toLowerCase();
                const phone = (b.phoneNumber || b.user?.phone || '').replace(/\D/g, '');
                const searchPhone = q.replace(/\D/g, '');
                return code === cleanCode || (searchPhone.length >= 9 && phone.includes(searchPhone));
            });

            if (bills.length === 0) {
                return res.status(404).json({ status: 0, message: `Không tìm thấy đơn hàng nào khớp với "${q}".` });
            }

            const result = [];
            for (const b of bills) {
                result.push(await mapBillWithDetails(b));
            }
            return res.status(200).json({ status: 1, orders: result });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    },

    // 7. Khách hàng tự hủy đơn hàng
    cancel: async (req, res) => {
        try {
            const bill = await billModel.findById(req.params.id);
            if (!bill) return res.status(404).json({ status: 0, message: 'Không tìm thấy đơn hàng' });

            if (!['pending', 'confirmed'].includes(bill.status)) {
                return res.status(400).json({
                    status: 0,
                    message: 'Chỉ có thể hủy đơn hàng khi đơn chưa bàn giao vận chuyển (trạng thái Chờ xác nhận hoặc Đã xác nhận).'
                });
            }

            const oldStatus = bill.status;
            bill.status = 'cancelled';
            bill.cancelReason = req.body.reason || 'Khách hàng tự hủy đơn';
            bill.cancelRequestedBy = 'customer';
            bill.cancelStatus = 'approved';
            bill.cancelledAt = new Date();

            // Hoàn lại tồn kho
            const details = await billDetailModel.find({ bill: bill._id });
            for (const d of details) {
                if (d.product) {
                    await productModel.findByIdAndUpdate(d.product, { $inc: { quantity: d.quantity } });
                }
            }

            bill.statusHistory.push({
                fromStatus: oldStatus,
                toStatus: 'cancelled',
                action: 'Khách hàng hủy đơn',
                actor: 'Người mua',
                note: req.body.reason || 'Khách hàng chủ động hủy qua trang theo dõi đơn hàng',
                timestamp: new Date()
            });

            await bill.save();
            return res.status(200).json({ status: 1, message: 'Đã hủy đơn hàng thành công!', bill });
        } catch (err) {
            return res.status(500).json({ status: 0, message: err.message });
        }
    }
};

module.exports = BillController;
