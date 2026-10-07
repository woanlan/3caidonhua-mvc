const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/3caidonhua');
  console.log('Connected to MongoDB');

  const Category = require('../models/category');
  const Product = require('../models/product');
  const User = require('../models/user');
  const Bill = require('../models/bill');
  const BillDetail = require('../models/billdetail');

  await BillDetail.deleteMany({});
  await Bill.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});

  // 1. Categories
  const catGundam = await Category.create({ name: 'Mô hình Gundam', slug: 'mo-hinh-gundam', description: 'Các mẫu Gunpla Bandai chính hãng' });
  const catTools = await Category.create({ name: 'Bút kẻ & Dụng cụ', slug: 'but-ke-dung-cu', description: 'Kìm cắt, bút kẻ lằn, giấy nhám Gunpla' });
  const catOnePiece = await Category.create({ name: 'Mô hình One Piece', slug: 'mo-hinh-one-piece', description: 'Thuyền chiến Grand Ship One Piece' });

  // 2. Users
  const adminUser = await User.create({
    name: 'Admin Bandai',
    email: 'admin@3caidonhua.vn',
    password: 'adminpassword',
    role: 'admin',
    phone: '0909000111',
    address: 'Văn phòng Studio Gunpla, Q.1, TP.HCM'
  });

  const lanUser = await User.create({
    name: 'Nguyễn Hoàng Lân',
    email: 'cuckydangiu111@gmail.com',
    password: 'adminpassword', // or 0907652267
    role: 'admin',
    phone: '0907652267',
    address: 'TP. Hồ Chí Minh'
  });

  // 3. Products
  const p1 = await Product.create({
    name: 'RG 1/144 Hi-Nu Gundam',
    price: 1150000,
    quantity: 25,
    grade: 'RG',
    scale: '1/144',
    category: catGundam._id,
    image: '/assets/hero-poster.jpg',
    description: 'Tuyệt tác Real Grade với độ tinh xảo đỉnh cao, fin funnel linh hoạt và biên độ cử động hoàn hảo.'
  });

  const p2 = await Product.create({
    name: 'MG 1/100 Gundam Barbatos',
    price: 1100000,
    quantity: 30,
    grade: 'MG',
    scale: '1/100',
    category: catGundam._id,
    image: '/assets/hero-poster.jpg',
    description: 'Khung xương Gundam Frame hoàn chỉnh bằng kim loại giả lập, xi lanh thủy lực chuyển động thật.'
  });

  const p3 = await Product.create({
    name: 'HG 1/144 Gundam Aerial',
    price: 360000,
    quantity: 50,
    grade: 'HG',
    scale: '1/144',
    category: catGundam._id,
    image: '/assets/hero-poster.jpg',
    description: 'Bộ kit Gundam Aerial từ anime The Witch from Mercury với hiệu ứng Bit On Form ấn tượng.'
  });

  const p4 = await Product.create({
    name: 'SD Gundam RX-78-2 EX-Standard',
    price: 160000,
    quantity: 40,
    grade: 'SD',
    scale: 'Non-scale',
    category: catGundam._id,
    image: '/assets/hero-poster.jpg',
    description: 'Mô hình SD Gundam thiết kế dễ thương, dễ lắp ráp, phù hợp cho người mới bắt đầu.'
  });

  const p5 = await Product.create({
    name: 'PG 1/60 Unleashed RX-78-2 Gundam',
    price: 6200000,
    quantity: 8,
    grade: 'PG',
    scale: '1/60',
    category: catGundam._id,
    image: '/assets/hero-poster.jpg',
    description: 'Tuyệt phẩm kỷ niệm 40 năm Gunpla với cấu trúc 5 giai đoạn lắp ráp, đèn LED đa màu.'
  });

  const p6 = await Product.create({
    name: 'MG 1/100 Sazabi Ver.Ka',
    price: 2300000,
    quantity: 12,
    grade: 'MGEX',
    scale: '1/100',
    category: catGundam._id,
    image: '/assets/hero-poster.jpg',
    description: 'Thiết kế đỉnh cao của Katoki Hajime với giáp mở đa tầng, khung sườn bạc và decal nước độc quyền.'
  });

  const p7 = await Product.create({
    name: 'Kìm cắt mô hình Bandai Entry Nipper',
    price: 195000,
    quantity: 50,
    grade: 'TOOLS',
    scale: 'Non-scale',
    category: catTools._id,
    image: '/assets/hero-poster.jpg',
    description: 'Kìm cắt lưỡi thép chuyên dụng cắt runner mô hình chính hãng Bandai Spirits.'
  });

  const p8 = await Product.create({
    name: 'Mô hình Tàu Thousand Sunny Grand Ship',
    price: 480000,
    quantity: 20,
    grade: 'ONEPIECE',
    scale: 'Non-scale',
    category: catOnePiece._id,
    image: '/assets/hero-poster.jpg',
    description: 'Mô hình thuyền hải tặc Thousand Sunny của băng Mũ Rơm từ Bandai Spirits, kèm đế sóng biển.'
  });

  // 4. Bills & BillDetails
  const b1 = await Bill.create({
    user: lanUser._id,
    totalMoney: 1150000,
    paymentMethod: 'COD',
    status: 'pending',
    shippingAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    phoneNumber: '0907652267'
  });
  await BillDetail.create({
    bill: b1._id,
    product: p1._id,
    quantity: 1,
    price: 1150000
  });

  const b2 = await Bill.create({
    user: adminUser._id,
    totalMoney: 360000,
    paymentMethod: 'COD',
    status: 'confirmed',
    shippingAddress: '45 Lê Lợi, Quận Hải Châu, TP. Đà Nẵng',
    phoneNumber: '0912345678'
  });
  await BillDetail.create({
    bill: b2._id,
    product: p3._id,
    quantity: 1,
    price: 360000
  });

  const b3 = await Bill.create({
    user: lanUser._id,
    totalMoney: 1460000,
    paymentMethod: 'COD',
    status: 'shipping',
    shippingAddress: '78 Ba Đình, Quận Ba Đình, TP. Hà Nội',
    phoneNumber: '0987654321'
  });
  await BillDetail.create({
    bill: b3._id,
    product: p2._id,
    quantity: 1,
    price: 1100000
  });
  await BillDetail.create({
    bill: b3._id,
    product: p3._id,
    quantity: 1,
    price: 360000
  });

  const b4 = await Bill.create({
    user: adminUser._id,
    totalMoney: 2300000,
    paymentMethod: 'Online',
    status: 'completed',
    shippingAddress: '12 Đại lộ Hòa Bình, Ninh Kiều, TP. Cần Thơ',
    phoneNumber: '0933221100'
  });
  await BillDetail.create({
    bill: b4._id,
    product: p6._id,
    quantity: 1,
    price: 2300000
  });

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
