const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Model Bill (Đơn đặt hàng mô hình Gundam Studio)
 * Mở rộng theo quy trình chuẩn thương mại điện tử chuyên nghiệp
 */
const bill = new Schema({
    id: ObjectId,
    user: { type: ObjectId, ref: 'user', required: true },
    totalMoney: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ['COD', 'Online', 'Banking', 'VIETQR', 'VNPAY', 'MOMO'], default: 'COD' },
    
    // 1. Trạng thái đơn hàng (Vòng đời đơn hàng chính xác)
    status: {
        type: String,
        enum: [
            'pending',          // Chờ xác nhận
            'confirmed',        // Đã xác nhận
            'processing',       // Đang chuẩn bị hàng
            'shipping',         // Đang giao hàng
            'delivered',        // Đã giao hàng
            'completed',        // Hoàn tất đơn
            'cancelled',        // Đã hủy
            'failed_delivery',  // Giao không thành công
            'returning',        // Đang hoàn về shop
            'returned'          // Đã hoàn về kho shop
        ],
        default: 'pending'
    },

    // 2. Trạng thái thanh toán độc lập
    paymentStatus: {
        type: String,
        enum: [
            'unpaid',             // Chưa thanh toán
            'partially_paid',     // Thanh toán một phần
            'paid',               // Đã thanh toán
            'partially_refunded', // Hoàn tiền một phần
            'refunded'            // Đã hoàn tiền toàn bộ
        ],
        default: 'unpaid'
    },

    // 3. Theo dõi COD chuyên sâu
    codStatus: {
        type: String,
        enum: [
            'uncollected',        // Chưa thu của khách
            'carrier_collected',  // Đơn vị VC đã thu tiền
            'reconciled'          // Đã đối soát & chuyển tiền về shop
        ],
        default: 'uncollected'
    },

    // 4. Vận chuyển & Giao vận
    carrier: { type: String, default: 'Giao Hàng Nhanh (GHN)' },
    trackingNumber: { type: String, default: '' },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    failedDeliveryCount: { type: Number, default: 0 },
    failedDeliveryReason: { type: String, default: '' },

    // 5. Thông tin giao nhận
    shippingAddress: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    recipientName: { type: String, default: '' },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },

    // 6. Tài chính & Hoàn tiền
    amountPaid: { type: Number, default: 0, min: 0 },
    amountRefunded: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    discountCode: { type: String, default: '' },
    shippingFee: { type: Number, default: 0, min: 0 },

    // 7. Yêu cầu hủy đơn
    cancelReason: { type: String, default: '' },
    cancelRequestedBy: { type: String, enum: ['customer', 'admin', 'staff', 'system', ''], default: '' },
    cancelStatus: { type: String, enum: ['', 'pending', 'approved', 'rejected', 'withdrawn'], default: '' },
    cancelledAt: { type: Date },

    // 8. Hồ sơ Đổi / Trả hàng (Return & Exchange Requests)
    returnRequests: [
        {
            requestCode: { type: String, required: true },
            items: [
                {
                    product: { type: ObjectId, ref: 'product' },
                    productName: String,
                    quantity: { type: Number, default: 1 },
                    unitPrice: { type: Number, default: 0 },
                    reason: String
                }
            ],
            reason: { type: String, default: '' },
            desiredAction: { type: String, enum: ['refund', 'exchange'], default: 'refund' },
            status: {
                type: String,
                enum: [
                    'pending',        // Chờ duyệt
                    'reviewing',      // Đang xét duyệt
                    'approved',       // Đã chấp thuận
                    'shipping_back',  // Đang gửi trả
                    'received',       // Đã nhận hàng trả
                    'inspecting',     // Đang kiểm tra
                    'resolved',       // Đã giải quyết
                    'rejected',       // Từ chối
                    'cancelled'       // Khách rút yêu cầu
                ],
                default: 'pending'
            },
            inspectionResult: {
                type: String,
                enum: ['', 'restockable', 'damaged', 'inspecting'],
                default: ''
            },
            restocked: { type: Boolean, default: false },
            restockedQuantity: { type: Number, default: 0 },
            carrier: { type: String, default: '' },
            trackingNumber: { type: String, default: '' },
            shippingFeePayer: { type: String, enum: ['shop', 'customer'], default: 'shop' },
            refundAmount: { type: Number, default: 0 },
            replacementProduct: { type: ObjectId, ref: 'product' },
            replacementProductName: { type: String, default: '' },
            priceDifference: { type: Number, default: 0 },
            createdAt: { type: Date, default: Date.now },
            resolvedAt: { type: Date },
            note: { type: String, default: '' }
        }
    ],

    // 9. Lịch sử yêu cầu hoàn tiền
    refundRequests: [
        {
            amount: { type: Number, required: true, min: 0 },
            reason: { type: String, default: '' },
            method: { type: String, default: 'Chuyển khoản ngân hàng' },
            status: {
                type: String,
                enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'failed'],
                default: 'pending'
            },
            requestedBy: { type: String, default: 'Admin' },
            approvedBy: { type: String, default: '' },
            transactionRef: { type: String, default: '' },
            createdAt: { type: Date, default: Date.now },
            completedAt: { type: Date }
        }
    ],

    // 10. Audit Log / Lịch sử thay đổi trạng thái minh bạch
    statusHistory: [
        {
            fromStatus: { type: String, default: '' },
            toStatus: { type: String, required: true },
            action: { type: String, required: true },
            actor: { type: String, default: 'Hệ thống' },
            note: { type: String, default: '' },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('bill', bill);
