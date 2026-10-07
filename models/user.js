const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Model User (Người dùng)
 * Phân quyền rõ ràng: user (khách hàng), staff (nhân viên quản trị), admin (quản trị viên cấp cao)
 */
const user = new Schema({
    id: ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('user', user);
