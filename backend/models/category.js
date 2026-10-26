const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Model Category (Danh mục mô hình nhựa / Gunpla)
 * Theo chuẩn tài liệu Google Doc môn WEB503
 */
const category = new Schema({
    id: { type: ObjectId }, // khóa chính
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
        default: 'No name'
    },
    slug: { type: String, trim: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 1 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
    timestamps: true
});

module.exports = mongoose.model('category', category);
