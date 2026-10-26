const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Model BillDetail (Chi tiết sản phẩm trong đơn hàng)
 * Theo chuẩn tài liệu Google Doc môn WEB503
 */
const billdetail = new Schema({
    id: ObjectId,
    bill: { type: ObjectId, ref: 'bill', required: true },
    product: { type: ObjectId, ref: 'product', required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    price: { type: Number, required: true, min: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('billdetail', billdetail);
