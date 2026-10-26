// ====================================================================================
// [NGHIỆP VỤ ĐƠN HÀNG & HÓA ĐƠN] - BillController.js
// Quản lý toàn bộ vòng đời đơn hàng: Đặt hàng (Checkout) -> Trừ kho -> Xác nhận đơn 
// -> Cập nhật trạng thái giao hàng -> Thanh toán -> Hủy đơn & Hoàn trả tồn kho
// ====================================================================================

const billModel = require('../models/bill');
const billDetailModel = require('../models/billdetail');
const productModel = require('../models/product');
const userModel = require('../models/user');
const { cartsByUser, getUserId } = require('../routes/cart');

/**
 * [NGHIỆP VỤ ĐƠN HÀNG] - Helper ánh xạ dữ liệu hóa đơn kèm danh sách chi tiết sản phẩm
 * @param {Object} b - Document đơn hàng từ billModel
 * @returns {Object} Đối tượng đơn hàng chuẩn hóa cho giao diện Frontend
 */
async function mapBillWithDetails(b) {
    // Lấy chi tiết từng sản phẩm trong hóa đơn qua billDetailModel và populate thông tin product
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

    // Tính bước tiến trình đơn hàng (Step Tracker: 1=Chờ xử lý, 2=Đã xác nhận, 3=Đang giao, 4=Hoàn thành)
    let step = 1;
    if (b.status === 'confirmed' || b.status === 'processing') step = 2;
    else if (b.status === 'shipping' || b.status === 'delivered') step = 3;
    else if (b.status === 'completed') step = 4;
    else step = 0; // Đơn bị hủy (cancelled) hoặc trả hàng

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
    /**
     * [NGHIỆP VỤ ĐƠN HÀNG] - 1. Lấy tất cả đơn hàng (Hỗ trợ phân quyền User / Admin)
     * Endpoint: GET /bills hoặc GET /orders hoặc GET /api/orders
     * Logic:
     *  - Nếu là Khách hàng: Chỉ xem được danh sách đơn hàng của chính mình
     *  - Nếu là Quản trị viên (Admin): Xem được toàn bộ đơn hàng của toàn hệ thống
     */
    getAll: async (req, res) => {
        try {
            const userId = req.cookies?.userId;
            let query = {};
            if (userId) {
                const user = await userModel.findById(userId);
                // Khách hàng thông thường chỉ lọc đơn có user: user._id
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

    /**
     * [NGHIỆP VỤ ĐƠN HÀNG] - 2. Lấy thông tin chi tiết một đơn hàng theo ID
     * Endpoint: GET /bills/:id hoặc GET /orders/:id
     */
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

    /**
     * [NGHIỆP VỤ ĐẶT HÀNG / CHECKOUT] - 3. Khách hàng tạo đơn hàng mới (Checkout)
     * Endpoint: POST /bills hoặc POST /orders hoặc POST /api/orders
     * Các bước xử lý nghiệp vụ:
     *  1. Lấy thông tin khách hàng, địa chỉ, phương thức thanh toán và giỏ hàng
     *  2. [Kiểm tra tồn kho]: Duyệt từng món trong giỏ, nếu kho không đủ -> Báo lỗi ngay lập tức
     *  3. Tính tổng tiền đơn hàng (totalMoney)
     *  4. Khởi tạo Document `billModel` với trạng thái ban đầu:
     *     - status: 'pending' (Chờ xác nhận)
     *     - paymentStatus: 'unpaid' (Chưa thanh toán)
     *     - Sinh mã vận đơn tự động qua Giao Hàng Nhanh (GHN)
     *     - Khởi tạo lịch sử tiến trình đơn hàng (statusHistory)
     *  5. Lưu chi tiết sản phẩm vào `billDetailModel`
     *  6. [TRỪ TỒN KHO TỰ ĐỘNG]: Giảm số lượng `quantity` của sản phẩm trong MongoDB
     *  7. [LÀM RỖNG GIỎ HÀNG]: Xóa giỏ hàng tạm của user sau khi đặt hàng thành công
     */
    create: async (req, res) => {
        try {
            const { recipient, phone, address, paymentMethod, note, items } = req.body;
            const uid = getUserId(req);
            const cart = (cartsByUser && cartsByUser[uid]) ? cartsByUser[uid] : (items || []);

            // Xác định tài khoản đặt hàng (từ Cookie hoặc tài khoản mặc định)
            let user = null;
            if (req.cookies?.userId) {
                user = await userModel.findById(req.cookies.userId);
            }
            if (!user) {
                user = await userModel.findOne({ email: 'cuckydangiu111@gmail.com' }) || await userModel.findOne();
            }

            // BƯỚC 1: KIỂM TRA TỒN KHO TRƯỚC KHI ĐẶT HÀNG
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

            // BƯỚC 2: TÍNH TỔNG TIỀN ĐƠN HÀNG
            let totalMoney = 0;
            if (cart.length > 0) {
                totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            } else {
                totalMoney = Number(req.body.totalMoney) || 1150000;
            }

            // BƯỚC 3: TẠO HÓA ĐƠN TRONG CƠ SỞ DỮ LIỆU
            const newBill = await billModel.create({
                user: user._id,
                totalMoney: totalMoney,
                paymentMethod: paymentMethod || 'COD',
                status: 'pending',              // Trạng thái đơn ban đầu: Chờ xác nhận
                paymentStatus: 'unpaid',        // Trạng thái thanh toán: Chưa thanh toán
                codStatus: 'uncollected',       // Trạng thái thu hộ COD: Chưa thu tiền
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

            // BƯỚC 4: LƯU CHI TIẾT SẢN PHẨM VÀ TRỪ TỒN KHO
            if (cart.length > 0) {
                for (const item of cart) {
                    let prod = null;
                    try {
                        prod = await productModel.findById(item.variantId || item.id || item.product || item.productId);
                    } catch (e) {}

                    if (prod) {
                        // Lưu từng dòng sản phẩm vào bảng hóa đơn chi tiết
                        await billDetailModel.create({
                            bill: newBill._id,
                            product: prod._id,
                            quantity: item.quantity,
                            price: item.price
                        });

                        // [TRỪ KHO]: Giảm số lượng tồn kho theo số lượng khách đã mua
                        await productModel.findByIdAndUpdate(prod._id, { $inc: { quantity: -item.quantity } });
                    }
                }

                // BƯỚC 5: XÓA SẠCH GIỎ HÀNG CỦA KHÁCH HÀNG SAU KHI ĐẶT THÀNH CÔNG
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

    /**
     * [NGHIỆP VỤ XÁC NHẬN & CẬP NHẬT ĐƠN HÀNG] - 4. Admin duyệt đơn, đổi trạng thái
     * Endpoint: PUT /bills/:id hoặc PATCH /api/admin/orders/:id/status
     * Các trạng thái đơn:
     *  - 'pending': Chờ xác nhận
     *  - 'confirmed' / 'processing': Đã xác nhận & Đang chuẩn bị hàng
     *  - 'shipping': Đang giao hàng (bàn giao đơn vị vận chuyển)
     *  - 'delivered' / 'completed': Đã giao hàng thành công & Hoàn tất
     *  - 'cancelled': Đã hủy đơn
     */
    update: async (req, res) => {
        try {
            const bill = await billModel.findById(req.params.id);
            if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

            const oldStatus = bill.status;
            const newStatus = req.body.status;

            // Cập nhật trạng thái thanh toán nếu có truyền lên
            if (req.body.paymentStatus) bill.paymentStatus = req.body.paymentStatus;
            if (newStatus) bill.status = newStatus;

            // Xử lý cập nhật số tiền đã thanh toán (amountPaid)
            if (req.body.amountPaid !== undefined) {
                bill.amountPaid = Number(req.body.amountPaid);
            } else if (req.body.paymentStatus === 'paid' && (!bill.amountPaid || bill.amountPaid === 0)) {
                bill.amountPaid = bill.totalMoney || 0;
            }
            if (req.body.note) bill.note = req.body.note;

            // [LỊCH SỬ TIẾN TRÌNH ĐƠN HÀNG]: Tự động ghi log khi có thay đổi trạng thái
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

    /**
     * [NGHIỆP VỤ ĐƠN HÀNG] - 5. Xóa đơn hàng và các dòng chi tiết tương ứng
     * Endpoint: DELETE /bills/:id
     */
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

    /**
     * [NGHIỆP VỤ TRA CỨU ĐƠN HÀNG] - 6. Tra cứu đơn bằng Mã đơn hàng hoặc Số điện thoại
     * Endpoint: GET /bills/track/:query hoặc POST /bills/track hoặc GET /orders/track/:query
     */
    track: async (req, res) => {
        try {
            const q = (req.params.query || req.body.query || req.body.code || req.body.phone || '').trim();
            if (!q) {
                return res.status(400).json({ status: 0, message: 'Vui lòng nhập Mã đơn hàng hoặc Số điện thoại cần tra cứu.' });
            }

            const cleanCode = q.replace(/^HD/i, '').toLowerCase();
            const allBills = await billModel.find().populate('user').sort({ createdAt: -1 });

            // Tìm kiếm theo 6 ký tự cuối của Mã đơn hoặc theo Số điện thoại người nhận
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

    /**
     * [NGHIỆP VỤ HỦY ĐƠN HÀNG & HOÀN KHO] - 7. Khách hàng hoặc Admin yêu cầu hủy đơn
     * Endpoint: POST /bills/:id/cancel hoặc POST /orders/:id/cancel
     * Nghiệp vụ quan trọng:
     *  - Chỉ cho phép hủy khi đơn còn ở bước 'pending' (Chờ duyệt) hoặc 'confirmed' (Đã duyệt nhưng chưa giao)
     *  - [HOÀN LẠI TỒN KHO]: Tự động cộng lại số lượng sản phẩm đã đặt vào trường `quantity` trong MongoDB
     *  - Cập nhật trạng thái đơn sang 'cancelled', ghi lý do và lịch sử hủy đơn
     */
    cancel: async (req, res) => {
        try {
            const bill = await billModel.findById(req.params.id);
            if (!bill) return res.status(404).json({ status: 0, message: 'Không tìm thấy đơn hàng' });

            // Đơn hàng đã bàn giao vận chuyển thì không được tự hủy trên web
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

            // [NGHIỆP VỤ HOÀN TRẢ TỒN KHO]: Lấy danh sách chi tiết đơn và cộng lại số lượng vào bảng product
            const details = await billDetailModel.find({ bill: bill._id });
            for (const d of details) {
                if (d.product) {
                    await productModel.findByIdAndUpdate(d.product, { $inc: { quantity: d.quantity } });
                }
            }

            // Ghi nhật ký tiến trình hủy đơn
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
