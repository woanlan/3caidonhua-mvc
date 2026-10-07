const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product');
const User = require('../models/user');
const Bill = require('../models/bill');
const BillDetail = require('../models/billdetail');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/3caidonhua');
  console.log('Connected to DB');

  await BillDetail.deleteMany({});
  await Bill.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});

  // 1. Categories
  const catGundam = await Category.create({ name: 'Mô hình Gundam', slug: 'mo-hinh-gundam', description: 'Các mẫu Gunpla Bandai chính hãng từ SD, HG, RG đến MG, PG' });
  const catTools = await Category.create({ name: 'Bút kẻ & Dụng cụ', slug: 'but-ke-dung-cu', description: 'Kìm cắt, bút kẻ lằn, cọ vẽ và dụng cụ chuyên dụng Gunpla' });
  const catOnePiece = await Category.create({ name: 'Mô hình One Piece', slug: 'mo-hinh-one-piece', description: 'Thuyền chiến Grand Ship One Piece chính hãng Bandai Spirits' });

  // 2. Ensure Users
  let adminUser = await User.findOne({ email: 'cuckydangiu111@gmail.com' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Nguyễn Hoàng Lân',
      email: 'cuckydangiu111@gmail.com',
      password: 'adminpassword',
      role: 'admin',
      phone: '0907652267',
      address: 'TP. Hồ Chí Minh'
    });
  }

  let lanUser = await User.findOne({ email: 'lan@gmail.com' });
  if (!lanUser) {
    lanUser = await User.create({
      name: 'Nguyễn Hoàng Lân',
      email: 'lan@gmail.com',
      password: 'userpassword',
      role: 'user',
      phone: '0907652267',
      address: 'Quận 1, TP. Hồ Chí Minh'
    });
  }

  // 3. 26 Products
  const productsData = [
    {
      name: 'SD Gundam RX-78-2 EX-Standard',
      price: 160000,
      quantity: 25,
      grade: 'SD',
      scale: 'Non-scale',
      image: '/assets/products/sd-rx78.jpg',
      category: catGundam._id,
      description: 'Mô hình SD Gundam thiết kế dễ thương, dễ lắp ráp, phù hợp cho người mới bắt đầu.'
    },
    {
      name: 'SD Gundam Barbatos Lupus Rex',
      price: 190000,
      quantity: 18,
      grade: 'SD',
      scale: 'Non-scale',
      image: '/assets/products/sd-barbatos.jpg',
      category: catGundam._id,
      description: 'Mô hình SD Gundam Barbatos Lupus Rex dạng chibi sắc nét kèm vũ khí mace siêu to.'
    },
    {
      name: 'HG 1/144 Gundam Aerial',
      price: 380000,
      quantity: 30,
      grade: 'HG',
      scale: '1/144',
      image: '/assets/products/hg-aerial.jpg',
      category: catGundam._id,
      description: 'Bộ kit Gundam Aerial từ anime The Witch from Mercury với hiệu ứng Bit On Form ấn tượng.'
    },
    {
      name: 'HG 1/144 Moon Gundam',
      price: 650000,
      quantity: 12,
      grade: 'HG',
      scale: '1/144',
      image: '/assets/products/hg-moon.jpg',
      category: catGundam._id,
      description: 'Bộ kit HG chi tiết bậc nhất vũ trụ UC, khớp nối hiện đại và mảng psycho plate hoành tráng.'
    },
    {
      name: 'HG 1/144 Gundam Aerial Rebuild',
      price: 490000,
      quantity: 22,
      grade: 'HG',
      scale: '1/144',
      image: '/assets/products/hg-aerial-rebuild.jpg',
      category: catGundam._id,
      description: 'Phiên bản nâng cấp uy lực của Aerial với khẩu pháo GUND-Bit Cannon khổng lồ.'
    },
    {
      name: 'RG 1/144 Hi-Nu Gundam',
      price: 1150000,
      quantity: 25,
      grade: 'RG',
      scale: '1/144',
      image: '/assets/products/rg-hinu.jpg',
      category: catGundam._id,
      description: 'Tuyệt tác Real Grade với độ tinh xảo đỉnh cao, fin funnel linh hoạt và biên độ cử động hoàn hảo.'
    },
    {
      name: 'RG 1/144 Sazabi Special',
      price: 1250000,
      quantity: 15,
      grade: 'RG',
      scale: '1/144',
      image: '/assets/products/rg-sazabi.jpg',
      category: catGundam._id,
      description: 'Mô hình RG Sazabi to lớn uy nghi với khung xương thép đúc và nhiều cơ chế bung giáp độc đáo.'
    },
    {
      name: 'IBO 1/100 Full Mechanics Barbatos Lupus',
      price: 850000,
      quantity: 16,
      grade: 'IBO',
      scale: '1/100',
      image: '/assets/products/ibo-barbatos.jpg',
      category: catGundam._id,
      description: 'Tỷ lệ 1/100 Full Mechanics với khung xương đúc chuẩn xác, trang bị kiếm katana và vuốt tay dũng mãnh.'
    },
    {
      name: 'RE 1/100 Gundam Nightingale',
      price: 1650000,
      quantity: 10,
      grade: 'RE',
      scale: '1/100',
      image: '/assets/products/re-nightingale.jpg',
      category: catGundam._id,
      description: 'Mẫu RE 1/100 Nightingale khổng lồ bệ vệ của Char Aznable với sải cánh và bình đẩy ngoại cỡ.'
    },
    {
      name: 'MG 1/100 Freedom Gundam Ver 2.0',
      price: 1290000,
      quantity: 14,
      grade: 'MG',
      scale: '1/100',
      image: '/assets/products/mg-freedom2.jpg',
      category: catGundam._id,
      description: 'Mô hình Master Grade Freedom 2.0 với hệ cánh mở rộng lộng lẫy và chi tiết cơ khí sắc nét.'
    },
    {
      name: 'MG 1/100 Gundam Barbatos',
      price: 1100000,
      quantity: 30,
      grade: 'MG',
      scale: '1/100',
      image: '/assets/products/mg-barbatos.jpg',
      category: catGundam._id,
      description: 'Khung xương Gundam Frame hoàn chỉnh bằng kim loại giả lập, xi lanh thủy lực chuyển động thật.'
    },
    {
      name: 'MG 1/100 Wing Gundam Zero EW Ver.Ka',
      price: 1850000,
      quantity: 12,
      grade: 'MG',
      scale: '1/100',
      image: '/assets/products/mg-wing-zero.jpg',
      category: catGundam._id,
      description: 'Biểu tượng kinh điển của cái đẹp cơ khí với đôi cánh thiên thần huyền thoại.'
    },
    {
      name: 'MG 1/100 Nu Gundam Ver.Ka',
      price: 2150000,
      quantity: 15,
      grade: 'MG',
      scale: '1/100',
      image: '/assets/products/mg-nu-vk.jpg',
      category: catGundam._id,
      description: 'Cỗ máy bất hủ của phi công huyền thoại Amuro Ray với Fin Funnel và khung Psycho-Frame.'
    },
    {
      name: 'MGEX 1/100 Strike Freedom Gundam',
      price: 3450000,
      quantity: 8,
      grade: 'MGEX',
      scale: '1/100',
      image: '/assets/products/mgex-strike-freedom.jpg',
      category: catGundam._id,
      description: 'Đỉnh cao Master Grade Extreme với khung xương mạ vàng 3 lớp kim loại cao cấp nhất lịch sử Gunpla.'
    },
    {
      name: 'MG 1/100 Sazabi Ver.Ka',
      price: 2300000,
      quantity: 12,
      grade: 'MGEX',
      scale: '1/100',
      image: '/assets/products/mg-sazabi-vk.jpg',
      category: catGundam._id,
      description: 'Thiết kế đỉnh cao của Katoki Hajime với giáp mở đa tầng, khung sườn bạc và decal nước độc quyền.'
    },
    {
      name: 'PG 1/60 Unleashed RX-78-2 Gundam',
      price: 6200000,
      quantity: 6,
      grade: 'PG',
      scale: '1/60',
      image: '/assets/products/pg-unleashed.jpg',
      category: catGundam._id,
      description: 'Tuyệt phẩm kỷ niệm 40 năm Gunpla với cấu trúc 5 giai đoạn lắp ráp, đèn LED đa màu.'
    },
    {
      name: 'Mega Size 1/48 RX-78-2 Gundam',
      price: 2150000,
      quantity: 7,
      grade: 'Mega Size',
      scale: '1/48',
      image: '/assets/products/mega-rx78.jpg',
      category: catGundam._id,
      description: 'Kích thước khổng lồ cao tới 37.5cm, các mảnh ghép to bản dễ lắp và siêu ấn tượng khi trưng bày.'
    },
    {
      name: 'Gundam Daban 8802 Strike Freedom',
      price: 720000,
      quantity: 20,
      grade: 'MG',
      scale: '1/100',
      image: '/assets/products/daban-8802.jpg',
      category: catGundam._id,
      description: 'Mô hình Gundam Daban 8802 chi tiết sắc bén phong cách Metal Build cho người chơi chuyên sâu.'
    },
    {
      name: 'Gundam Jijia Wing Zero Custom',
      price: 680000,
      quantity: 15,
      grade: 'MG',
      scale: '1/100',
      image: '/assets/products/jijia-wing.jpg',
      category: catGundam._id,
      description: 'Bộ kit ráp mẫu Wing Zero Custom từ hãng Jijia với hiệu ứng lông vũ bung cánh lộng lẫy.'
    },
    {
      name: 'Bút kẻ lằn chìm Gundam Marker GM01 Đen',
      price: 65000,
      quantity: 100,
      grade: 'TOOLS',
      scale: 'Non-scale',
      image: '/assets/products/tool-gm01.jpg',
      category: catTools._id,
      description: 'Bút ngòi kim 0.05mm chuyên dụng kẻ lằn chi tiết rãnh giáp mô hình Gundam. Mực gốc dầu cao cấp.'
    },
    {
      name: 'Bộ bút tô Gundam Metallic Marker GMS121',
      price: 320000,
      quantity: 45,
      grade: 'TOOLS',
      scale: 'Non-scale',
      image: '/assets/products/tool-gms121.jpg',
      category: catTools._id,
      description: 'Set 6 cây bút tô ánh kim loại (Vàng, Bạc, Đồng, Xanh, Đỏ kim loại) tạo điểm nhấn cơ khí.'
    },
    {
      name: 'Kìm cắt mô hình Bandai Entry Nipper',
      price: 195000,
      quantity: 50,
      grade: 'TOOLS',
      scale: 'Non-scale',
      image: '/assets/products/tool-nipper.jpg',
      category: catTools._id,
      description: 'Kìm cắt lưỡi thép chuyên dụng cắt runner mô hình chính hãng Bandai Spirits, vết cắt phẳng mịn.'
    },
    {
      name: 'Cọ vẽ & dụng cụ chuyên dụng Bandai Tool Set',
      price: 260000,
      quantity: 35,
      grade: 'TOOLS',
      scale: 'Non-scale',
      image: '/assets/products/tool-brush-set.jpg',
      category: catTools._id,
      description: 'Bộ cọ tỉa chi tiết, nhíp gắp decal và dao gọt bavia chuyên dụng cho mô hình Gunpla.'
    },
    {
      name: 'Mô hình Tàu Thousand Sunny Grand Ship',
      price: 480000,
      quantity: 20,
      grade: 'ONEPIECE',
      scale: 'Non-scale',
      image: '/assets/products/op-sunny.jpg',
      category: catOnePiece._id,
      description: 'Mô hình thuyền hải tặc Thousand Sunny của băng Mũ Rơm từ Bandai Spirits, kèm đế sóng biển.'
    },
    {
      name: 'Mô hình Tàu Going Merry Memorial Color',
      price: 490000,
      quantity: 15,
      grade: 'ONEPIECE',
      scale: 'Non-scale',
      image: '/assets/products/op-merry.jpg',
      category: catOnePiece._id,
      description: 'Mô hình thuyền Going Merry kỷ niệm màu đặc biệt, kèm đầy đủ cờ hải tặc và mỏ neo.'
    },
    {
      name: 'One Piece Grand Ship Collection Red Force',
      price: 520000,
      quantity: 18,
      grade: 'ONEPIECE',
      scale: 'Non-scale',
      image: '/assets/products/op-red-force.jpg',
      category: catOnePiece._id,
      description: 'Chiến thuyền Red Force oai vệ của Tứ Hoàng Shanks Tóc Đỏ thuộc dòng Grand Ship Collection.'
    }
  ];

  const createdProducts = await Product.insertMany(productsData);
  console.log('Seeded products:', createdProducts.length);

  // 4. Sample Bills
  const b1 = await Bill.create({
    user: adminUser._id,
    totalMoney: 1150000,
    paymentMethod: 'COD',
    status: 'pending',
    shippingAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    phoneNumber: '0907652267'
  });
  await BillDetail.create({
    bill: b1._id,
    product: createdProducts[5]._id, // RG Hi-Nu
    quantity: 1,
    price: 1150000
  });

  const b2 = await Bill.create({
    user: lanUser._id,
    totalMoney: 380000,
    paymentMethod: 'COD',
    status: 'confirmed',
    shippingAddress: '45 Lê Lợi, Quận Hải Châu, TP. Đà Nẵng',
    phoneNumber: '0912345678'
  });
  await BillDetail.create({
    bill: b2._id,
    product: createdProducts[2]._id, // HG Aerial
    quantity: 1,
    price: 380000
  });

  const b3 = await Bill.create({
    user: lanUser._id,
    totalMoney: 480000,
    paymentMethod: 'COD',
    status: 'shipping',
    shippingAddress: '78 Cầu Giấy, Hà Nội',
    phoneNumber: '0988776655'
  });
  await BillDetail.create({
    bill: b3._id,
    product: createdProducts[23]._id, // Thousand Sunny
    quantity: 1,
    price: 480000
  });

  console.log('Seeding finished successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
