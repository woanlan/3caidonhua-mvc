const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Model Product (Sản phẩm Mô hình Gundam / Gunpla / Phụ kiện)
 * Theo chuẩn tài liệu Google Doc môn WEB503 và chuẩn TMĐT
 */
const product = new Schema({
    id: { type: ObjectId }, // khóa chính
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: '', trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    image: { type: String, default: '' },
    images: [{ type: String }],
    description: { type: String, default: '' },
    grade: { type: String, default: '' }, // Phân loại Gundam: HG, RG, MG, PG, SD, Mega Size... để trống nếu là One Piece, dụng cụ
    scale: { type: String, default: '' }, // Tỉ lệ mô hình: 1/144, 1/100, 1/60, 1/48, Non-scale... để trống nếu không áp dụng
    category: { type: ObjectId, ref: 'category', required: true }, // Khóa ngoại liên kết category
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
    lowStockThreshold: { type: Number, default: 5, min: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('product', product);
