const fs = require('fs');
const path = require('path');

const DEFAULT_CATEGORIES = [
  { id: 'cat-gundam', _id: 'cat-gundam', name: 'Mô hình Gundam', slug: 'mo-hinh-gundam', description: 'Các mẫu Gunpla Bandai chính hãng từ SD, HG, RG đến MG, PG', order: 1, status: 'active' },
  { id: 'cat-tools', _id: 'cat-tools', name: 'Bút kẻ & Dụng cụ', slug: 'but-ke-dung-cu', description: 'Kìm cắt, bút kẻ lằn, cọ vẽ và dụng cụ chuyên dụng Gunpla', order: 2, status: 'active' },
  { id: 'cat-onepiece', _id: 'cat-onepiece', name: 'Mô hình One Piece', slug: 'mo-hinh-one-piece', description: 'Thuyền chiến Grand Ship One Piece chính hãng Bandai Spirits', order: 3, status: 'active' }
];

const SEED_26_PRODUCTS = [
  { id: 'p1', _id: 'p1', variantId: 'p1', sku: 'SD-RX78', name: 'SD Gundam RX-78-2 EX-Standard', price: 160000, stock: 25, quantity: 25, grade: 'SD', scale: 'Non-scale', image: 'assets/products/sd-rx78.jpg', images: ['assets/products/sd-rx78.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Mô hình SD Gundam thiết kế dễ thương, dễ lắp ráp, phù hợp cho người mới bắt đầu.' },
  { id: 'p2', _id: 'p2', variantId: 'p2', sku: 'SD-BARBATOS', name: 'SD Gundam Barbatos Lupus Rex', price: 190000, stock: 18, quantity: 18, grade: 'SD', scale: 'Non-scale', image: 'assets/products/sd-barbatos.jpg', images: ['assets/products/sd-barbatos.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Mô hình SD Gundam Barbatos Lupus Rex dạng chibi sắc nét kèm vũ khí mace siêu to.' },
  { id: 'p3', _id: 'p3', variantId: 'p3', sku: 'HG-AERIAL', name: 'HG 1/144 Gundam Aerial', price: 380000, stock: 30, quantity: 30, grade: 'HG', scale: '1/144', image: 'assets/products/hg-aerial.jpg', images: ['assets/products/hg-aerial.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Bộ kit Gundam Aerial từ anime The Witch from Mercury với hiệu ứng Bit On Form ấn tượng.' },
  { id: 'p4', _id: 'p4', variantId: 'p4', sku: 'HG-MOON', name: 'HG 1/144 Moon Gundam', price: 650000, stock: 12, quantity: 12, grade: 'HG', scale: '1/144', image: 'assets/products/hg-moon.jpg', images: ['assets/products/hg-moon.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Bộ kit HG chi tiết bậc nhất vũ trụ UC, khớp nối hiện đại và mảng psycho plate hoành tráng.' },
  { id: 'p5', _id: 'p5', variantId: 'p5', sku: 'HG-REBUILD', name: 'HG 1/144 Gundam Aerial Rebuild', price: 490000, stock: 22, quantity: 22, grade: 'HG', scale: '1/144', image: 'assets/products/hg-aerial-rebuild.jpg', images: ['assets/products/hg-aerial-rebuild.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Phiên bản nâng cấp uy lực của Aerial với khẩu pháo GUND-Bit Cannon khổng lồ.' },
  { id: 'p6', _id: 'p6', variantId: 'p6', sku: 'RG-HINU', name: 'RG 1/144 Hi-Nu Gundam', price: 1150000, stock: 25, quantity: 25, grade: 'RG', scale: '1/144', image: 'assets/products/rg-hinu.jpg', images: ['assets/products/rg-hinu.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Tuyệt tác Real Grade với độ tinh xảo đỉnh cao, fin funnel linh hoạt và biên độ cử động hoàn hảo.' },
  { id: 'p7', _id: 'p7', variantId: 'p7', sku: 'RG-SAZABI', name: 'RG 1/144 Sazabi Special', price: 1250000, stock: 15, quantity: 15, grade: 'RG', scale: '1/144', image: 'assets/products/rg-sazabi.jpg', images: ['assets/products/rg-sazabi.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Mô hình RG Sazabi to lớn uy nghi với khung xương thép đúc và nhiều cơ chế bung giáp độc đáo.' },
  { id: 'p8', _id: 'p8', variantId: 'p8', sku: 'IBO-BARBATOS', name: 'IBO 1/100 Full Mechanics Barbatos Lupus', price: 850000, stock: 16, quantity: 16, grade: 'IBO', scale: '1/100', image: 'assets/products/ibo-barbatos.jpg', images: ['assets/products/ibo-barbatos.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Tỷ lệ 1/100 Full Mechanics với khung xương đúc chuẩn xác, trang bị kiếm katana và vuốt tay dũng mãnh.' },
  { id: 'p9', _id: 'p9', variantId: 'p9', sku: 'RE-NIGHTINGALE', name: 'RE 1/100 Gundam Nightingale', price: 1650000, stock: 10, quantity: 10, grade: 'RE', scale: '1/100', image: 'assets/products/re-nightingale.jpg', images: ['assets/products/re-nightingale.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Mẫu RE 1/100 Nightingale khổng lồ bệ vệ của Char Aznable với sải cánh và bình đẩy ngoại cỡ.' },
  { id: 'p10', _id: 'p10', variantId: 'p10', sku: 'MG-FREEDOM2', name: 'MG 1/100 Freedom Gundam Ver 2.0', price: 1290000, stock: 14, quantity: 14, grade: 'MG', scale: '1/100', image: 'assets/products/mg-freedom2.jpg', images: ['assets/products/mg-freedom2.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Mô hình Master Grade Freedom 2.0 với hệ cánh mở rộng lộng lẫy và chi tiết cơ khí sắc nét.' },
  { id: 'p11', _id: 'p11', variantId: 'p11', sku: 'MG-BARBATOS', name: 'MG 1/100 Gundam Barbatos', price: 1100000, stock: 30, quantity: 30, grade: 'MG', scale: '1/100', image: 'assets/products/mg-barbatos.jpg', images: ['assets/products/mg-barbatos.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Khung xương Gundam Frame hoàn chỉnh bằng kim loại giả lập, xi lanh thủy lực chuyển động thật.' },
  { id: 'p12', _id: 'p12', variantId: 'p12', sku: 'MG-WING-ZERO', name: 'MG 1/100 Wing Gundam Zero EW Ver.Ka', price: 1850000, stock: 12, quantity: 12, grade: 'MG', scale: '1/100', image: 'assets/products/mg-wing-zero.jpg', images: ['assets/products/mg-wing-zero.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Biểu tượng kinh điển của cái đẹp cơ khí với đôi cánh thiên thần huyền thoại.' },
  { id: 'p13', _id: 'p13', variantId: 'p13', sku: 'MG-NU-VK', name: 'MG 1/100 Nu Gundam Ver.Ka', price: 2150000, stock: 15, quantity: 15, grade: 'MG', scale: '1/100', image: 'assets/products/mg-nu-vk.jpg', images: ['assets/products/mg-nu-vk.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Cỗ máy bất hủ của phi công huyền thoại Amuro Ray với Fin Funnel và khung Psycho-Frame.' },
  { id: 'p14', _id: 'p14', variantId: 'p14', sku: 'MGEX-SF', name: 'MGEX 1/100 Strike Freedom Gundam', price: 3450000, stock: 8, quantity: 8, grade: 'MGEX', scale: '1/100', image: 'assets/products/mgex-strike-freedom.jpg', images: ['assets/products/mgex-strike-freedom.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Đỉnh cao Master Grade Extreme với khung xương mạ vàng 3 lớp kim loại cao cấp nhất lịch sử Gunpla.' },
  { id: 'p15', _id: 'p15', variantId: 'p15', sku: 'MG-SAZABI-VK', name: 'MG 1/100 Sazabi Ver.Ka', price: 2300000, stock: 12, quantity: 12, grade: 'MG', scale: '1/100', image: 'assets/products/mg-sazabi-vk.jpg', images: ['assets/products/mg-sazabi-vk.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Thiết kế đỉnh cao của Katoki Hajime với giáp mở đa tầng, khung sườn bạc và decal nước độc quyền.' },
  { id: 'p16', _id: 'p16', variantId: 'p16', sku: 'PG-UNLEASHED', name: 'PG 1/60 Unleashed RX-78-2 Gundam', price: 6200000, stock: 6, quantity: 6, grade: 'PG', scale: '1/60', image: 'assets/products/pg-unleashed.jpg', images: ['assets/products/pg-unleashed.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Tuyệt phẩm kỷ niệm 40 năm Gunpla với cấu trúc 5 giai đoạn lắp ráp, đèn LED đa màu.' },
  { id: 'p17', _id: 'p17', variantId: 'p17', sku: 'MEGA-RX78', name: 'Mega Size 1/48 RX-78-2 Gundam', price: 2150000, stock: 7, quantity: 7, grade: 'Mega Size', scale: '1/48', image: 'assets/products/mega-rx78.jpg', images: ['assets/products/mega-rx78.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Kích thước khổng lồ cao tới 37.5cm, các mảnh ghép to bản dễ lắp và siêu ấn tượng khi trưng bày.' },
  { id: 'p18', _id: 'p18', variantId: 'p18', sku: 'DABAN-8802', name: 'Gundam Daban 8802 Strike Freedom', price: 720000, stock: 20, quantity: 20, grade: 'MG', scale: '1/100', image: 'assets/products/daban-8802.jpg', images: ['assets/products/daban-8802.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Daban', brandId: 2, status: 'active', description: 'Mô hình Gundam Daban 8802 chi tiết sắc bén phong cách Metal Build cho người chơi chuyên sâu.' },
  { id: 'p19', _id: 'p19', variantId: 'p19', sku: 'JIJIA-WING', name: 'Gundam Jijia Wing Zero Custom', price: 680000, stock: 15, quantity: 15, grade: 'MG', scale: '1/100', image: 'assets/products/jijia-wing.jpg', images: ['assets/products/jijia-wing.jpg'], category: 'Mô hình Gundam', categoryId: 'cat-gundam', brand: 'Jijia', brandId: 3, status: 'active', description: 'Bộ kit ráp mẫu Wing Zero Custom từ hãng Jijia với hiệu ứng lông vũ bung cánh lộng lẫy.' },
  { id: 'p20', _id: 'p20', variantId: 'p20', sku: 'TOOL-GM01', name: 'Bút kẻ lằn chìm Gundam Marker GM01 Đen', price: 65000, stock: 100, quantity: 100, grade: 'TOOLS', scale: 'Phụ kiện', image: 'assets/products/tool-gm01.jpg', images: ['assets/products/tool-gm01.jpg'], category: 'Bút kẻ & Dụng cụ', categoryId: 'cat-tools', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Bút ngòi kim 0.05mm chuyên dụng kẻ lằn chi tiết rãnh giáp mô hình Gundam. Mực gốc dầu cao cấp.' },
  { id: 'p21', _id: 'p21', variantId: 'p21', sku: 'TOOL-GMS121', name: 'Bộ bút tô Gundam Metallic Marker GMS121', price: 320000, stock: 45, quantity: 45, grade: 'TOOLS', scale: 'Phụ kiện', image: 'assets/products/tool-gms121.jpg', images: ['assets/products/tool-gms121.jpg'], category: 'Bút kẻ & Dụng cụ', categoryId: 'cat-tools', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Set 6 cây bút tô ánh kim loại (Vàng, Bạc, Đồng, Xanh, Đỏ kim loại) tạo điểm nhấn cơ khí.' },
  { id: 'p22', _id: 'p22', variantId: 'p22', sku: 'TOOL-NIPPER', name: 'Kìm cắt mô hình Bandai Entry Nipper', price: 195000, stock: 50, quantity: 50, grade: 'TOOLS', scale: 'Phụ kiện', image: 'assets/products/tool-nipper.jpg', images: ['assets/products/tool-nipper.jpg'], category: 'Bút kẻ & Dụng cụ', categoryId: 'cat-tools', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Kìm cắt lưỡi thép chuyên dụng cắt runner mô hình chính hãng Bandai Spirits, vết cắt phẳng mịn.' },
  { id: 'p23', _id: 'p23', variantId: 'p23', sku: 'TOOL-BRUSH-SET', name: 'Cọ vẽ & dụng cụ chuyên dụng Bandai Tool Set', price: 260000, stock: 35, quantity: 35, grade: 'TOOLS', scale: 'Phụ kiện', image: 'assets/products/tool-brush-set.jpg', images: ['assets/products/tool-brush-set.jpg'], category: 'Bút kẻ & Dụng cụ', categoryId: 'cat-tools', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Bộ cọ tỉa chi tiết, nhíp gắp decal và dao gọt bavia chuyên dụng cho mô hình Gunpla.' },
  { id: 'p24', _id: 'p24', variantId: 'p24', sku: 'OP-SUNNY', name: 'Mô hình Tàu Thousand Sunny Grand Ship', price: 480000, stock: 20, quantity: 20, grade: 'ONEPIECE', scale: 'Grand Ship', image: 'assets/products/op-sunny.jpg', images: ['assets/products/op-sunny.jpg'], category: 'Mô hình One Piece', categoryId: 'cat-onepiece', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Mô hình thuyền hải tặc Thousand Sunny của băng Mũ Rơm từ Bandai Spirits, kèm đế sóng biển.' },
  { id: 'p25', _id: 'p25', variantId: 'p25', sku: 'OP-MERRY', name: 'Mô hình Tàu Going Merry Memorial Color', price: 490000, stock: 15, quantity: 15, grade: 'ONEPIECE', scale: 'Grand Ship', image: 'assets/products/op-merry.jpg', images: ['assets/products/op-merry.jpg'], category: 'Mô hình One Piece', categoryId: 'cat-onepiece', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Mô hình thuyền Going Merry kỷ niệm màu đặc biệt, kèm đầy đủ cờ hải tặc và mỏ neo.' },
  { id: 'p26', _id: 'p26', variantId: 'p26', sku: 'OP-RED-FORCE', name: 'One Piece Grand Ship Collection Red Force', price: 520000, stock: 18, quantity: 18, grade: 'ONEPIECE', scale: 'Grand Ship', image: 'assets/products/op-red-force.jpg', images: ['assets/products/op-red-force.jpg'], category: 'Mô hình One Piece', categoryId: 'cat-onepiece', brand: 'Bandai Spirits', brandId: 1, status: 'active', description: 'Chiến thuyền Red Force oai vệ của Tứ Hoàng Shanks Tóc Đỏ thuộc dòng Grand Ship Collection.' }
];

let cachedProducts = null;

function getFallbackProducts() {
  if (cachedProducts) return cachedProducts;

  const candidates = [
    path.join(__dirname, '..', 'gundamchat_products.json'),
    path.join(__dirname, '..', '..', 'gundamchat_products.json'),
    path.join(__dirname, '..', 'public', 'assets', 'gundamchat_products.json'),
    path.join(__dirname, '..', 'frontend', 'assets', 'gundamchat_products.json')
  ];

  let rawData = [];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        rawData = JSON.parse(fs.readFileSync(p, 'utf8'));
        break;
      } catch (_) {}
    }
  }

  const seen = new Set(SEED_26_PRODUCTS.map(x => x.name.trim()));
  const list = [];

  rawData.forEach((p, idx) => {
    if (!p || !p.name) return;
    const name = p.name.trim();
    if (seen.has(name)) return;
    seen.add(name);

    const image = p.featured_image || (p.images && p.images[0] && (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].src)) || '';
    if (!image) return;
    const images = Array.isArray(p.images)
      ? p.images.map(img => typeof img === 'string' ? img : (img.src || '')).filter(Boolean)
      : [image];

    let price = 250000;
    if (p.variants && p.variants[0] && p.variants[0].price) price = Math.round(Number(p.variants[0].price));
    else if (p.price) price = Math.round(Number(p.price));
    if (isNaN(price) || price <= 0) price = 250000;

    let category = 'Mô hình Gundam';
    let categoryId = 'cat-gundam';
    if (/one piece|luffy|zoro|sanji|nami|chopper|thousand sunny|going merry|red force/i.test(name)) {
      category = 'Mô hình One Piece';
      categoryId = 'cat-onepiece';
    } else if (/bút|kìm|marker|kẻ lằn|sơn|tool|dao|nhíp|dụng cụ|action base|giá đỡ|panel line|dũa|giũa|chà nhám/i.test(name)) {
      category = 'Bút kẻ & Dụng cụ';
      categoryId = 'cat-tools';
    }

    let grade = 'HG', scale = '1/144';
    if (/\bPG\b|1\/60/i.test(name)) { grade = 'PG'; scale = '1/60'; }
    else if (/\bMGEX\b/i.test(name)) { grade = 'MGEX'; scale = '1/100'; }
    else if (/\bMG\b|1\/100/i.test(name)) { grade = 'MG'; scale = '1/100'; }
    else if (/\bRG\b|Real Grade/i.test(name)) { grade = 'RG'; scale = '1/144'; }
    else if (/\bHG\b|1\/144|High Grade/i.test(name)) { grade = 'HG'; scale = '1/144'; }
    else if (/\bSD\b|BB Senshi/i.test(name)) { grade = 'SD'; scale = 'Non-scale'; }
    else if (/Mega Size|1\/48/i.test(name)) { grade = 'Mega Size'; scale = '1/48'; }
    else if (category === 'Bút kẻ & Dụng cụ') { grade = 'TOOLS'; scale = 'Phụ kiện'; }
    else if (category === 'Mô hình One Piece') { grade = 'ONEPIECE'; scale = 'Grand Ship'; }

    let brand = 'Bandai Spirits', brandId = 1;
    if (/daban/i.test(name)) { brand = 'Daban'; brandId = 2; }
    else if (/jijia/i.test(name)) { brand = 'Jijia'; brandId = 3; }
    else if (/snaa/i.test(name)) { brand = 'SNAA'; brandId = 4; }

    let desc = (p.content || '').replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (!desc || desc.length < 10) {
      desc = `Mô hình chính hãng ${name} nhập khẩu từ Bandai Namco Nhật Bản. Chi tiết sắc nét, khớp cử động linh hoạt.`;
    }
    if (desc.length > 2000) desc = desc.slice(0, 2000) + '...';

    const id = String(p.id || ('gdc-' + (idx + 1)));
    const sku = (p.variants && p.variants[0] && (p.variants[0].sku || p.variants[0].barcode))
      ? String(p.variants[0].sku || p.variants[0].barcode).trim()
      : ('GDC-' + id);

    list.push({
      id,
      _id: id,
      variantId: id,
      sku,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      price,
      stock: 12,
      quantity: 12,
      status: 'active',
      lowStockThreshold: 5,
      grade,
      scale,
      category,
      categoryId,
      brand,
      brandId,
      image,
      images: images.length ? images : [image],
      description: desc
    });
  });

  cachedProducts = [...list, ...SEED_26_PRODUCTS];
  return cachedProducts;
}

function getFallbackCategories() {
  const prods = getFallbackProducts();
  return DEFAULT_CATEGORIES.map(c => ({
    ...c,
    productCount: prods.filter(p => p.categoryId === c.id || p.category === c.name).length
  }));
}

module.exports = {
  getFallbackProducts,
  getFallbackCategories
};
