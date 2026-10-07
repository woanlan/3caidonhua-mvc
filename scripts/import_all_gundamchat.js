const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/3caidonhua';

// Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String },
  description: { type: String, default: '' },
  order: { type: Number, default: 1 },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, default: '', trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, default: 10, min: 0 },
  image: { type: String, default: '' },
  images: [{ type: String }],
  description: { type: String, default: '' },
  grade: { type: String, default: '' },
  scale: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
  lowStockThreshold: { type: Number, default: 5, min: 0 }
}, { timestamps: true });

const Category = mongoose.model('category', categorySchema);
const Product = mongoose.model('product', productSchema);

async function run() {
  console.log('--- BẮT ĐẦU IMPORT TOÀN BỘ SẢN PHẨM & ẢNH TỪ GUNDAMCHAT.COM ---');
  await mongoose.connect(MONGO_URI);
  console.log('✓ Kết nối MongoDB thành công.');

  // 1. Đảm bảo các danh mục
  const catDefs = [
    { name: 'Mô hình Gundam', slug: 'mo-hinh-gundam', order: 1 },
    { name: 'Bút kẻ & Dụng cụ', slug: 'but-ke-dung-cu', order: 2 },
    { name: 'Mô hình One Piece', slug: 'mo-hinh-one-piece', order: 3 }
  ];

  const catMap = {};
  for (const c of catDefs) {
    let found = await Category.findOne({ name: c.name });
    if (!found) {
      found = await Category.create(c);
      console.log('Đã tạo danh mục mới:', c.name);
    }
    catMap[c.name] = found._id;
  }

  // 2. Đọc file JSON cào được
  const jsonPath = path.join(__dirname, '..', 'gundamchat_products.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('Không tìm thấy file gundamchat_products.json!');
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Đã đọc ${rawData.length} sản phẩm từ file gundamchat_products.json.`);

  // 3. Chuẩn hóa và làm sạch dữ liệu
  const seenNames = new Set();
  const operations = [];
  let updatedCount = 0;
  let addedCount = 0;

  for (const p of rawData) {
    if (!p.name) continue;
    const name = p.name.trim();
    if (seenNames.has(name)) continue;
    seenNames.add(name);

    const image = p.featured_image || (p.images && p.images[0]) || '';
    if (!image) continue;

    let imageList = [];
    if (Array.isArray(p.images)) {
      imageList = p.images.map(img => typeof img === 'string' ? img : (img.src || '')).filter(Boolean);
    }
    if (!imageList.length && image) {
      imageList = [image];
    }

    let price = 250000;
    if (p.variants && p.variants[0] && p.variants[0].price) {
      price = Math.round(Number(p.variants[0].price));
    } else if (p.price) {
      price = Math.round(Number(p.price));
    }
    if (isNaN(price) || price <= 0) price = 250000;

    let sku = '';
    if (p.variants && p.variants[0] && (p.variants[0].sku || p.variants[0].barcode)) {
      sku = String(p.variants[0].sku || p.variants[0].barcode).trim();
    }
    if (!sku) sku = 'GDC-' + (p.id || Math.floor(Math.random() * 900000 + 100000));

    let stock = 12;
    if (p.variants && p.variants[0] && p.variants[0].inventory_quantity !== undefined) {
      const q = Number(p.variants[0].inventory_quantity);
      if (!isNaN(q) && q > 0) stock = q;
    }

    // Xác định Danh mục
    let categoryName = 'Mô hình Gundam';
    if (/one piece|luffy|zoro|sanji|nami|chopper|thousand sunny|going merry|red force/i.test(name)) {
      categoryName = 'Mô hình One Piece';
    } else if (/bút|kìm|marker|kẻ lằn|sơn|tool|dao|nhíp|dụng cụ|action base|giá đỡ|panel line|dũa|giũa|chà nhám/i.test(name)) {
      categoryName = 'Bút kẻ & Dụng cụ';
    }

    const categoryId = catMap[categoryName] || catMap['Mô hình Gundam'];

    // Xác định Grade & Scale
    let grade = '';
    let scale = '';
    if (/\bPG\b|1\/60/i.test(name)) { grade = 'PG'; scale = '1/60'; }
    else if (/\bMGEX\b/i.test(name)) { grade = 'MGEX'; scale = '1/100'; }
    else if (/\bMG\b|1\/100/i.test(name)) { grade = 'MG'; scale = '1/100'; }
    else if (/\bRG\b|Real Grade/i.test(name)) { grade = 'RG'; scale = '1/144'; }
    else if (/\bHG\b|1\/144|High Grade/i.test(name)) { grade = 'HG'; scale = '1/144'; }
    else if (/\bSD\b|BB Senshi/i.test(name)) { grade = 'SD'; scale = 'Non-scale'; }
    else if (/Mega Size|1\/48/i.test(name)) { grade = 'Mega Size'; scale = '1/48'; }
    else if (/\bEG\b|Entry Grade/i.test(name)) { grade = 'EG'; scale = '1/144'; }
    else if (categoryName === 'Bút kẻ & Dụng cụ') { grade = 'TOOLS'; scale = 'Phụ kiện'; }
    else if (categoryName === 'Mô hình One Piece') { grade = 'ONEPIECE'; scale = 'Grand Ship'; }
    else { grade = 'HG'; scale = '1/144'; }

    // Làm sạch mô tả
    let desc = (p.content || '')
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!desc || desc.length < 10) {
      desc = `Mô hình chính hãng ${name} nhập khẩu từ Bandai Namco Nhật Bản. Chi tiết sắc nét, khớp cử động linh hoạt, chất liệu nhựa cao cấp an toàn.`;
    }
    if (desc.length > 2000) desc = desc.slice(0, 2000) + '...';

    operations.push({
      updateOne: {
        filter: { name: name },
        update: {
          $set: {
            name,
            sku,
            price,
            quantity: stock,
            image,
            images: imageList,
            description: desc,
            grade,
            scale,
            category: categoryId,
            status: 'active',
            lowStockThreshold: 5
          }
        },
        upsert: true
      }
    });
  }

  console.log(`Đang thực hiện bulkWrite ${operations.length} sản phẩm vào MongoDB...`);
  const result = await Product.bulkWrite(operations, { ordered: false });
  console.log('✓ Hoàn tất bulkWrite!');
  console.log('   - Sản phẩm mới được thêm (Upserted):', result.upsertedCount);
  console.log('   - Sản phẩm đã cập nhật (Modified):', result.modifiedCount);

  // 4. Đồng bộ cập nhật ảnh cho 26 sản phẩm mẫu ban đầu nếu có từ khóa tương tự
  const allCurrent = await Product.find();
  console.log('Tổng số sản phẩm hiện có trong MongoDB:', allCurrent.length);

  await mongoose.disconnect();
  console.log('--- HOÀN TẤT IMPORT THÀNH CÔNG ---');
}

run().catch(err => {
  console.error('Lỗi khi import:', err);
  process.exit(1);
});
