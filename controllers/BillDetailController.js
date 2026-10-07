const billDetailModel = require('../models/billdetail');

const BillDetailController = {
    // 1. Lấy tất cả chi tiết đơn hàng
    getAll: async (req, res) => {
        try {
            const details = await billDetailModel.find().populate('bill').populate('product');
            return res.status(200).json(details);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 2. Lấy chi tiết đơn hàng theo ID hóa đơn (Bill ID)
    getByBill: async (req, res) => {
        try {
            const billId = req.params.billId || req.params.id;
            const details = await billDetailModel.find({ bill: billId }).populate('product');
            return res.status(200).json(details);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 3. Lấy chi tiết đơn hàng theo ID
    getById: async (req, res) => {
        try {
            const detail = await billDetailModel.findById(req.params.id).populate('bill').populate('product');
            if (!detail) {
                return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
            }
            return res.status(200).json(detail);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 4. Tạo mới chi tiết đơn hàng
    create: async (req, res) => {
        try {
            const newDetail = await billDetailModel.create(req.body);
            return res.status(201).json(newDetail);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 5. Cập nhật chi tiết đơn hàng
    update: async (req, res) => {
        try {
            const updated = await billDetailModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updated) {
                return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
            }
            return res.status(200).json(updated);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 6. Xóa chi tiết đơn hàng
    remove: async (req, res) => {
        try {
            const deleted = await billDetailModel.findByIdAndDelete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
            }
            return res.status(200).json({ message: 'Xóa thành công', deleted });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
};

module.exports = BillDetailController;
