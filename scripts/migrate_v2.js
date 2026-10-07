const mongoose = require('mongoose');

function toVietnameseSlug(str) {
  if (!str) return '';
  let s = str.toLowerCase();
  s = s.replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a');
  s = s.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
  s = s.replace(/[iíìỉĩị]/g, 'i');
  s = s.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
  s = s.replace(/[úùủũụưứừửữự]/g, 'u');
  s = s.replace(/[ýỳỷỹỵ]/g, 'y');
  s = s.replace(/[đ]/g, 'd');
  s = s.replace(/[^a-z0-9]+/g, '-');
  return s.replace(/(^-|-$)/g, '');
}

async function runMigration() {
  await mongoose.connect('mongodb://127.0.0.1:27017/3caidonhua');
  console.log('--- BẮT ĐẦU MIGRATION DỮ LIỆU TƯƠNG THÍCH V2 ---');

  const Category = require('../models/category');
  const Product = require('../models/product');
  const Bill = require('../models/bill');
  const User = require('../models/user');

  // 1. Cập nhật Categories
  const cats = await Category.find();
  for (let i = 0; i < cats.length; i++) {
    const c = cats[i];
    c.slug = toVietnameseSlug(c.name);
    c.order = i + 1;
    c.status = c.status || 'active';
    if (!c.image) {
      if (c.name.includes('Gundam')) c.image = '/assets/products/rg-hinu.jpg';
      else if (c.name.includes('Dụng cụ') || c.name.includes('Bút')) c.image = '/assets/products/tool-nipper.jpg';
      else if (c.name.includes('One Piece')) c.image = '/assets/products/op-sunny.jpg';
    }
    await c.save();
    console.log(`✓ Danh mục [${c.name}] -> slug: ${c.slug}, order: ${c.order}`);
  }

  // 2. Cập nhật Products
  const prods = await Product.find().populate('category');
  for (const p of prods) {
    // Sửa lỗi MG 1/100 Sazabi Ver.Ka bị gán MGEX
    if (p.name.includes('Sazabi Ver.Ka')) {
      p.grade = 'MG';
      p.scale = '1/100';
    }

    // Bỏ grade TOOLS và ONEPIECE, thay bằng rỗng theo yêu cầu
    const catName = p.category?.name || '';
    if (catName.includes('Dụng cụ') || catName.includes('Bút') || p.grade === 'TOOLS') {
      p.grade = '';
      p.scale = 'Non-scale';
    }
    if (catName.includes('One Piece') || p.grade === 'ONEPIECE') {
      p.grade = '';
      p.scale = 'Non-scale';
    }

    // Gán SKU nếu chưa có
    if (!p.sku) {
      const prefix = p.grade ? p.grade : (catName.includes('One Piece') ? 'OP' : 'TOOL');
      p.sku = (prefix + '-' + p._id.toString().slice(-6)).toUpperCase();
    }

    p.status = p.status || (p.quantity === 0 ? 'inactive' : 'active');
    p.lowStockThreshold = p.lowStockThreshold || 5;
    await p.save();
    console.log(`✓ Sản phẩm [${p.name}] -> SKU: ${p.sku}, Grade: "${p.grade}", Scale: "${p.scale}", Tồn kho: ${p.quantity}`);
  }

  // 3. Cập nhật Users
  const users = await User.find();
  for (const u of users) {
    u.status = u.status || 'active';
    if (!u.role) u.role = 'user';
    if (u.email === 'cuckydangiu111@gmail.com' || u.email === 'admin@3caidonhua.vn') {
      u.role = 'admin';
    }
    await u.save();
    console.log(`✓ Người dùng [${u.email}] -> Role: ${u.role}, Status: ${u.status}`);
  }

  // 4. Cập nhật Bills (Đơn hàng)
  const bills = await Bill.find();
  for (const b of bills) {
    if (!b.carrier) b.carrier = 'Giao Hàng Nhanh (GHN)';
    if (!b.trackingNumber) b.trackingNumber = 'GHN' + b._id.toString().slice(-6).toUpperCase();

    // Chuẩn hóa trạng thái thanh toán và COD
    if (!b.paymentStatus || b.paymentStatus === 'unpaid') {
      if (b.paymentMethod === 'VIETQR' || b.paymentMethod === 'Online' || b.paymentMethod === 'Banking') {
        b.paymentStatus = 'paid';
        b.amountPaid = b.totalMoney;
      } else {
        // COD
        if (b.status === 'completed') {
          b.paymentStatus = 'paid';
          b.codStatus = 'reconciled';
          b.amountPaid = b.totalMoney;
        } else if (b.status === 'delivered') {
          b.paymentStatus = 'unpaid';
          b.codStatus = 'carrier_collected';
          b.amountPaid = 0;
        } else {
          b.paymentStatus = 'unpaid';
          b.codStatus = 'uncollected';
          b.amountPaid = 0;
        }
      }
    }

    if (!b.statusHistory || b.statusHistory.length === 0) {
      b.statusHistory = [
        {
          fromStatus: '',
          toStatus: b.status,
          action: 'Khởi tạo đơn hàng',
          actor: 'Hệ thống',
          note: 'Đơn hàng được ghi nhận vào hệ thống.',
          timestamp: b.createdAt || new Date()
        }
      ];
    }

    await b.save();
    console.log(`✓ Đơn hàng [${b._id}] -> Status: ${b.status}, Payment: ${b.paymentStatus}, COD: ${b.codStatus}`);
  }

  console.log('--- HOÀN TẤT MIGRATION DỮ LIỆU AN TOÀN 100% ---');
  await mongoose.disconnect();
}

runMigration().catch(err => {
  console.error('Migration thất bại:', err);
  process.exit(1);
});
