var express = require('express');
var router = express.Router();
var modelBill = require('../models/bill');
var modelBillDetail = require('../models/billdetail');
var modelProduct = require('../models/product');
var modelCategory = require('../models/category');
var modelUser = require('../models/user');

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  failed_delivery: 'Giao không thành công',
  returning: 'Đang hoàn về',
  returned: 'Đã hoàn về'
};

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipping', 'cancelled'],
  shipping: ['delivered', 'failed_delivery'],
  failed_delivery: ['shipping', 'returning'],
  returning: ['returned'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
  returned: []
};

// Helper ánh xạ đơn hàng đầy đủ
async function mapAdminBill(b) {
  const details = await modelBillDetail.find({ bill: b._id }).populate('product');
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

  return {
    id: b._id.toString(),
    _id: b._id.toString(),
    code: 'HD' + b._id.toString().slice(-6).toUpperCase(),
    recipient: b.user?.name || b.recipientName || 'Khách hàng',
    phone: b.phoneNumber || b.user?.phone || '0907652267',
    address: b.shippingAddress || b.user?.address || 'TP. Hồ Chí Minh, Việt Nam',
    note: b.note || '',
    paymentMethod: b.paymentMethod || 'COD',
    total: b.totalMoney || 0,
    status: b.status || 'pending',
    paymentStatus: b.paymentStatus || 'unpaid',
    codStatus: b.codStatus || 'uncollected',
    amountPaid: b.amountPaid || 0,
    amountRefunded: b.amountRefunded || 0,
    discountAmount: b.discountAmount || 0,
    discountCode: b.discountCode || '',
    shippingFee: b.shippingFee || 0,
    carrier: b.carrier || 'Giao Hàng Nhanh (GHN)',
    trackingNumber: b.trackingNumber || ('GHN' + b._id.toString().slice(-6).toUpperCase()),
    shippedAt: b.shippedAt,
    deliveredAt: b.deliveredAt,
    failedDeliveryCount: b.failedDeliveryCount || 0,
    failedDeliveryReason: b.failedDeliveryReason || '',
    cancelReason: b.cancelReason || '',
    cancelRequestedBy: b.cancelRequestedBy || '',
    cancelStatus: b.cancelStatus || '',
    cancelledAt: b.cancelledAt,
    returnRequests: b.returnRequests || [],
    refundRequests: b.refundRequests || [],
    statusHistory: b.statusHistory || [],
    items: items.length > 0 ? items : [{ name: 'Mô hình Gunpla chính hãng', quantity: 1, price: b.totalMoney || 0, subtotal: b.totalMoney || 0 }],
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  };
}

// 1. Lấy danh sách đơn hàng cho Admin (/api/admin/orders)
router.get('/orders', async function(req, res, next) {
  try {
    const bills = await modelBill.find().populate('user').sort({ createdAt: -1 });
    const result = [];
    for (const b of bills) {
      result.push(await mapAdminBill(b));
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message });
  }
});

// 2. Thống kê số liệu vận hành chính xác (/api/admin/stats)
router.get('/stats', async function(req, res, next) {
  try {
    const { timeRange } = req.query; // 'today', '7days', 'this_month', 'all'
    const now = new Date();
    let startDate = null;

    if (timeRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === '7days') {
      startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    } else if (timeRange === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const query = {};
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    const allBills = await modelBill.find(query).populate('user').sort({ createdAt: -1 });
    const allProducts = await modelProduct.find();

    // Doanh thu bán hàng: CHỈ tính đơn completed (hoàn tất/đã giao thành công) trừ tiền hoàn
    const completedBills = allBills.filter(b => b.status === 'completed');
    const salesRevenue = completedBills.reduce((sum, b) => {
      const net = (b.totalMoney || 0) - (b.amountRefunded || 0);
      return sum + Math.max(0, net);
    }, 0);

    // Tổng giá trị đơn hàng trong kỳ
    const totalOrderValue = allBills.reduce((sum, b) => sum + (b.totalMoney || 0), 0);

    // Tiền thực tế đã thu
    const collectedCash = allBills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    // Tiền COD chưa đối soát
    const unreconciledCOD = allBills
      .filter(b => b.paymentMethod === 'COD' && b.status !== 'cancelled' && b.codStatus !== 'reconciled')
      .reduce((sum, b) => sum + (b.totalMoney || 0), 0);

    // Đơn chờ xác nhận (toàn hệ thống)
    const pendingOrdersCount = await modelBill.countDocuments({ status: 'pending' });

    // Đơn đang giao (toàn hệ thống)
    const shippingOrdersCount = await modelBill.countDocuments({ status: 'shipping' });

    // Sản phẩm sắp hết hàng (tồn <= threshold)
    const lowStockProductsCount = allProducts.filter(p => p.status === 'active' && p.quantity <= (p.lowStockThreshold || 5)).length;

    // Đơn hàng gần đây (5 - 10 đơn)
    const recentBills = allBills.slice(0, 8);
    const recentOrders = [];
    for (const b of recentBills) {
      recentOrders.push(await mapAdminBill(b));
    }

    res.json({
      status: 1,
      timeRange: timeRange || 'this_month',
      salesRevenue,
      totalOrderValue,
      collectedCash,
      unreconciledCOD,
      pendingOrders: pendingOrdersCount,
      shippingOrders: shippingOrdersCount,
      lowStockProducts: lowStockProductsCount,
      totalOrdersCount: allBills.length,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message });
  }
});

// 3. Cập nhật trạng thái đơn hàng (/api/admin/orders/:id/status)
router.patch('/orders/:id/status', async function(req, res, next) {
  try {
    const { id } = req.params;
    const { status: newStatus, note, reason, actor } = req.body;

    const bill = await modelBill.findById(id);
    if (!bill) {
      return res.status(404).json({ status: 0, message: 'Không tìm thấy đơn hàng' });
    }

    const currentStatus = bill.status || 'pending';

    // Kiểm tra quy tắc chuyển trạng thái hợp lệ
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        status: 0,
        message: `Chuyển trạng thái không hợp lệ! Không thể chuyển trực tiếp từ "${STATUS_LABELS[currentStatus] || currentStatus}" sang "${STATUS_LABELS[newStatus] || newStatus}".`
      });
    }

    // Yêu cầu nhập lý do khi hủy hoặc báo giao thất bại
    if (newStatus === 'cancelled' && !reason && !note) {
      return res.status(400).json({ status: 0, message: 'Vui lòng nhập lý do hủy đơn hàng.' });
    }
    if (newStatus === 'failed_delivery' && !reason && !note) {
      return res.status(400).json({ status: 0, message: 'Vui lòng nhập lý do giao hàng không thành công.' });
    }

    const oldStatus = currentStatus;
    bill.status = newStatus;

    // Xử lý các sự kiện phụ thuộc
    if (newStatus === 'shipping') {
      bill.shippedAt = new Date();
    }
    if (newStatus === 'delivered') {
      bill.deliveredAt = new Date();
      // Với đơn COD, khi giao thành công thì đơn vị VC đã thu tiền, nhưng shop chưa đối soát
      if (bill.paymentMethod === 'COD' && bill.codStatus === 'uncollected') {
        bill.codStatus = 'carrier_collected';
      }
    }
    if (newStatus === 'completed') {
      // Khi hoàn tất đơn: nếu COD thì đối soát tiền về shop và đánh dấu đã thanh toán
      if (bill.paymentMethod === 'COD') {
        bill.codStatus = 'reconciled';
        bill.paymentStatus = 'paid';
        bill.amountPaid = bill.totalMoney;
      }
    }
    if (newStatus === 'failed_delivery') {
      bill.failedDeliveryCount = (bill.failedDeliveryCount || 0) + 1;
      bill.failedDeliveryReason = reason || note || 'Khách không nghe máy / hẹn giao lại';
    }
    if (newStatus === 'cancelled') {
      bill.cancelReason = reason || note || 'Admin hủy đơn';
      bill.cancelledAt = new Date();
      bill.cancelStatus = 'approved';

      // QUY TẮC HOÀN KHO KHI HỦY:
      // Nếu hủy trước khi bàn giao (pending, confirmed, processing), hoàn lại tồn kho đúng 1 lần
      if (['pending', 'confirmed', 'processing'].includes(oldStatus)) {
        const details = await modelBillDetail.find({ bill: bill._id });
        for (const d of details) {
          if (d.product) {
            await modelProduct.findByIdAndUpdate(d.product, { $inc: { quantity: d.quantity } });
          }
        }
      }
    }

    // Ghi lịch sử Audit Log
    bill.statusHistory.push({
      fromStatus: oldStatus,
      toStatus: newStatus,
      action: `Chuyển trạng thái sang "${STATUS_LABELS[newStatus] || newStatus}"`,
      actor: actor || 'Quản trị viên',
      note: note || reason || '',
      timestamp: new Date()
    });

    await bill.save();
    const mapped = await mapAdminBill(bill);
    res.json({
      status: 1,
      message: `Đã cập nhật đơn hàng thành công sang "${STATUS_LABELS[newStatus] || newStatus}".`,
      order: mapped
    });
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message });
  }
});

// Hỗ trợ cả PUT /orders/:id/status
router.put('/orders/:id/status', async function(req, res, next) {
  return router.handle(Object.assign(req, { method: 'PATCH' }), res, next);
});

// 4. Cập nhật thanh toán & COD độc lập (/api/admin/orders/:id/payment)
router.patch('/orders/:id/payment', async function(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus, codStatus, amountPaid, amountRefunded, note, actor } = req.body;

    const bill = await modelBill.findById(id);
    if (!bill) {
      return res.status(404).json({ status: 0, message: 'Không tìm thấy đơn hàng' });
    }

    if (paymentStatus) bill.paymentStatus = paymentStatus;
    if (codStatus) bill.codStatus = codStatus;
    if (amountPaid !== undefined) bill.amountPaid = Number(amountPaid);
    if (amountRefunded !== undefined) bill.amountRefunded = Number(amountRefunded);

    bill.statusHistory.push({
      fromStatus: bill.status,
      toStatus: bill.status,
      action: 'Cập nhật tài chính & thanh toán',
      actor: actor || 'Kế toán / Admin',
      note: note || `Thanh toán: ${bill.paymentStatus} | COD: ${bill.codStatus} | Đã thu: ${bill.amountPaid}đ`,
      timestamp: new Date()
    });

    await bill.save();
    res.json({ status: 1, message: 'Cập nhật trạng thái thanh toán thành công', order: await mapAdminBill(bill) });
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message });
  }
});

// 5. Tạo yêu cầu đổi / trả hàng (/api/admin/orders/:id/return-request)
router.post('/orders/:id/return-request', async function(req, res, next) {
  try {
    const { id } = req.params;
    const { reason, desiredAction, items, shippingFeePayer, refundAmount, note, actor } = req.body;

    const bill = await modelBill.findById(id);
    if (!bill) {
      return res.status(404).json({ status: 0, message: 'Không tìm thấy đơn hàng' });
    }

    const requestCode = 'TH' + Date.now().toString().slice(-6);
    const newRequest = {
      requestCode,
      reason: reason || 'Khách yêu cầu đổi/trả',
      desiredAction: desiredAction || 'refund',
      status: 'pending',
      items: items || [],
      shippingFeePayer: shippingFeePayer || 'shop',
      refundAmount: Number(refundAmount) || 0,
      inspectionResult: 'inspecting',
      restocked: false,
      note: note || '',
      createdAt: new Date()
    };

    bill.returnRequests.push(newRequest);
    bill.statusHistory.push({
      fromStatus: bill.status,
      toStatus: bill.status,
      action: `Tiếp nhận yêu cầu ${desiredAction === 'exchange' ? 'Đổi hàng' : 'Trả hàng'} (${requestCode})`,
      actor: actor || 'Admin',
      note: reason || '',
      timestamp: new Date()
    });

    await bill.save();
    res.json({ status: 1, message: 'Đã tạo hồ sơ đổi/trả hàng thành công!', order: await mapAdminBill(bill) });
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message });
  }
});

// 6. Xử lý hồ sơ đổi / trả hàng và kiểm tra kho (/api/admin/orders/:id/return-request/:reqCode/status)
router.patch('/orders/:id/return-request/:reqCode/status', async function(req, res, next) {
  try {
    const { id, reqCode } = req.params;
    const { status: reqStatus, inspectionResult, note, actor } = req.body;

    const bill = await modelBill.findById(id);
    if (!bill) {
      return res.status(404).json({ status: 0, message: 'Không tìm thấy đơn hàng' });
    }

    const targetReq = bill.returnRequests.find(r => r.requestCode === reqCode);
    if (!targetReq) {
      return res.status(404).json({ status: 0, message: 'Không tìm thấy hồ sơ đổi trả' });
    }

    targetReq.status = reqStatus;
    if (inspectionResult) targetReq.inspectionResult = inspectionResult;
    if (note) targetReq.note = note;

    // QUY TẮC NHẬP LẠI TỒN KHO HÀNG TRẢ:
    // Chỉ nhập kho khi kiểm tra ĐẠT (restockable) và chưa từng nhập lại (restocked === false)
    if (targetReq.status === 'resolved' || reqStatus === 'resolved') {
      targetReq.resolvedAt = new Date();

      if (targetReq.inspectionResult === 'restockable' && !targetReq.restocked) {
        for (const it of targetReq.items) {
          if (it.product) {
            await modelProduct.findByIdAndUpdate(it.product, { $inc: { quantity: it.quantity || 1 } });
          }
        }
        targetReq.restocked = true;
      }

      // Xử lý hoàn tiền nếu phương án là refund
      if (targetReq.desiredAction === 'refund' && targetReq.refundAmount > 0) {
        bill.amountRefunded = (bill.amountRefunded || 0) + targetReq.refundAmount;
        if (bill.amountRefunded >= bill.amountPaid && bill.amountPaid > 0) {
          bill.paymentStatus = 'refunded';
        } else if (bill.amountRefunded > 0) {
          bill.paymentStatus = 'partially_refunded';
        }
      }
    }

    bill.statusHistory.push({
      fromStatus: bill.status,
      toStatus: bill.status,
      action: `Cập nhật hồ sơ đổi/trả ${reqCode} sang "${reqStatus}"`,
      actor: actor || 'Admin',
      note: note || `Đánh giá hàng: ${inspectionResult || 'Chưa phân loại'}`,
      timestamp: new Date()
    });

    await bill.save();
    res.json({ status: 1, message: 'Đã cập nhật hồ sơ đổi trả thành công', order: await mapAdminBill(bill) });
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message });
  }
});

// 7. Tạo yêu cầu hoàn tiền độc lập (/api/admin/orders/:id/refunds)
router.post('/orders/:id/refunds', async function(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, reason, method, transactionRef, actor } = req.body;

    const bill = await modelBill.findById(id);
    if (!bill) {
      return res.status(404).json({ status: 0, message: 'Không tìm thấy đơn hàng' });
    }

    const refundNum = Number(amount);
    if (isNaN(refundNum) || refundNum <= 0) {
      return res.status(400).json({ status: 0, message: 'Số tiền hoàn lại không hợp lệ.' });
    }

    // Không cho hoàn vượt quá số tiền thực tế đã thu
    const currentPaid = bill.amountPaid || 0;
    const alreadyRefunded = bill.amountRefunded || 0;
    if (alreadyRefunded + refundNum > currentPaid) {
      return res.status(400).json({
        status: 0,
        message: `Số tiền hoàn (${refundNum.toLocaleString('vi-VN')}đ) vượt quá số tiền thực tế có thể hoàn (${(currentPaid - alreadyRefunded).toLocaleString('vi-VN')}đ).`
      });
    }

    bill.refundRequests.push({
      amount: refundNum,
      reason: reason || 'Hoàn tiền theo thỏa thuận',
      method: method || 'Chuyển khoản VietQR',
      status: 'completed',
      requestedBy: actor || 'Admin',
      approvedBy: actor || 'Admin',
      transactionRef: transactionRef || ('REF-' + Date.now().toString().slice(-6)),
      createdAt: new Date(),
      completedAt: new Date()
    });

    bill.amountRefunded = alreadyRefunded + refundNum;
    if (bill.amountRefunded >= currentPaid && currentPaid > 0) {
      bill.paymentStatus = 'refunded';
    } else {
      bill.paymentStatus = 'partially_refunded';
    }

    bill.statusHistory.push({
      fromStatus: bill.status,
      toStatus: bill.status,
      action: `Thực hiện hoàn tiền: ${refundNum.toLocaleString('vi-VN')}đ`,
      actor: actor || 'Admin / Kế toán',
      note: reason || `Mã giao dịch: ${transactionRef || 'N/A'}`,
      timestamp: new Date()
    });

    await bill.save();
    res.json({ status: 1, message: 'Đã ghi nhận hoàn tiền thành công!', order: await mapAdminBill(bill) });
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message });
  }
});

// 8. Lấy danh sách sản phẩm cho Admin (/api/admin/products)
router.get('/products', async function(req, res, next) {
  try {
    const products = await modelProduct.find().populate('category').sort({ createdAt: -1 });
    const mapped = products.map((p) => {
      let brandName = 'Bandai Spirits';
      if (p.name && p.name.toLowerCase().includes('daban')) brandName = 'Daban';
      else if (p.name && p.name.toLowerCase().includes('jijia')) brandName = 'Jijia';

      const sku = p.sku || ((p.grade ? p.grade : 'KIT') + '-' + p._id.toString().slice(-4).toUpperCase());

      return {
        id: p._id.toString(),
        _id: p._id.toString(),
        sku: sku,
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        price: p.price,
        stock: p.quantity !== undefined ? p.quantity : 15,
        quantity: p.quantity !== undefined ? p.quantity : 15,
        status: p.status || (p.quantity === 0 ? 'inactive' : 'active'),
        lowStockThreshold: p.lowStockThreshold || 5,
        grade: p.grade || '',
        scale: p.scale || '',
        category: p.category?.name || 'Mô hình Gundam',
        categoryId: p.category?._id?.toString() || p.category?.toString(),
        brand: brandName,
        brandId: brandName === 'Daban' ? 2 : (brandName === 'Jijia' ? 3 : 1),
        image: p.image || '/assets/hero-poster.jpg',
        description: p.description || ''
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message });
  }
});

module.exports = router;
