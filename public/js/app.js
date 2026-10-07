import { api, user, setUser, ApiError } from './api.js';

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'SD Gundam RX-78-2 EX-Standard', slug: 'sd-rx78-2', description: 'Mô hình SD Gundam thiết kế dễ thương, dễ lắp ráp, phù hợp cho người mới bắt đầu.', categoryId: 1, brandId: 1, gradeId: 1, seriesId: 1, scale: 'Non-scale', status: 'active', grade: 'SD', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p1', sku: 'SD-RX78', price: 160000, stock: 25, reserved: 0, image: '/assets/products/sd-rx78.jpg' },
  { id: 'p2', name: 'SD Gundam Barbatos Lupus Rex', slug: 'sd-barbatos', description: 'Mô hình SD Gundam Barbatos Lupus Rex dạng chibi sắc nét kèm vũ khí mace siêu to.', categoryId: 1, brandId: 1, gradeId: 1, seriesId: 3, scale: 'Non-scale', status: 'active', grade: 'SD', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Post Disaster (IBO)', variantId: 'p2', sku: 'SD-BARBATOS', price: 190000, stock: 18, reserved: 0, image: '/assets/products/sd-barbatos.jpg' },
  { id: 'p3', name: 'HG 1/144 Gundam Aerial', slug: 'hg-aerial', description: 'Bộ kit Gundam Aerial từ anime The Witch from Mercury với hiệu ứng Bit On Form ấn tượng.', categoryId: 1, brandId: 1, gradeId: 2, seriesId: 4, scale: '1/144', status: 'active', grade: 'HG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Witch from Mercury', variantId: 'p3', sku: 'HG-AERIAL', price: 380000, stock: 30, reserved: 0, image: '/assets/products/hg-aerial.jpg' },
  { id: 'p4', name: 'HG 1/144 Moon Gundam', slug: 'hg-moon', description: 'Bộ kit HG chi tiết bậc nhất vũ trụ UC, khớp nối hiện đại và mảng psycho plate hoành tráng.', categoryId: 1, brandId: 1, gradeId: 2, seriesId: 1, scale: '1/144', status: 'active', grade: 'HG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p4', sku: 'HG-MOON', price: 650000, stock: 12, reserved: 0, image: '/assets/products/hg-moon.jpg' },
  { id: 'p5', name: 'HG 1/144 Gundam Aerial Rebuild', slug: 'hg-aerial-rebuild', description: 'Phiên bản nâng cấp uy lực của Aerial với khẩu pháo GUND-Bit Cannon khổng lồ.', categoryId: 1, brandId: 1, gradeId: 2, seriesId: 4, scale: '1/144', status: 'active', grade: 'HG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Witch from Mercury', variantId: 'p5', sku: 'HG-REBUILD', price: 490000, stock: 22, reserved: 0, image: '/assets/products/hg-aerial-rebuild.jpg' },
  { id: 'p6', name: 'RG 1/144 Hi-Nu Gundam', slug: 'rg-hi-nu', description: 'Tuyệt tác Real Grade với độ tinh xảo đỉnh cao, fin funnel linh hoạt và biên độ cử động hoàn hảo.', categoryId: 1, brandId: 1, gradeId: 3, seriesId: 1, scale: '1/144', status: 'active', grade: 'RG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p6', sku: 'RG-HINU', price: 1150000, stock: 25, reserved: 0, image: '/assets/products/rg-hinu.jpg' },
  { id: 'p7', name: 'RG 1/144 Sazabi Special', slug: 'rg-sazabi', description: 'Mô hình RG Sazabi to lớn uy nghi với khung xương thép đúc và nhiều cơ chế bung giáp độc đáo.', categoryId: 1, brandId: 1, gradeId: 3, seriesId: 1, scale: '1/144', status: 'active', grade: 'RG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p7', sku: 'RG-SAZABI', price: 1250000, stock: 15, reserved: 0, image: '/assets/products/rg-sazabi.jpg' },
  { id: 'p8', name: 'IBO 1/100 Full Mechanics Barbatos Lupus', slug: 'ibo-barbatos', description: 'Tỷ lệ 1/100 Full Mechanics với khung xương đúc chuẩn xác, trang bị kiếm katana và vuốt tay dũng mãnh.', categoryId: 1, brandId: 1, gradeId: 4, seriesId: 3, scale: '1/100', status: 'active', grade: 'IBO', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Post Disaster (IBO)', variantId: 'p8', sku: 'IBO-BARBATOS', price: 850000, stock: 16, reserved: 0, image: '/assets/products/ibo-barbatos.jpg' },
  { id: 'p9', name: 'RE 1/100 Gundam Nightingale', slug: 're-nightingale', description: 'Mẫu RE 1/100 Nightingale khổng lồ bệ vệ của Char Aznable với sải cánh và bình đẩy ngoại cỡ.', categoryId: 1, brandId: 1, gradeId: 5, seriesId: 1, scale: '1/100', status: 'active', grade: 'RE', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p9', sku: 'RE-NIGHTINGALE', price: 1650000, stock: 10, reserved: 0, image: '/assets/products/re-nightingale.jpg' },
  { id: 'p10', name: 'MG 1/100 Freedom Gundam Ver 2.0', slug: 'mg-freedom-2', description: 'Mô hình Master Grade Freedom 2.0 với hệ cánh mở rộng lộng lẫy và chi tiết cơ khí sắc nét.', categoryId: 1, brandId: 1, gradeId: 6, seriesId: 2, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Cosmic Era (SEED)', variantId: 'p10', sku: 'MG-FREEDOM2', price: 1290000, stock: 14, reserved: 0, image: '/assets/products/mg-freedom2.jpg' },
  { id: 'p11', name: 'MG 1/100 Gundam Barbatos', slug: 'mg-barbatos', description: 'Khung xương Gundam Frame hoàn chỉnh bằng kim loại giả lập, xi lanh thủy lực chuyển động thật.', categoryId: 1, brandId: 1, gradeId: 6, seriesId: 3, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Post Disaster (IBO)', variantId: 'p11', sku: 'MG-BARBATOS', price: 1100000, stock: 30, reserved: 0, image: '/assets/products/mg-barbatos.jpg' },
  { id: 'p12', name: 'MG 1/100 Wing Gundam Zero EW Ver.Ka', slug: 'mg-wing-zero', description: 'Biểu tượng kinh điển của cái đẹp cơ khí với đôi cánh thiên thần huyền thoại.', categoryId: 1, brandId: 1, gradeId: 6, seriesId: 1, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'After Colony (Wing)', variantId: 'p12', sku: 'MG-WING-ZERO', price: 1850000, stock: 12, reserved: 0, image: '/assets/products/mg-wing-zero.jpg' },
  { id: 'p13', name: 'MG 1/100 Nu Gundam Ver.Ka', slug: 'mg-nu-vk', description: 'Cỗ máy bất hủ của phi công huyền thoại Amuro Ray với Fin Funnel và khung Psycho-Frame.', categoryId: 1, brandId: 1, gradeId: 6, seriesId: 1, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p13', sku: 'MG-NU-VK', price: 2150000, stock: 15, reserved: 0, image: '/assets/products/mg-nu-vk.jpg' },
  { id: 'p14', name: 'MGEX 1/100 Strike Freedom Gundam', slug: 'mgex-strike-freedom', description: 'Đỉnh cao Master Grade Extreme với khung xương mạ vàng 3 lớp kim loại cao cấp nhất lịch sử Gunpla.', categoryId: 1, brandId: 1, gradeId: 7, seriesId: 2, scale: '1/100', status: 'active', grade: 'MGEX', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Cosmic Era (SEED)', variantId: 'p14', sku: 'MGEX-SF', price: 3450000, stock: 8, reserved: 0, image: '/assets/products/mgex-strike-freedom.jpg' },
  { id: 'p15', name: 'MG 1/100 Sazabi Ver.Ka', slug: 'mg-sazabi-verka', description: 'Thiết kế đỉnh cao của Katoki Hajime với giáp mở đa tầng, khung sườn bạc và decal nước độc quyền.', categoryId: 1, brandId: 1, gradeId: 6, seriesId: 1, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p15', sku: 'MG-SAZABI-VK', price: 2300000, stock: 12, reserved: 0, image: '/assets/products/mg-sazabi-vk.jpg' },
  { id: 'p16', name: 'PG 1/60 Unleashed RX-78-2 Gundam', slug: 'pg-unleashed-rx78', description: 'Tuyệt phẩm kỷ niệm 40 năm Gunpla với cấu trúc 5 giai đoạn lắp ráp, đèn LED đa màu.', categoryId: 1, brandId: 1, gradeId: 8, seriesId: 1, scale: '1/60', status: 'active', grade: 'PG', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p16', sku: 'PG-UNLEASHED', price: 6200000, stock: 6, reserved: 0, image: '/assets/products/pg-unleashed.jpg' },
  { id: 'p17', name: 'Mega Size 1/48 RX-78-2 Gundam', slug: 'mega-size-rx78', description: 'Kích thước khổng lồ cao tới 37.5cm, các mảnh ghép to bản dễ lắp và siêu ấn tượng khi trưng bày.', categoryId: 1, brandId: 1, gradeId: 9, seriesId: 1, scale: '1/48', status: 'active', grade: 'Mega Size', category: 'Mô hình Gundam', brand: 'Bandai Spirits', series: 'Universal Century', variantId: 'p17', sku: 'MEGA-RX78', price: 2150000, stock: 7, reserved: 0, image: '/assets/products/mega-rx78.jpg' },
  { id: 'p18', name: 'Gundam Daban 8802 Strike Freedom', slug: 'daban-strike-freedom', description: 'Mô hình Gundam Daban 8802 chi tiết sắc bén phong cách Metal Build cho người chơi chuyên sâu.', categoryId: 1, brandId: 2, gradeId: 6, seriesId: 2, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Daban', series: 'Cosmic Era (SEED)', variantId: 'p18', sku: 'DABAN-8802', price: 720000, stock: 20, reserved: 0, image: '/assets/products/daban-8802.jpg' },
  { id: 'p19', name: 'Gundam Jijia Wing Zero Custom', slug: 'jijia-wing-zero', description: 'Bộ kit ráp mẫu Wing Zero Custom từ hãng Jijia với hiệu ứng lông vũ bung cánh lộng lẫy.', categoryId: 1, brandId: 3, gradeId: 6, seriesId: 1, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Jijia', series: 'After Colony (Wing)', variantId: 'p19', sku: 'JIJIA-WING', price: 680000, stock: 15, reserved: 0, image: '/assets/products/jijia-wing.jpg' },
  { id: 'p20', name: 'Bút kẻ lằn chìm Gundam Marker GM01 Đen', slug: 'gundam-marker-gm01', description: 'Bút ngòi kim 0.05mm chuyên dụng kẻ lằn chi tiết rãnh giáp mô hình Gundam. Mực gốc dầu cao cấp.', categoryId: 2, brandId: 1, gradeId: null, seriesId: 6, scale: 'Non-scale', status: 'active', grade: '', category: 'Bút kẻ & Dụng cụ', brand: 'Bandai Spirits', series: 'Hobby Tools', variantId: 'p20', sku: 'TOOL-GM01', price: 65000, stock: 100, reserved: 0, image: '/assets/products/tool-gm01.jpg' },
  { id: 'p21', name: 'Bộ bút tô Gundam Metallic Marker GMS121', slug: 'metallic-marker-gms121', description: 'Set 6 cây bút tô ánh kim loại (Vàng, Bạc, Đồng, Xanh, Đỏ kim loại) tạo điểm nhấn cơ khí.', categoryId: 2, brandId: 1, gradeId: null, seriesId: 6, scale: 'Non-scale', status: 'active', grade: '', category: 'Bút kẻ & Dụng cụ', brand: 'Bandai Spirits', series: 'Hobby Tools', variantId: 'p21', sku: 'TOOL-GMS121', price: 320000, stock: 45, reserved: 0, image: '/assets/products/tool-gms121.jpg' },
  { id: 'p22', name: 'Kìm cắt mô hình Bandai Entry Nipper', slug: 'bandai-nipper', description: 'Kìm cắt lưỡi thép chuyên dụng cắt runner mô hình chính hãng Bandai Spirits, vết cắt phẳng mịn.', categoryId: 2, brandId: 1, gradeId: null, seriesId: 6, scale: 'Non-scale', status: 'active', grade: '', category: 'Bút kẻ & Dụng cụ', brand: 'Bandai Spirits', series: 'Hobby Tools', variantId: 'p22', sku: 'TOOL-NIPPER', price: 195000, stock: 50, reserved: 0, image: '/assets/products/tool-nipper.jpg' },
  { id: 'p23', name: 'Cọ vẽ & dụng cụ chuyên dụng Bandai Tool Set', slug: 'bandai-tool-set', description: 'Bộ cọ tỉa chi tiết, nhíp gắp decal và dao gọt bavia chuyên dụng cho mô hình Gunpla.', categoryId: 2, brandId: 1, gradeId: null, seriesId: 6, scale: 'Non-scale', status: 'active', grade: '', category: 'Bút kẻ & Dụng cụ', brand: 'Bandai Spirits', series: 'Hobby Tools', variantId: 'p23', sku: 'TOOL-BRUSH-SET', price: 260000, stock: 35, reserved: 0, image: '/assets/products/tool-brush-set.jpg' },
  { id: 'p24', name: 'Mô hình Tàu Thousand Sunny Grand Ship', slug: 'onepiece-thousand-sunny', description: 'Mô hình thuyền hải tặc Thousand Sunny của băng Mũ Rơm từ Bandai Spirits, kèm đế sóng biển.', categoryId: 3, brandId: 1, gradeId: null, seriesId: 5, scale: 'Non-scale', status: 'active', grade: '', category: 'Mô hình One Piece', brand: 'Bandai Spirits', series: 'One Piece Grand Ship', variantId: 'p24', sku: 'OP-SUNNY', price: 480000, stock: 20, reserved: 0, image: '/assets/products/op-sunny.jpg' },
  { id: 'p25', name: 'Mô hình Tàu Going Merry Memorial Color', slug: 'onepiece-going-merry', description: 'Mô hình thuyền Going Merry kỷ niệm màu đặc biệt, kèm đầy đủ cờ hải tặc và mỏ neo.', categoryId: 3, brandId: 1, gradeId: null, seriesId: 5, scale: 'Non-scale', status: 'active', grade: '', category: 'Mô hình One Piece', brand: 'Bandai Spirits', series: 'One Piece Grand Ship', variantId: 'p25', sku: 'OP-MERRY', price: 490000, stock: 15, reserved: 0, image: '/assets/products/op-merry.jpg' },
  { id: 'p26', name: 'One Piece Grand Ship Collection Red Force', slug: 'onepiece-red-force', description: 'Chiến thuyền Red Force oai vệ của Tứ Hoàng Shanks Tóc Đỏ thuộc dòng Grand Ship Collection.', categoryId: 3, brandId: 1, gradeId: null, seriesId: 5, scale: 'Non-scale', status: 'active', grade: '', category: 'Mô hình One Piece', brand: 'Bandai Spirits', series: 'One Piece Grand Ship', variantId: 'p26', sku: 'OP-RED-FORCE', price: 520000, stock: 18, reserved: 0, image: '/assets/products/op-red-force.jpg' }
];

let products = [], cart = [], orders = [], adminProducts = [], adminUsers = [];
let metadata = { categories: [], brands: [], grades: [], series: [] };
let grade = 'all', tab = 'overview', pending = false, adminReady = false;
let catalogPage = 1, catalogPageSize = 24;
let discountPercent = 0, appliedDiscountCode = '';
let adminSearchQuery = '', adminFilterGrade = 'all', adminFilterStatus = 'all', adminFilterRole = 'all';
let adminFilterPayStatus = 'all', adminFilterStock = 'all', adminFilterCat = 'all';
let adminTimeRange = 'this_month', adminStatsData = null;
let adminPage = 1, adminPageSize = 10;
let adminProductPage = 1, adminProductPageSize = 10;
let adminSidebarCollapsed = false;
let currentDetailQty = 1;
let currentAuthMode = 'login';
let registeredEmailPrefill = '';
let registerSuccessNotice = '';
let currentAccountTab = 'orders';
let trackingQueryResult = null;
let trackingSearchKeyword = '';

const $ = (s) => document.querySelector(s);
const input = (s) => document.querySelector(s);
const panel = document.querySelector('#panel');
const video = document.querySelector('#hero-video');
const money = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const orderStatusLabels = {
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

const allowedTransitions = {
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

const paymentStatusLabels = {
  unpaid: 'Chưa thanh toán',
  partially_paid: 'Thanh toán một phần',
  paid: 'Đã thanh toán',
  partially_refunded: 'Hoàn tiền một phần',
  refunded: 'Đã hoàn tiền'
};

const codStatusLabels = {
  uncollected: 'Chưa thu COD',
  carrier_collected: 'ĐVVC đã thu tiền',
  reconciled: 'Đã đối soát vào ví'
};

const statuses = orderStatusLabels;
const nextStatuses = allowedTransitions;

let timer;
function toast(message) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = message;
  t.classList.add('visible');
  clearTimeout(timer);
  timer = setTimeout(() => t.classList.remove('visible'), 3500);
}

function openPanel(title, body) {
  $('#panel-title').textContent = title;
  $('#panel-body').innerHTML = body;
  if (!panel.open) panel.showModal();
  document.body.style.overflow = 'hidden';
}

function showError(e) {
  toast(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
  if (e instanceof ApiError && e.status === 401) {
    setUser(null);
    adminReady = false;
    cart = [];
    count();
  }
}

async function run(fn) {
  if (pending) return;
  pending = true;
  try {
    await fn();
  } catch (e) {
    showError(e);
  } finally {
    pending = false;
  }
}

function count() {
  const el = $('.cart-count');
  if (el) el.textContent = String(cart.reduce((s, x) => s + x.quantity, 0));
}

async function refreshCart() {
  try {
    cart = user ? await api('/cart') : [];
  } catch (e) {
    cart = [];
  }
  count();
}

function setGrade(value) {
  grade = value;
  catalogPage = 1;
  const buttonGrade = (value === 'RE') ? 'IBO' : value;
  document.querySelectorAll('[data-grade]').forEach(b => {
    const isSelected = b.dataset.grade === buttonGrade;
    b.classList.toggle('selected', isSelected);
    b.setAttribute('aria-pressed', String(isSelected));
  });
  renderProducts();
}

function renderProducts() {
  const query = (input('#search')?.value || '').toLowerCase().trim();
  const brandSelect = document.querySelector('#brand-select')?.value || 'all';
  let found = products.filter(p => {
    let matchGrade = false;
    if (grade === 'all') {
      matchGrade = true;
    } else if (grade === 'IBO' || grade === 'RE') {
      matchGrade = (p.grade === 'IBO' || p.grade === 'RE' || p.grade === 'RE/100');
    } else if (grade === 'TOOLS') {
      matchGrade = (p.grade === 'TOOLS' || (p.category && (p.category.toLowerCase().includes('bút') || p.category.toLowerCase().includes('dụng cụ'))));
    } else if (grade === 'ONEPIECE') {
      matchGrade = (p.grade === 'ONEPIECE' || (p.category && p.category.toLowerCase().includes('one piece')));
    } else {
      matchGrade = (p.grade === grade);
    }

    let matchBrand = true;
    if (brandSelect !== 'all') {
      matchBrand = p.brand && p.brand.toLowerCase().includes(brandSelect.toLowerCase());
    }

    let matchQuery = true;
    if (query) {
      const fullText = `${p.name} ${p.sku || ''} ${p.brand || ''} ${p.series || ''} ${p.category || ''} ${p.grade || ''} ${p.description || ''}`.toLowerCase();
      matchQuery = fullText.includes(query);
    }

    return matchGrade && matchBrand && matchQuery;
  });
  const sort = input('#sort')?.value || 'featured';
  if (sort === 'price-up') found.sort((a, b) => a.price - b.price);
  if (sort === 'price-down') found.sort((a, b) => b.price - a.price);

  const totalPages = Math.max(1, Math.ceil(found.length / catalogPageSize));
  if (catalogPage > totalPages) catalogPage = totalPages;
  if (catalogPage < 1) catalogPage = 1;
  const paged = found.slice((catalogPage - 1) * catalogPageSize, catalogPage * catalogPageSize);

  if ($('#result-count')) {
    $('#result-count').textContent = `${found.length.toLocaleString('vi-VN')} mô hình & sản phẩm (Trang ${catalogPage} / ${totalPages})`;
  }

  if ($('#products')) {
    $('#products').innerHTML = paged.map(renderProductCardHtml).join('') || '<div class="empty"><strong>Chưa tìm thấy mô hình</strong>Thử chọn dòng sản phẩm hoặc từ khóa khác.</div>';
  }

  // Render pagination buttons
  const paginEl = $('#catalog-pagination');
  if (paginEl) {
    if (totalPages <= 1) {
      paginEl.innerHTML = '';
    } else {
      let pagesHtml = '';
      pagesHtml += `<button type="button" class="button" data-catalog-page="1" ${catalogPage === 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : 'style="min-height:38px;padding:6px 14px;"'}>« Trang đầu</button>`;
      pagesHtml += `<button type="button" class="button" data-catalog-page="${catalogPage - 1}" ${catalogPage === 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : 'style="min-height:38px;padding:6px 12px;"'}>‹ Trước</button>`;

      let startP = Math.max(1, catalogPage - 2);
      let endP = Math.min(totalPages, startP + 4);
      if (endP - startP < 4) startP = Math.max(1, endP - 4);
      if (startP < 1) startP = 1;

      for (let p = startP; p <= endP; p++) {
        const isCur = p === catalogPage;
        pagesHtml += `<button type="button" class="button ${isCur ? 'primary' : ''}" data-catalog-page="${p}" style="min-height:38px;padding:6px 14px;${isCur ? 'background:var(--red,#e60012);color:#fff;font-weight:800;' : ''}">${p}</button>`;
      }

      pagesHtml += `<button type="button" class="button" data-catalog-page="${catalogPage + 1}" ${catalogPage === totalPages ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : 'style="min-height:38px;padding:6px 12px;"'}>Sau ›</button>`;
      pagesHtml += `<button type="button" class="button" data-catalog-page="${totalPages}" ${catalogPage === totalPages ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : 'style="min-height:38px;padding:6px 14px;"'}>Trang cuối »</button>`;

      paginEl.innerHTML = pagesHtml;
    }
  }
}

function getProductDiscount(p) {
  if (p.originalPrice && p.originalPrice > p.price) {
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }
  const discountRates = [8, 10, 12, 14, 15, 18, 20, 25];
  const str = String(p.id || p._id || p.name || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  return discountRates[Math.abs(hash) % discountRates.length];
}

function renderProductCardHtml(p) {
  const pid = p.id || p._id || p.variantId;
  const gradeClass = (p.grade || 'kit').toLowerCase().replace(/[^a-z0-9]/g, '');
  const inStock = ((p.stock !== undefined ? p.stock : p.quantity) ?? 0) > 0;
  const imgSrc = esc(p.image || '/assets/hero-poster.jpg');
  const disc = getProductDiscount(p);
  const oldPrice = p.originalPrice || Math.round((p.price / (1 - disc / 100)) / 10000) * 10000;
  const brandName = esc(p.brand || 'Bandai Spirits');
  const gradeLabel = esc(p.grade || 'MÔ HÌNH');

  return `<article class="product-card">
    <a href="#product-${pid}" class="product-image">
      <img src="${imgSrc}" loading="lazy" width="300" height="300" alt="${esc(p.name)}" onerror="this.src='/assets/hero-poster.jpg'">
      <span class="gdc-discount-badge">-${disc}%</span>
      <span class="image-badge badge-${gradeClass}">${gradeLabel}</span>
      <span class="image-note">${brandName}</span>
    </a>
    <div class="product-body">
      <div class="product-meta">
        <span class="stock-indicator ${inStock ? '' : 'out'}"></span>
        <span>${inStock ? 'Còn hàng' : 'Tạm hết'}</span>
        <span>·</span>
        <span>${brandName}</span>
      </div>
      <h3 title="${esc(p.name)}"><a href="#product-${pid}">${esc(p.name)}</a></h3>
      <div class="product-price-row">
        <span class="price">${money(p.price)}</span>
        <span class="price-old">${money(oldPrice)}</span>
      </div>
      <div class="product-bottom">
        <button class="add-button" data-add="${pid}" aria-label="Thêm ${esc(p.name)} vào giỏ" ${inStock ? '' : 'disabled'}>
          ${inStock ? 'Thêm giỏ +' : 'Hết hàng'}
        </button>
      </div>
    </div>
  </article>`;
}

function renderHomeFeatured() {
  const list = (products && products.length) ? products : DEFAULT_PRODUCTS;

  // 1. MÔ HÌNH MỚI VỀ (#home-new-products) - 12 sản phẩm mới nhất
  const newGrid = $('#home-new-products');
  if (newGrid) {
    const newItems = list.slice(0, 12);
    newGrid.innerHTML = newItems.map(renderProductCardHtml).join('');
  }

  // 2. MÔ HÌNH SNAA (#home-snaa-products) - 12 sản phẩm SNAA
  const snaaGrid = $('#home-snaa-products');
  if (snaaGrid) {
    const snaaItems = list.filter(p => /snaa/i.test(p.name) || /snaa/i.test(p.brand || '') || /snaa/i.test(p.series || '')).slice(0, 12);
    snaaGrid.innerHTML = (snaaItems.length ? snaaItems : list.slice(12, 24)).map(renderProductCardHtml).join('');
  }

  // 3. MÔ HÌNH GUNDAM BANDAI HOT (#home-bandai-products) - 12 sản phẩm Bandai
  const bandaiGrid = $('#home-bandai-products');
  if (bandaiGrid) {
    const bandaiItems = list.filter(p => {
      const isSnaa = /snaa/i.test(p.name) || /snaa/i.test(p.brand || '') || /snaa/i.test(p.series || '');
      const isTool = p.grade === 'TOOLS' || /dụng cụ|kìm|dao|nhíp|marker|bút|tamiya/i.test((p.category || '') + ' ' + (p.name || ''));
      if (isSnaa || isTool) return false;
      return /bandai/i.test(p.brand || '') || /gundam|hg|rg|mg|pg|sd/i.test(p.name || '');
    }).slice(0, 12);
    bandaiGrid.innerHTML = (bandaiItems.length ? bandaiItems : list.slice(0, 12)).map(renderProductCardHtml).join('');
  }

  // 4. DỤNG CỤ & PHỤ KIỆN LẮP RÁP (#home-tools-products) - 12 sản phẩm dụng cụ
  const toolsGrid = $('#home-tools-products');
  if (toolsGrid) {
    const toolItems = list.filter(p => p.grade === 'TOOLS' || /dụng cụ|kìm|dao|nhíp|marker|tamiya|bút|giấy nhám|sơn|cement|thước/i.test((p.category || '') + ' ' + (p.name || ''))).slice(0, 12);
    toolsGrid.innerHTML = (toolItems.length ? toolItems : list.slice(24, 36)).map(renderProductCardHtml).join('');
  }
}

async function refreshProducts() {
  try {
    const list = await api('/products');
    products = list && list.length ? list : DEFAULT_PRODUCTS;
  } catch (e) {
    products = DEFAULT_PRODUCTS;
  }
  renderProducts();
  renderHomeFeatured();
}

/* ==========================================================================
   DIRTYCOINS-STYLE DEDICATED PRODUCT DETAIL PAGE (Image 3)
   ========================================================================== */
function renderProductDetailPage(id) {
  const p = products.find(x => x.id == id || x._id == id);
  const container = $('#page-product-detail');
  if (!p || !container) {
    toast('Không tìm thấy sản phẩm.');
    location.hash = 'catalog';
    return;
  }

  currentDetailQty = 1;
  const inStock = p.stock > 0;
  const galleryImages = (p.images && p.images.length > 0) ? p.images : [p.image || '/assets/hero-poster.jpg'];

  const thumbnailsHtml = galleryImages.map((imgUrl, idx) => {
    const isActive = idx === 0 ? 'active' : '';
    return `<button type="button" class="pdetail-thumb-btn ${isActive}" data-switch-thumb="${idx}" data-img-src="${esc(imgUrl)}" title="Ảnh chi tiết ${idx + 1}">
      <img src="${esc(imgUrl)}" alt="${esc(p.name)} - Ảnh ${idx + 1}" onerror="this.src='/assets/hero-poster.jpg'">
    </button>`;
  }).join('');

  container.innerHTML = `
    <div class="pdetail-container">
      <div class="pdetail-breadcrumb">
        <a href="#home">Trang chủ</a>
        <span>›</span>
        <a href="#catalog">Bộ sưu tập</a>
        <span>›</span>
        <span style="color:#ffffff;font-weight:600;">${esc(p.name)}</span>
      </div>

      <div class="pdetail-layout">
        <!-- CỘT 1 (BÊN TRÁI): THÔNG TIN DẠNG ACCORDION (Theo ảnh 3 DirtyCoins) -->
        <div class="pdetail-left-col">
          <div class="pdetail-accordion">
            <div class="pdetail-acc-item" id="acc-info">
              <button type="button" class="pdetail-acc-header" data-toggle-acc="info">
                <span>Thông tin chi tiết sản phẩm</span>
                <span class="pdetail-acc-icon">›</span>
              </button>
              <div class="pdetail-acc-body">
                <p style="margin-bottom:12px;">${esc(p.description)}</p>
                <div style="font-size:13px;line-height:1.8;">
                  <div>• <strong>Thương hiệu:</strong> ${esc(p.brand || 'Bandai Spirits')}</div>
                  <div>• <strong>Phân cấp (Grade):</strong> ${esc(p.grade || 'HG')}</div>
                  <div>• <strong>Tỷ lệ (Scale):</strong> ${esc(p.scale || '1/144')}</div>
                  <div>• <strong>Anime/Series:</strong> ${esc(p.series || 'Gundam Universe')}</div>
                  <div>• <strong>Mã sản phẩm:</strong> ${esc(p.sku)}</div>
                </div>
                ${galleryImages.length > 1 ? `
                <div class="pdetail-extra-gallery" style="margin-top:16px;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">HÌNH ẢNH CHI TIẾT MÔ HÌNH (${galleryImages.length} ẢNH)</div>
                  <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;">
                    ${galleryImages.map((imgUrl, i) => `
                      <a href="${esc(imgUrl)}" target="_blank" title="Xem ảnh lớn ${i + 1}" style="display:block;border-radius:6px;overflow:hidden;border:1px solid #1e2638;background:#0a0e15;">
                        <img src="${esc(imgUrl)}" alt="${esc(p.name)} - Ảnh ${i + 1}" style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block;" onerror="this.src='/assets/hero-poster.jpg'">
                      </a>
                    `).join('')}
                  </div>
                </div>` : ''}
              </div>
            </div>

            <div class="pdetail-acc-item" id="acc-ship">
              <button type="button" class="pdetail-acc-header" data-toggle-acc="ship">
                <span>Chính sách vận chuyển</span>
                <span class="pdetail-acc-icon">›</span>
              </button>
              <div class="pdetail-acc-body">
                <p>• <strong>Miễn phí vận chuyển toàn quốc</strong> cho tất cả đơn hàng.</p>
                <p>• Thời gian giao hàng: Nội thành 1 – 2 ngày, liên tỉnh 2 – 4 ngày làm việc.</p>
                <p>• Đóng gói chuẩn sưu tầm: Thùng carton 3 lớp chèn xốp bóng khí bảo vệ tối đa hộp mô hình.</p>
              </div>
            </div>

            <div class="pdetail-acc-item" id="acc-store">
              <button type="button" class="pdetail-acc-header" data-toggle-acc="store">
                <span>Cửa hàng còn hàng &amp; Đổi trả</span>
                <span class="pdetail-acc-icon">›</span>
              </button>
              <div class="pdetail-acc-body">
                <p>• <strong>Studio Store:</strong> Sẵn hàng tại cửa hàng TP. Hồ Chí Minh.</p>
                <p>• Kiểm tra sản phẩm và phụ kiện khi nhận hàng.</p>
                <p>• Đổi mới 100% trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CỘT 2 (Ở GIỮA): THUMBNAILS & HÌNH ẢNH SẢN PHẨM (Theo ảnh 3 DirtyCoins) -->
        <div class="pdetail-center-col">
          <div class="pdetail-gallery">
            <div class="pdetail-thumbnails">
              ${thumbnailsHtml}
            </div>
            <div class="pdetail-main-img-box">
              <img id="pdetail-main-image" src="${esc(galleryImages[0] || p.image || '/assets/hero-poster.jpg')}" alt="${esc(p.name)}">
            </div>
          </div>
        </div>

        <!-- CỘT 3 (BÊN PHẢI): BẢNG MUA HÀNG (Theo ảnh 3 DirtyCoins) -->
        <div class="pdetail-right-col">
          <span class="pdetail-pill-tag">HÀNG MỚI VỀ</span>
          <h1 class="pdetail-title">${esc(p.name)}</h1>
          <div class="pdetail-price">${money(p.price)}</div>

          <div class="pdetail-meta-row">
            <span>Phân loại:</span> <strong>${esc(p.grade || 'HG')} · ${esc(p.scale || '1/144')}</strong>
          </div>

          <div class="pdetail-option-label">Tỷ lệ mô hình:</div>
          <div class="pdetail-sizes">
            <button type="button" class="pdetail-size-btn active">${esc(p.scale || '1/144')}</button>
            <button type="button" class="pdetail-size-btn" disabled>1/100</button>
            <button type="button" class="pdetail-size-btn" disabled>1/60</button>
          </div>

          <div class="pdetail-qty-row">
            <span class="pdetail-option-label" style="margin:0;">Số lượng:</span>
            <div class="pdetail-qty-stepper">
              <button type="button" id="pdetail-minus" aria-label="Giảm số lượng">−</button>
              <input type="number" id="pdetail-qty-input" min="1" max="${p.stock || 15}" value="1" aria-label="Số lượng muốn mua">
              <button type="button" id="pdetail-plus" aria-label="Tăng số lượng">+</button>
            </div>
            <span class="pdetail-stock-hint">${inStock ? `Còn hàng (${p.stock} bộ)` : 'Tạm hết hàng'}</span>
          </div>

          <div class="pdetail-actions">
            <button type="button" class="pdetail-btn-buy-now" data-pdetail-buy="${p.id}" ${inStock ? '' : 'disabled'}>
              ${inStock ? 'MUA NGAY' : 'TẠM HẾT HÀNG'}
            </button>
            <button type="button" class="pdetail-btn-add-cart" data-pdetail-cart="${p.id}" ${inStock ? '' : 'disabled'}>
              THÊM VÀO GIỎ HÀNG
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  window.scrollTo(0, 0);
}

function loginPanel(register = false) {
  if (panel && panel.open) panel.close();
  currentAuthMode = register ? 'register' : 'login';
  location.hash = register ? 'register' : 'login';
}

/* ==========================================================================
   DEDICATED AUTHENTICATION PAGE (#login, #register, #auth)
   ========================================================================== */
function renderAuthPage(mode, prefillEmail, successMessage) {
  if (mode) currentAuthMode = mode;
  if (prefillEmail !== undefined) registeredEmailPrefill = prefillEmail;
  if (successMessage !== undefined) registerSuccessNotice = successMessage;

  const container = $('#page-auth');
  if (!container) return;

  if (user) {
    location.hash = 'account';
    return;
  }

  const isRegister = currentAuthMode === 'register';

  container.innerHTML = `
    <div class="auth-page-container">
      <div class="auth-top-brand">
        <a href="#home" class="auth-logo-box" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;"><img src="/assets/logo3cai.png" alt="3CAIDONHUA" style="height:36px;width:auto;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(230,0,18,0.5));"><span>3CAIDONHUA<span class="dot">®</span></span></a>
        <a href="#home" class="auth-back-link">← Quay lại trang chủ</a>
      </div>

      <div class="auth-card">
        <div class="auth-badge">${isRegister ? 'ĐĂNG KÝ THÀNH VIÊN' : 'CỬA HÀNG GUNPLA STUDIO'}</div>
        <h1 class="auth-title">${isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập Studio'}</h1>
        <p class="auth-subtitle">
          ${isRegister
            ? 'Đăng ký thành viên để lưu địa chỉ giao hàng, theo dõi lộ trình đơn hàng thời gian thực và nhận ưu đãi độc quyền.'
            : 'Chào mừng bạn quay trở lại. Vui lòng đăng nhập để tiếp tục mua sắm và quản lý đơn hàng.'}
        </p>

        ${registerSuccessNotice && !isRegister ? `
          <div class="auth-success-banner">
            <span style="font-size:18px;line-height:1;">✓</span>
            <div>${esc(registerSuccessNotice)}</div>
          </div>
        ` : ''}

        <div class="auth-tabs">
          <button type="button" class="auth-tab-btn ${!isRegister ? 'active' : ''}" data-switch-auth="login">Đăng nhập</button>
          <button type="button" class="auth-tab-btn ${isRegister ? 'active' : ''}" data-switch-auth="register">Đăng ký tài khoản</button>
        </div>

        ${isRegister ? `
          <form id="dedicated-register-form">
            <div class="auth-form-group">
              <label>Họ và tên *</label>
              <input name="name" type="text" placeholder="Ví dụ: Nguyễn Hoàng Lân" required maxlength="100">
            </div>

            <div class="auth-form-group">
              <label>Email đăng nhập *</label>
              <input name="email" type="email" placeholder="name@example.com" required maxlength="255">
            </div>

            <div class="auth-form-group">
              <label>Số điện thoại nhận hàng *</label>
              <input name="phone" type="tel" placeholder="Ví dụ: 0907652267" required pattern="[0-9+ ()-]{9,20}">
            </div>

            <div class="auth-form-group">
              <label>Địa chỉ giao hàng mặc định *</label>
              <input name="address" type="text" placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, TP" required maxlength="500">
            </div>

            <div class="auth-form-group">
              <label>Mật khẩu *</label>
              <input id="reg-pw" name="password" type="password" placeholder="Tối thiểu 6 ký tự" minlength="6" maxlength="128" required>
              <button type="button" class="auth-pw-toggle" data-toggle-pw="reg-pw" title="Hiện/ẩn mật khẩu">👁️</button>
            </div>

            <div class="auth-form-group">
              <label>Xác nhận mật khẩu *</label>
              <input id="reg-confirm-pw" name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu vừa tạo" minlength="6" maxlength="128" required>
              <button type="button" class="auth-pw-toggle" data-toggle-pw="reg-confirm-pw" title="Hiện/ẩn mật khẩu">👁️</button>
            </div>

            <div style="background:rgba(255,255,255,0.03);border:1px dashed var(--line);border-radius:6px;padding:11px 14px;font-size:12px;color:#9da5b0;margin-bottom:18px;line-height:1.6;">
              🔒 <strong>Chính sách đăng ký:</strong> Sau khi hoàn tất đăng ký tài khoản mới, hệ thống sẽ đưa bạn về màn hình đăng nhập để bạn chủ động đăng nhập bằng thông tin vừa tạo (tuyệt đối không tự động đăng nhập).
            </div>

            <button type="submit" class="auth-btn-submit">Hoàn tất đăng ký tài khoản</button>

            <div style="text-align:center;margin-top:18px;font-size:13px;color:#9da5b0;">
              Đã có tài khoản Studio?
              <button type="button" class="text-button" data-switch-auth="login" style="color:var(--red);font-weight:700;margin-left:4px;">Đăng nhập ngay →</button>
            </div>
          </form>
        ` : `
          <form id="dedicated-login-form">
            <div class="auth-form-group">
              <label>Email tài khoản *</label>
              <input id="login-email-input" name="email" type="email" placeholder="name@example.com" value="${esc(registeredEmailPrefill)}" required maxlength="255">
            </div>

            <div class="auth-form-group">
              <label>Mật khẩu *</label>
              <input id="login-pw-input" name="password" type="password" placeholder="Nhập mật khẩu của bạn" minlength="6" maxlength="128" required>
              <button type="button" class="auth-pw-toggle" data-toggle-pw="login-pw-input" title="Hiện/ẩn mật khẩu" style="display:inline-flex;align-items:center;justify-content:center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>

            <button type="submit" class="auth-btn-submit">Đăng nhập ngay</button>

            <div class="auth-demo-box">
              <div class="auth-demo-title" style="display:flex;align-items:center;gap:6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Tài khoản thử nghiệm nhanh</span>
              </div>
              <div class="auth-demo-actions">
                <button type="button" class="auth-demo-btn" data-quick-fill="admin" style="display:inline-flex;align-items:center;gap:6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span>Admin (Lân Nguyễn)</span>
                </button>
                <button type="button" class="auth-demo-btn" data-quick-fill="customer" style="display:inline-flex;align-items:center;gap:6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Khách hàng mẫu</span>
                </button>
              </div>
            </div>

            <div style="text-align:center;margin-top:18px;font-size:13px;color:#9da5b0;">
              Chưa có tài khoản?
              <button type="button" class="text-button" data-switch-auth="register" style="color:var(--red);font-weight:700;margin-left:4px;">Đăng ký tài khoản mới →</button>
            </div>
          </form>
        `}
      </div>
    </div>
  `;
  window.scrollTo(0, 0);
}

async function addToCart(id, qty = 1) {
  const p = products.find(x => x.id == id || x._id == id || x.variantId == id);
  if (!p) { toast('Sản phẩm không còn bán.'); return false; }
  const maxStock = ((p.stock !== undefined ? p.stock : p.quantity) ?? 0);
  if (maxStock <= 0) {
    toast(`Rất xin lỗi quý khách! Sản phẩm "${p.name}" hiện đã tạm hết hàng.`);
    return false;
  }
  const targetId = p.variantId || p.id || p._id;
  const currentQuantity = cart.find(x => x.variantId == targetId || x.id == targetId)?.quantity || 0;
  const quantity = currentQuantity + qty;

  if (quantity > maxStock) {
    toast(`Rất xin lỗi quý khách! Hiện tại shop chỉ còn ${maxStock} cái trong kho.`);
    return false;
  }

  try {
    cart = await api('/cart/items/' + targetId, 'PUT', { quantity });
    count();
    toast('Đã thêm ' + p.name + ' vào giỏ hàng.');
    return true;
  } catch (err) {
    toast(err.message || 'Không thể thêm vào giỏ hàng.');
    return false;
  }
}

function cartPanel() {
  if (!cart.length) {
    openPanel('Giỏ hàng của bạn', `
      <div class="empty"><strong>Giỏ hàng đang trống</strong>Khám phá các mẫu Gunpla mới nhất để bắt đầu hoàn thiện bộ sưu tập.</div>
      <button class="button primary wide" data-action="shop">Khám phá mô hình →</button>
    `);
    return;
  }
  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);
  openPanel('Giỏ hàng của bạn', `
    <div class="cart-shipping-bar"><span style="color:var(--emerald);font-weight:700">✓</span><span><strong>Miễn phí vận chuyển</strong> toàn quốc cho mọi đơn hàng</span></div>
    <div class="cart-list">${cart.map(p => `
      <div class="cart-line">
        <div style="display:flex;gap:12px;align-items:center;">
          <img src="${esc(p.image || '/assets/hero-poster.jpg')}" alt="${esc(p.name)}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid var(--line);flex-shrink:0;">
          <div>
            <h3 style="font-size:14px;margin-bottom:2px;">${esc(p.name)}</h3>
            <span class="muted">${money(p.price)}</span>
            <div class="quantity" style="margin-top:6px;">
              <button data-qty="${p.variantId || p.id}" data-delta="-1" aria-label="Giảm số lượng">−</button>
              <span>${p.quantity}</span>
              <button data-qty="${p.variantId || p.id}" data-delta="1" aria-label="Tăng số lượng">+</button>
            </div>
          </div>
        </div>
        <div style="text-align:right">
          <strong>${money(p.quantity * p.price)}</strong><br>
          <button class="text-button" data-remove="${p.variantId || p.id}" style="margin-top:8px;">Xóa</button>
        </div>
      </div>`).join('')}
    </div>
    <div class="total-row"><span>Tổng tiền hàng</span><strong>${money(total)}</strong></div>
    <button class="button primary wide" data-action="checkout">Tiến hành đặt hàng →</button>
  `);
}

function checkout() {
  if (panel && panel.open) panel.close();
  location.hash = 'checkout';
}

/* ==========================================================================
   DIRTYCOINS-STYLE DEDICATED CHECKOUT PAGE (#checkout)
   ========================================================================== */
function renderDedicatedCheckout() {
  const container = $('#page-checkout');
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="dirty-checkout-container">
        <div class="dirty-top-brand">
          <a href="#home" class="dirty-logo-box" style="text-decoration:none;display:inline-flex;align-items:center;"><img src="/assets/logo3cai.png" alt="3CAIDONHUA" style="height:64px;width:auto;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(230,0,18,0.3));"></a>
          <a href="#catalog" class="dirty-back-link" style="display:inline-flex;align-items:center;gap:6px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Quay lại cửa hàng</span></a>
        </div>
        <div class="dirty-card" style="text-align:center;padding:50px 20px;">
          <div style="width:72px;height:72px;border-radius:50%;background:#f3f4f6;color:#9ca3af;display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </div>
          <h3 style="font-size:20px;font-weight:800;margin-bottom:8px;color:#111827;">Giỏ hàng của bạn đang trống</h3>
          <p style="color:#6b7280;margin-bottom:24px;max-width:440px;margin-left:auto;margin-right:auto;">Hãy chọn cho mình bộ kit Gunpla hoặc mô hình yêu thích từ Bandai Spirits để tiếp tục thanh toán.</p>
          <a href="#catalog" class="button primary" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;">
            <span>Khám phá bộ sưu tập</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </a>
        </div>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce((s, p) => s + p.price * p.quantity, 0);
  const discountAmount = discountPercent > 0 ? Math.round(subtotal * discountPercent / 100) : 0;
  const shippingFee = 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  container.innerHTML = `
    <div class="dirty-checkout-container">
      <div class="dirty-top-brand">
        <a href="#home" class="dirty-logo-box" style="text-decoration:none;display:inline-flex;align-items:center;"><img src="/assets/logo3cai.png" alt="3CAIDONHUA" style="height:64px;width:auto;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(230,0,18,0.3));"></a>
        <a href="#catalog" class="dirty-back-link" style="display:inline-flex;align-items:center;gap:6px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Tiếp tục mua sắm</span></a>
      </div>

      <div class="dirty-layout-grid">
        <div class="dirty-left-col">
          <div class="dirty-login-card">
            <div>
              ${user ? `
                <strong>Xin chào, ${esc(user.name)}</strong>
                <div style="font-size:13px;color:#6b7280;margin-top:2px;">Tài khoản: ${esc(user.email)}</div>
              ` : `
                <strong>Đăng nhập để nhận ưu đãi và lưu địa chỉ nhận hàng</strong>
                <div style="font-size:13px;color:#6b7280;margin-top:2px;">Theo dõi đơn hàng và tích lũy điểm thưởng thành viên</div>
              `}
            </div>
            <button type="button" class="dirty-login-btn" data-action="${user ? 'account' : 'login'}">
              ${user ? 'Tài khoản' : 'Đăng nhập'}
            </button>
          </div>

          <form id="checkout-form">
            <div class="dirty-card">
              <h3 class="dirty-card-title">Thông tin giao hàng</h3>
              <div class="dirty-form-group">
                <input name="recipient" class="dirty-input" placeholder="Họ và tên người nhận *" value="${esc(user?.name || '')}" required maxlength="100">
              </div>
              <div class="dirty-form-group">
                <div class="dirty-phone-wrap">
                  <input name="phone" type="tel" class="dirty-input" placeholder="Số điện thoại *" value="${esc(user?.phone || '0907652267')}" required pattern="[0-9+ ()-]{9,20}">
                  <span class="dirty-flag" title="Việt Nam">🇻🇳</span>
                </div>
              </div>
              <div class="dirty-form-group">
                <input name="email" type="email" class="dirty-input" placeholder="Email nhận thông tin đơn hàng *" value="${esc(user?.email || '')}" required maxlength="255">
              </div>
              <div class="dirty-form-group">
                <input class="dirty-input" value="Việt Nam" readonly style="background:#f9fafb;cursor:not-allowed;color:#6b7280;">
              </div>
              <div class="dirty-form-group">
                <input name="address" class="dirty-input" placeholder="Địa chỉ chi tiết (Số nhà, tên đường...) *" value="${esc(user?.address || '123 Đường Nguyễn Huệ')}" required maxlength="500">
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
                <input name="city" class="dirty-input" placeholder="Tỉnh / Thành phố" value="TP. Hồ Chí Minh">
                <input name="district" class="dirty-input" placeholder="Quận / Huyện, Phường / Xã" value="Quận 1">
              </div>
              <div class="dirty-form-group">
                <textarea name="note" class="dirty-input" rows="2" placeholder="Ghi chú đơn hàng (ví dụ: giao giờ hành chính, đóng gói cẩn thận...)"></textarea>
              </div>
            </div>

            <div class="dirty-card">
              <h3 class="dirty-card-title">Phương thức giao hàng</h3>
              <label class="dirty-radio-box active">
                <input type="radio" name="shippingMethod" value="standard" checked>
                <div style="flex:1;">
                  <strong>Giao hàng tiêu chuẩn toàn quốc</strong>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px;">Thời gian dự kiến 2 – 4 ngày làm việc</div>
                </div>
                <strong style="color:#059669;font-size:14px;">Miễn phí</strong>
              </label>
            </div>

            <div class="dirty-card">
              <h3 class="dirty-card-title">Phương thức thanh toán</h3>
              <label class="dirty-radio-box active" style="margin-bottom:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;">
                <input type="radio" name="paymentMethod" value="COD" checked>
                <div style="flex:1;">
                  <strong style="font-size:14.5px;color:#1e293b;">Thanh toán khi nhận hàng</strong>
                </div>
                <div style="width:40px;height:40px;border-radius:10px;background:#ecfdf5;border:1px solid #a7f3d0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M6 12h.01M18 12h.01"/>
                  </svg>
                </div>
              </label>

              <label class="dirty-radio-box" style="margin-bottom:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;">
                <input type="radio" name="paymentMethod" value="VIETQR">
                <div style="flex:1;">
                  <strong style="font-size:14.5px;color:#0284c7;">Chuyển khoản VietQR</strong>
                </div>
                <div style="width:40px;height:40px;border-radius:10px;background:#f0f9ff;border:1px solid #bae6fd;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/>
                  </svg>
                </div>
              </label>

              <label class="dirty-radio-box" style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;">
                <input type="radio" name="paymentMethod" value="MOMO">
                <div style="flex:1;">
                  <strong style="font-size:14.5px;color:#d82d8b;">Ví điện tử MoMo</strong>
                </div>
                <div style="width:40px;height:40px;border-radius:10px;background:#fdf2f8;border:1px solid #fbcfe8;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <div style="width:26px;height:26px;border-radius:6px;background:linear-gradient(135deg, #d82d8b, #a50064);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(216,45,139,0.35);">
                    M
                  </div>
                </div>
              </label>
            </div>
          </form>
        </div>

        <div class="dirty-right-col">
          <div class="dirty-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 class="dirty-card-title" style="margin:0;">Giỏ hàng</h3>
              <span style="font-size:13px;color:#6b7280;font-weight:600;">${cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm</span>
            </div>
            <div class="dirty-items-list">
              ${cart.map(p => `
                <div class="dirty-item-row">
                  <div class="dirty-item-thumb">
                    <img src="${esc(p.image || '/assets/hero-poster.jpg')}" alt="${esc(p.name)}">
                  </div>
                  <div class="dirty-item-info">
                    <div class="dirty-item-name" title="${esc(p.name)}">${esc(p.name)}</div>
                    <div class="dirty-item-variant">${esc(p.grade || 'Mô hình')} · ${esc(p.scale || '1/144')}</div>
                    <div class="dirty-item-price-row">
                      <div class="dirty-stepper">
                        <button type="button" data-checkout-qty="${p.variantId || p.id}" data-delta="-1">−</button>
                        <span>${p.quantity}</span>
                        <button type="button" data-checkout-qty="${p.variantId || p.id}" data-delta="1">+</button>
                      </div>
                      <div class="dirty-item-price">${money(p.price * p.quantity)}</div>
                      <button type="button" class="dirty-trash-btn" data-checkout-remove="${p.variantId || p.id}" title="Xóa">🗑️</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="dirty-card">
            <div class="dirty-promo-select" id="promo-select-trigger">
              <span>🎫 ${appliedDiscountCode ? `Đang dùng: <strong>${appliedDiscountCode}</strong> (-${discountPercent}%)` : 'Chọn mã khuyến mãi có sẵn'}</span>
              <span style="color:#6b7280;font-size:13px;">${appliedDiscountCode ? 'Hủy mã ×' : 'Chọn mã >'}</span>
            </div>
            <div class="dirty-promo-input-wrap">
              <input type="text" id="promo-input" class="dirty-input" placeholder="Mã giảm giá (GUNPLA10, BANDAI...)" value="${appliedDiscountCode}">
              <button type="button" id="promo-btn" class="dirty-apply-btn">Áp dụng</button>
            </div>
            ${appliedDiscountCode ? `<div style="margin-top:8px;font-size:12px;color:#059669;font-weight:600;">✓ Giảm ngay ${discountPercent}% trên tổng đơn hàng</div>` : ''}
          </div>

          <div class="dirty-card">
            <div class="dirty-summary-row">
              <span>Tổng tiền hàng</span>
              <strong>${money(subtotal)}</strong>
            </div>
            <div class="dirty-summary-row">
              <span>Phí vận chuyển</span>
              <span style="color:#059669;font-weight:600;">Miễn phí</span>
            </div>
            ${discountAmount > 0 ? `
              <div class="dirty-summary-row" style="color:#dc2626;">
                <span>Giảm giá (${appliedDiscountCode})</span>
                <strong>-${money(discountAmount)}</strong>
              </div>
            ` : ''}
            <div class="dirty-summary-total">
              <span>Tổng thanh toán</span>
              <span class="dirty-total-val">${money(finalTotal)}</span>
            </div>
            <div class="dirty-vat-note">(Đã bao gồm thuế VAT nếu có)</div>
            <button type="submit" form="checkout-form" class="dirty-order-btn">Đặt hàng ngay</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function applyPromoCode(code) {
  if (!code) {
    discountPercent = 0;
    appliedDiscountCode = '';
    renderDedicatedCheckout();
    toast('Đã hủy áp dụng mã khuyến mãi.');
    return;
  }
  const promoMap = { 'GUNPLA10': 10, 'BANDAI': 15, 'FREESHIP': 5, 'STUDIO': 20, 'GIAMGIA10': 10 };
  if (promoMap[code]) {
    discountPercent = promoMap[code];
    appliedDiscountCode = code;
    renderDedicatedCheckout();
    toast(`Áp dụng mã ${code} thành công (-${discountPercent}%)!`);
  } else {
    toast('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
  }
}

function renderCheckoutSuccess(o, body, discount = 0, code = '') {
  const container = $('#page-checkout');
  if (!container) return;
  const codeStr = o.code || ('HD' + Date.now().toString().slice(-6));
  const orderId = o.id || o._id || (o.bill ? o.bill._id : '');
  const totalAmount = (o.bill && o.bill.totalMoney) ? o.bill.totalMoney : (o.total || 0);

  const isVietQr = body.paymentMethod === 'VIETQR';
  const isMomo = body.paymentMethod === 'MOMO';

  const tcbQrUrl = `https://img.vietqr.io/image/TCB-8888868650-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(codeStr)}&accountName=NGUYEN%20HOANG%20LAN`;
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent('2|99|0903456917|NGUYEN HOANG LAN||0|0|' + totalAmount + '|' + codeStr)}`;

  const paymentQrBox = isVietQr ? `
    <div id="qr-payment-container-${esc(orderId)}" style="background:#ffffff;border:2px solid #0284c7;border-radius:14px;padding:22px;margin-bottom:24px;text-align:center;box-shadow:0 8px 24px rgba(2,132,199,0.12);">
      <div style="display:inline-flex;align-items:center;gap:8px;background:#e0f2fe;color:#0369a1;padding:7px 18px;border-radius:24px;font-size:13px;font-weight:700;margin-bottom:12px;letter-spacing:0.3px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>QUÉT MÃ VIETQR ĐỂ THANH TOÁN TỰ ĐỘNG</span>
      </div>
      <p style="color:#64748b;font-size:13px;margin-bottom:14px;">Mở ứng dụng ngân hàng bất kỳ (Techcombank, Vietcombank, MB, MoMo...) và quét mã bên dưới:</p>
      
      <div style="display:inline-block;background:#ffffff;padding:10px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 4px 16px rgba(0,0,0,0.06);margin-bottom:16px;">
        <img src="${tcbQrUrl}" alt="VietQR Techcombank" style="width:260px;height:260px;display:block;border-radius:8px;">
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;max-width:440px;margin:0 auto 14px auto;text-align:left;font-size:13.5px;line-height:1.9;">
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Ngân hàng:</span><strong>Techcombank (TCB)</strong></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Số tài khoản:</span><strong style="color:#0284c7;font-size:16px;letter-spacing:1px;">8888868650</strong></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Chủ tài khoản:</span><strong>NGUYEN HOANG LAN</strong></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Số tiền cần thanh toán:</span><strong style="color:#e60012;font-size:16px;">${money(totalAmount)}</strong></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;">Nội dung chuyển khoản:</span>
          <span style="background:#e0f2fe;color:#0369a1;padding:2px 10px;border-radius:4px;font-weight:800;letter-spacing:0.5px;">${esc(codeStr)}</span>
        </div>
      </div>

      <div style="background:#f0fdf4;border:1px dashed #16a34a;border-radius:8px;padding:9px 14px;max-width:440px;margin:0 auto 16px auto;display:flex;align-items:center;justify-content:center;gap:9px;font-size:12.5px;color:#15803d;font-weight:600;">
        <span style="position:relative;display:inline-flex;width:10px;height:10px;">
          <span style="animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;position:absolute;display:inline-flex;height:100%;width:100%;border-radius:50%;background:#4ade80;opacity:0.75;"></span>
          <span style="position:relative;display:inline-flex;border-radius:50%;width:10px;height:10px;background:#16a34a;"></span>
        </span>
        <span>Hệ thống đang chờ nhận tiền &amp; tự động lên đơn chuẩn bị hàng...</span>
      </div>

      <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
        <button type="button" class="button" data-confirm-transfer="${esc(orderId)}" style="background:#059669;color:#ffffff;border:none;min-height:44px;padding:12px 22px;font-weight:700;box-shadow:0 4px 14px rgba(5,150,105,0.28);display:inline-flex;align-items:center;gap:8px;border-radius:8px;cursor:pointer;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Tôi đã chuyển khoản - Lên đơn ngay</span>
        </button>
        <button type="button" class="button" data-simulate-transfer="${esc(orderId)}" style="background:#f0f9ff;color:#0284c7;border:1px solid #bae6fd;min-height:44px;padding:12px 18px;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:7px;border-radius:8px;cursor:pointer;" title="Mô phỏng Webhook SePay báo nhận tiền sau 3 giây để demo chấm điểm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Giả lập tiền về (3s)</span>
        </button>
        <a href="${tcbQrUrl}" download="VietQR-${esc(codeStr)}.png" target="_blank" class="button" style="background:#ffffff;color:#334155;border:1px solid #cbd5e1;min-height:44px;padding:12px 18px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:7px;border-radius:8px;text-decoration:none;cursor:pointer;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Tải mã QR</span>
        </a>
      </div>
    </div>
  ` : (isMomo ? `
    <div id="qr-payment-container-${esc(orderId)}" style="background:#ffffff;border:2px solid #d82d8b;border-radius:14px;padding:22px;margin-bottom:24px;text-align:center;box-shadow:0 8px 24px rgba(216,45,139,0.12);">
      <div style="display:inline-flex;align-items:center;gap:8px;background:#fdf2f8;color:#be185d;padding:7px 18px;border-radius:24px;font-size:13px;font-weight:700;margin-bottom:12px;letter-spacing:0.3px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="16" y1="8" x2="16" y2="16"/></svg>
        <span>QUÉT MÃ QR VÍ ĐIỆN TỬ MOMO</span>
      </div>
      <p style="color:#64748b;font-size:13px;margin-bottom:14px;">Mở ứng dụng Ví MoMo trên điện thoại và quét mã bên dưới để thanh toán:</p>
      
      <div style="display:inline-block;background:#ffffff;padding:10px;border-radius:12px;border:1px solid #fbcfe8;box-shadow:0 4px 16px rgba(0,0,0,0.06);margin-bottom:16px;">
        <img src="${momoQrUrl}" alt="MoMo QR" style="width:260px;height:260px;display:block;border-radius:8px;">
      </div>

      <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;padding:16px;max-width:440px;margin:0 auto 14px auto;text-align:left;font-size:13.5px;line-height:1.9;">
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Ví điện tử:</span><strong style="color:#d82d8b;">MoMo</strong></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Số điện thoại ví:</span><strong style="color:#be185d;font-size:16px;letter-spacing:1px;">0903456917</strong></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Chủ ví MoMo:</span><strong>NGUYEN HOANG LAN</strong></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Số tiền cần thanh toán:</span><strong style="color:#e60012;font-size:16px;">${money(totalAmount)}</strong></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;">Lời nhắn chuyển ví:</span>
          <span style="background:#fce7f3;color:#9d174d;padding:2px 10px;border-radius:4px;font-weight:800;letter-spacing:0.5px;">${esc(codeStr)}</span>
        </div>
      </div>

      <div style="background:#fdf2f8;border:1px dashed #f472b6;border-radius:8px;padding:9px 14px;max-width:440px;margin:0 auto 16px auto;display:flex;align-items:center;justify-content:center;gap:9px;font-size:12.5px;color:#be185d;font-weight:600;">
        <span style="position:relative;display:inline-flex;width:10px;height:10px;">
          <span style="animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;position:absolute;display:inline-flex;height:100%;width:100%;border-radius:50%;background:#f472b6;opacity:0.75;"></span>
          <span style="position:relative;display:inline-flex;border-radius:50%;width:10px;height:10px;background:#ec4899;"></span>
        </span>
        <span>Hệ thống đang chờ biến động số dư MoMo &amp; tự động lên đơn...</span>
      </div>

      <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
        <button type="button" class="button" data-confirm-transfer="${esc(orderId)}" style="background:#d82d8b;color:#ffffff;border:none;min-height:44px;padding:12px 22px;font-weight:700;box-shadow:0 4px 14px rgba(216,45,139,0.28);display:inline-flex;align-items:center;gap:8px;border-radius:8px;cursor:pointer;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Tôi đã chuyển tiền MoMo - Lên đơn ngay</span>
        </button>
        <button type="button" class="button" data-simulate-transfer="${esc(orderId)}" style="background:#fdf2f8;color:#be185d;border:1px solid #fbcfe8;min-height:44px;padding:12px 18px;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:7px;border-radius:8px;cursor:pointer;" title="Mô phỏng MoMo báo nhận tiền sau 3 giây để demo chấm điểm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Giả lập tiền về (3s)</span>
        </button>
        <a href="https://me.momo.vn/0903456917" target="_blank" class="button" style="background:#ffffff;color:#be185d;border:1px solid #fbcfe8;min-height:44px;padding:12px 18px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:7px;border-radius:8px;text-decoration:none;cursor:pointer;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          <span>Mở MoMo App</span>
        </a>
      </div>
    </div>
  ` : '');

  container.innerHTML = `
    <div class="dirty-checkout-container">
      <div class="dirty-top-brand">
        <a href="#home" class="dirty-logo-box" style="text-decoration:none;display:inline-flex;align-items:center;"><img src="/assets/logo3cai.png" alt="3CAIDONHUA" style="height:64px;width:auto;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(230,0,18,0.3));"></a>
        <a href="#catalog" class="dirty-back-link" style="display:inline-flex;align-items:center;gap:6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Về trang sản phẩm</span>
        </a>
      </div>
      <div class="dirty-success-card">
        <div class="dirty-success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style="font-size:24px;font-weight:800;color:#111827;margin-bottom:8px;">Đặt hàng thành công!</h2>
        <p style="color:#4b5563;margin-bottom:20px;font-size:15px;">
          Mã đơn hàng: <strong style="color:#e60012;font-size:19px;letter-spacing:0.5px;">${esc(codeStr)}</strong>
        </p>
        ${paymentQrBox}
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;text-align:left;font-size:13.5px;line-height:1.8;margin-bottom:28px;">
          <div><strong style="color:#374151;">Người nhận:</strong> ${esc(body.recipient)}</div>
          <div><strong style="color:#374151;">Số điện thoại:</strong> ${esc(body.phone)}</div>
          <div><strong style="color:#374151;">Địa chỉ giao hàng:</strong> ${esc(body.address)}</div>
          <div><strong style="color:#374151;">Phương thức vận chuyển:</strong> Giao hàng tiêu chuẩn toàn quốc - Miễn phí</div>
          <div><strong style="color:#374151;">Hình thức thanh toán:</strong> ${body.paymentMethod === 'MOMO' ? 'Ví điện tử MoMo' : (body.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Thanh toán khi nhận hàng')}</div>
          ${body.note ? `<div><strong style="color:#374151;">Ghi chú:</strong> ${esc(body.note)}</div>` : ''}
          ${discount > 0 ? `<div><strong style="color:#059669;">Khuyến mãi đã áp:</strong> Mã ${esc(code)} (-${discount}%)</div>` : ''}
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <a href="#catalog" class="button" style="background:#111827;color:#ffffff;border:none;min-height:46px;padding:12px 24px;display:inline-flex;align-items:center;gap:8px;text-decoration:none;border-radius:8px;">
            <span>Tiếp tục mua hàng</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </a>
          <button type="button" class="button" data-action="account" style="color:#111827;border:1px solid #d1d5db;background:#ffffff;min-height:46px;padding:12px 24px;display:inline-flex;align-items:center;gap:8px;border-radius:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>Xem lịch sử đơn hàng</span>
          </button>
          <button type="button" class="button" data-track-code="${esc(codeStr)}" style="color:var(--red);border:1px solid var(--red);background:#ffffff;min-height:46px;padding:12px 24px;font-weight:700;display:inline-flex;align-items:center;gap:8px;border-radius:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Theo dõi tiến trình đơn này</span>
          </button>
        </div>
      </div>
    </div>
  `;
  window.scrollTo(0, 0);
}

async function account() {
  if (panel && panel.open) panel.close();
  if (!user) { loginPanel(); return; }
  location.hash = 'account';
}

/* ==========================================================================
   ORDER TRACKING & CUSTOMER ACCOUNT PAGE (#account, #orders, #tracking)
   ========================================================================== */
function renderMiniStepper(status) {
  // SVG Vector Icons sắc nét chuẩn Luxury / Mecha Studio
  const ICONS = {
    order: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>`,
    pack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12.01 20.71 7"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    ship: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    done: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    cancel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
  };

  const steps = [
    { label: 'Đặt hàng thành công', icon: ICONS.order },
    { label: 'Chuẩn bị hàng', icon: ICONS.pack },
    { label: 'Đang giao hàng', icon: ICONS.ship },
    { label: 'Giao thành công', icon: ICONS.done }
  ];

  if (status === 'cancelled') {
    return `
      <div class="tracking-stepper-wrapper">
        <div class="tracking-stepper" style="justify-content:center;">
          <div class="tracking-step cancelled" style="width:auto;">
            <div class="tracking-step-dot" style="background:rgba(239,68,68,0.15);border-color:#ef4444;color:#ef4444;">
              ${ICONS.cancel}
            </div>
            <div class="tracking-step-label" style="color:#ef4444;font-weight:700;">ĐƠN HÀNG ĐÃ HỦY</div>
          </div>
        </div>
      </div>
    `;
  }

  // Logic tiến trình:
  // 1. Khi đơn được tạo (pending / Chờ xác nhận): Khách đã đặt đơn thành công (bước 0 = done), Shop đang tiếp nhận/chuẩn bị (bước 1 = active)
  // 2. Khi shop xác nhận (confirmed / processing): Đã xác nhận & đang đóng gói (bước 0 = done, bước 1 = active)
  // 3. Khi vận chuyển (shipping / delivered): Bưu tá đang giao (bước 0,1 = done, bước 2 = active)
  // 4. Khi hoàn thành (completed): Đã giao hàng thành công (tất cả 4 bước = done)
  let doneCount = 1;
  let activeIdx = 1;

  if (status === 'pending') {
    doneCount = 1;
    activeIdx = 1;
  } else if (status === 'confirmed' || status === 'processing') {
    doneCount = 1;
    activeIdx = 1;
  } else if (status === 'shipping' || status === 'delivered') {
    doneCount = 2;
    activeIdx = 2;
  } else if (status === 'completed') {
    doneCount = 4;
    activeIdx = -1;
  }

  // pct tính theo thanh nối giữa 4 điểm mốc (0%, 33.33%, 66.67%, 100%)
  let pct = 0;
  if (doneCount === 1) pct = 33.33;
  else if (doneCount === 2) pct = 66.67;
  else if (doneCount >= 3) pct = 100;

  return `
    <div class="tracking-stepper-wrapper">
      <div class="tracking-stepper">
        <div class="tracking-stepper-bar">
          <div class="tracking-stepper-line" style="width: ${pct}%;"></div>
        </div>
        ${steps.map((st, i) => {
          const isDone = i < doneCount;
          const isActive = i === activeIdx;
          const cls = isDone ? 'done' : (isActive ? 'active' : '');
          return `
            <div class="tracking-step ${cls}">
              <div class="tracking-step-dot" title="${st.label}">
                ${isDone ? ICONS.check : st.icon}
              </div>
              <div class="tracking-step-label">${st.label}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderTrackingDetailCard(o) {
  const items = o.items || [];
  const statusLabels = {
    pending: 'Chờ shop xác nhận',
    confirmed: 'Đã xác nhận đơn hàng',
    processing: 'Đang chuẩn bị hàng',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    completed: 'Giao hàng thành công',
    cancelled: 'Đã hủy đơn hàng'
  };

  return `
    <div class="account-order-card">
      <div class="account-order-header">
        <div>
          <span style="font-size:11px;color:#8e98a5;text-transform:uppercase;letter-spacing:1px;font-family:var(--mono);">MÃ ĐƠN HÀNG</span>
          <div style="font-size:19px;font-weight:800;color:var(--red);letter-spacing:0.5px;">${esc(o.code)}</div>
          <div style="font-size:12px;color:#8e98a5;margin-top:2px;">Đặt lúc: ${o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : 'Mới đây'}</div>
        </div>
        <div style="text-align:right;">
          <span class="badge badge-${o.status}" style="font-size:13px;padding:6px 14px;">
            ${statusLabels[o.status] || statuses[o.status] || o.status}
          </span>
          <div style="font-size:12.5px;color:#9da5b0;margin-top:6px;">Hình thức: <strong>${o.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' : (o.paymentMethod === 'MOMO' ? 'Ví MoMo' : 'COD')}</strong></div>
        </div>
      </div>

      <!-- Mini Tiến trình thời gian thực -->
      ${renderMiniStepper(o.status)}

      <div style="background:rgba(255,255,255,0.02);border:1px solid var(--line);border-radius:8px;padding:14px 18px;margin-bottom:18px;font-size:13px;line-height:1.7;">
        <div><strong style="color:#d1d5db;">Người nhận hàng:</strong> ${esc(o.recipient || user?.name || 'Khách hàng')}</div>
        <div><strong style="color:#d1d5db;">Số điện thoại:</strong> ${esc(o.phone || o.phoneNumber || user?.phone || '—')}</div>
        <div><strong style="color:#d1d5db;">Địa chỉ giao hàng:</strong> ${esc(o.address || user?.address || '—')}</div>
        ${o.note ? `<div><strong style="color:#d1d5db;">Ghi chú:</strong> ${esc(o.note)}</div>` : ''}
      </div>

      <div class="account-order-items">
        ${items.map(it => `
          <div class="account-order-item">
            <img src="${esc(it.image || '/assets/hero-poster.jpg')}" alt="${esc(it.name)}" class="account-order-thumb">
            <div style="flex:1;">
              <div style="font-weight:700;font-size:14px;color:#fff;">${esc(it.name)}</div>
              <div style="font-size:12px;color:#8e98a5;margin-top:2px;">
                ${it.grade ? esc(it.grade) + ' · ' : ''}${it.scale ? esc(it.scale) + ' · ' : ''}Số lượng: ×${it.quantity}
              </div>
            </div>
            <div style="text-align:right;font-weight:700;font-size:14px;color:#ffffff;">
              ${money(it.price * it.quantity)}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="account-order-footer">
        <div>
          <span style="font-size:13px;color:#8e98a5;">Tổng thanh toán: </span>
          <strong style="font-size:18px;color:var(--red);">${money(o.total)}</strong>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          ${o.status === 'pending' ? `
            <button type="button" class="account-btn-cancel" data-cancel-order="${o.id || o._id}">✕ Hủy đơn này</button>
          ` : ''}
          <button type="button" class="account-btn-detail" data-track-code="${esc(o.code)}" style="display:inline-flex;align-items:center;gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Theo dõi lộ trình</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

async function doTrackOrder(query) {
  const q = (query || '').trim();
  if (!q) {
    toast('Vui lòng nhập Mã đơn hàng hoặc Số điện thoại.');
    return;
  }
  trackingSearchKeyword = q;
  try {
    const res = await api('/orders/track/' + encodeURIComponent(q));
    trackingQueryResult = res.orders || [];
    currentAccountTab = 'tracking';
    await renderAccountPage('tracking');
    toast(`Tìm thấy ${trackingQueryResult.length} đơn hàng.`);
  } catch (e) {
    trackingQueryResult = [];
    currentAccountTab = 'tracking';
    await renderAccountPage('tracking');
    toast('Không tìm thấy đơn hàng khớp với từ khóa.');
  }
}

async function doCancelOrder(orderId) {
  if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
  try {
    await api('/orders/' + orderId + '/cancel', 'POST', {});
    toast('Đã hủy đơn hàng thành công.');
    if (trackingQueryResult && trackingQueryResult.length) {
      await doTrackOrder(trackingSearchKeyword);
    } else {
      await renderAccountPage(currentAccountTab);
    }
  } catch (e) {
    showError(e);
  }
}

function renderAccountTabContent(tabKey, userOrders) {
  if (tabKey === 'tracking') {
    return `
      <div class="account-tracking-box">
        <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:6px;">Tra cứu hành trình đơn hàng</h2>
        <p style="font-size:13.5px;color:#8e98a5;margin-bottom:18px;">
          Nhập mã đơn hàng (ví dụ: <strong style="color:#ffffff;">HD7A335D</strong>) hoặc số điện thoại người nhận để kiểm tra trạng thái xử lý và vận chuyển.
        </p>

        <form id="tracking-search-form" class="tracking-search-bar">
          <input
            id="tracking-input"
            type="text"
            class="tracking-search-input"
            placeholder="Nhập mã đơn hàng (HD...) hoặc Số điện thoại (0907...)"
            value="${esc(trackingSearchKeyword)}"
            required
          >
          <button type="submit" class="tracking-search-btn">Tra cứu đơn hàng</button>
        </form>

        <div style="margin-top:14px;font-size:12.5px;color:#8e98a5;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <span>Tra cứu nhanh mẫu:</span>
          <button type="button" class="text-button" data-sample-track="HD7A335D" style="color:var(--red);text-decoration:underline;">Mã HD7A335D</button>
          <span>·</span>
          <button type="button" class="text-button" data-sample-track="0907652267" style="color:var(--red);text-decoration:underline;">SĐT: 0907652267</button>
        </div>
      </div>

      <div id="tracking-results-container">
        ${trackingQueryResult === null ? '' : (
          trackingQueryResult.length > 0 ? `
            <div style="margin-bottom:16px;font-size:15px;font-weight:700;color:#ffffff;">
              Kết quả tra cứu (${trackingQueryResult.length} đơn hàng):
            </div>
            ${trackingQueryResult.map(o => renderTrackingDetailCard(o)).join('')}
          ` : `
            <div class="empty">
              <strong>Không tìm thấy đơn hàng</strong>
              Không có đơn hàng nào khớp với từ khóa "${esc(trackingSearchKeyword)}". Vui lòng kiểm tra lại mã đơn hoặc số điện thoại.
            </div>
          `
        )}
      </div>
    `;
  }

  if (tabKey === 'profile') {
    if (!user) return '<div class="empty"><strong>Vui lòng đăng nhập</strong> để chỉnh sửa thông tin cá nhân.</div>';
    return `
      <div class="account-order-card" style="max-width:600px;">
        <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:16px;">Cập nhật thông tin nhận hàng</h2>
        <form id="profile-form" class="form-grid">
          <label>Họ và tên
            <input name="name" value="${esc(user.name)}" required maxlength="100">
          </label>
          <label>Email tài khoản
            <input value="${esc(user.email)}" readonly style="background:#080a0e;cursor:not-allowed;color:#6b7280;">
          </label>
          <label>Số điện thoại nhận hàng
            <input name="phone" type="tel" value="${esc(user.phone || '')}" placeholder="0907652267" required pattern="[0-9+ ()-]{9,20}">
          </label>
          <label>Địa chỉ giao hàng mặc định
            <input name="address" value="${esc(user.address || '')}" placeholder="Số nhà, tên đường, Quận/Huyện, TP" required maxlength="500">
          </label>
          <button type="submit" class="auth-btn-submit" style="margin-top:12px;">Lưu thông tin</button>
        </form>
      </div>
    `;
  }

  // Default: 'orders'
  if (!user) {
    return `
      <div class="empty">
        <strong>Vui lòng đăng nhập</strong>
        Để xem lịch sử các đơn hàng đã đặt của bạn.
        <div style="margin-top:16px;">
          <a href="#login" class="button primary">Đăng nhập tài khoản →</a>
        </div>
      </div>
    `;
  }

  if (!userOrders.length) {
    return `
      <div class="empty">
        <strong>Bạn chưa có đơn mua nào</strong>
        Khám phá kho mô hình Gunpla Bandai Spirits chính hãng ngay hôm nay!
        <div style="margin-top:16px;">
          <a href="#catalog" class="button primary">Khám phá mô hình →</a>
        </div>
      </div>
    `;
  }

  return `
    <div style="margin-bottom:16px;font-size:15px;font-weight:700;color:#ffffff;">
      Tất cả đơn hàng của bạn (${userOrders.length} đơn):
    </div>
    ${userOrders.map(o => renderTrackingDetailCard(o)).join('')}
  `;
}

async function renderAccountPage(activeTab) {
  if (activeTab) currentAccountTab = activeTab;
  else if (!currentAccountTab) currentAccountTab = user ? 'orders' : 'tracking';

  const container = $('#page-account');
  if (!container) return;

  let userOrders = [];
  if (user && currentAccountTab === 'orders') {
    try {
      userOrders = await api('/orders');
    } catch (e) {
      userOrders = [];
    }
  }

  container.innerHTML = `
    <div class="account-container">
      <div class="account-hero">
        <div class="account-user-info">
          <div class="account-avatar">
            ${user ? esc(user.name?.charAt(0).toUpperCase() || 'U') : '🔍'}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0;">
                ${user ? esc(user.name) : 'Tra cứu & Theo dõi đơn hàng'}
              </h1>
              ${user ? `
                <span class="badge ${user.role === 'admin' ? 'badge-confirmed' : 'badge-completed'}" style="font-size:11px;">
                  ${user.role === 'admin' ? 'Quản trị viên Studio' : 'Thành viên Studio'}
                </span>
              ` : `
                <span class="badge badge-pending" style="font-size:11px;">Khách vãng lai</span>
              `}
            </div>
            <div style="font-size:13px;color:#8e98a5;margin-top:4px;">
              ${user ? `${esc(user.email)} · SĐT: ${esc(user.phone || 'Chưa cập nhật')} · ${esc(user.address || 'Chưa cập nhật địa chỉ')}` : 'Theo dõi trạng thái đóng gói và hành trình vận chuyển Gunpla thời gian thực.'}
            </div>
          </div>
        </div>

        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          ${user ? `
            ${user.role === 'admin' ? '<a href="#admin" class="account-tab-btn" style="background:#dc2626;color:#ffffff;border-color:#dc2626;display:inline-flex;align-items:center;gap:4px;"><span>Quản trị Studio</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>' : ''}
            <button type="button" class="account-tab-btn" data-action="logout">Đăng xuất</button>
          ` : `
            <a href="#login" class="account-tab-btn active" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px;"><span>Đăng nhập thành viên</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
          `}
        </div>
      </div>

      <div class="account-tabs">
        ${user ? `
          <button type="button" class="account-tab-btn ${currentAccountTab === 'orders' ? 'active' : ''}" data-acc-tab="orders" style="display:inline-flex;align-items:center;gap:7px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12.01 20.71 7"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Đơn mua của tôi (${userOrders.length})</span>
          </button>
        ` : ''}
        <button type="button" class="account-tab-btn ${currentAccountTab === 'tracking' ? 'active' : ''}" data-acc-tab="tracking" style="display:inline-flex;align-items:center;gap:7px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Tra cứu lộ trình đơn hàng</span>
        </button>
        ${user ? `
          <button type="button" class="account-tab-btn ${currentAccountTab === 'profile' ? 'active' : ''}" data-acc-tab="profile" style="display:inline-flex;align-items:center;gap:7px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Thông tin cá nhân</span>
          </button>
        ` : ''}
      </div>

      <div style="margin-top:24px;">
        ${renderAccountTabContent(currentAccountTab, userOrders)}
      </div>
    </div>
  `;
}

/* ==========================================================================
   MODERN & SLEEK WEB ADMIN DASHBOARD
   ========================================================================== */
async function loadAdmin() {
  if (!user || user.role !== 'admin') {
    adminReady = false;
    renderAdmin();
    return;
  }
  try {
    const results = await Promise.all([
      api('/admin/products').catch(() => []),
      api('/admin/orders').catch(() => []),
      api('/categories').catch(() => []),
      api('/users').catch(() => []),
      api('/admin/stats?timeRange=' + adminTimeRange).catch(() => null),
      api('/metadata').catch(() => ({ categories: [], brands: [], grades: [], series: [] }))
    ]);
    adminProducts = results[0] || [];
    orders = results[1] || [];
    const catList = results[2] || [];
    adminUsers = results[3] || [];
    adminStatsData = results[4] || null;
    metadata = results[5] || { categories: [], brands: [], grades: [], series: [] };
    if (catList && catList.length) {
      metadata.categories = catList;
    }
    adminReady = true;
  } catch (e) {
    adminProducts = DEFAULT_PRODUCTS;
    orders = [];
    adminReady = true;
  }
  renderAdmin();
}

function renderPaginationBar(totalItems, currentPage, pageSize, pageChangeAction, sizeChangeAction) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toIndex = Math.min(totalItems, currentPage * pageSize);

  let pageBtns = '';
  let startP = Math.max(1, currentPage - 2);
  let endP = Math.min(totalPages, startP + 4);
  if (endP - startP < 4) {
    startP = Math.max(1, endP - 4);
  }

  for (let p = startP; p <= endP; p++) {
    pageBtns += `<button class="web-admin-page-btn ${p === currentPage ? 'active' : ''}" data-action="${pageChangeAction}" data-page="${p}">${p}</button>`;
  }

  return `
    <div class="web-admin-pagination">
      <div style="display:flex;align-items:center;gap:12px;font-size:13px;color:#555;">
        <span>Hiển thị <strong>${fromIndex} - ${toIndex}</strong> / <strong>${totalItems}</strong> mục</span>
        <label style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:#555;">
          Xem:
          <select class="web-admin-select" style="padding:2px 8px;height:28px;width:auto;min-width:70px;" data-change-size="${sizeChangeAction}">
            <option value="5" ${pageSize === 5 ? 'selected' : ''}>5 dòng</option>
            <option value="10" ${pageSize === 10 ? 'selected' : ''}>10 dòng</option>
            <option value="20" ${pageSize === 20 ? 'selected' : ''}>20 dòng</option>
          </select>
        </label>
      </div>
      <div class="web-admin-pagination-pages">
        <button class="web-admin-page-btn" data-action="${pageChangeAction}" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>‹ Trước</button>
        ${pageBtns}
        <button class="web-admin-page-btn" data-action="${pageChangeAction}" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>Sau ›</button>
      </div>
    </div>
  `;
}

function renderAdmin() {
  const container = $('#admin');
  if (!container) return;

  if (!user || user.role !== 'admin') {
    container.innerHTML = `
      <div class="web-admin-wrapper" style="align-items:center;justify-content:center;padding:40px 16px;min-height:100vh;">
        <div style="background:var(--admin-bg-surface);border:1px solid var(--admin-border);border-radius:18px;box-shadow:0 16px 48px rgba(0,0,0,0.7);max-width:460px;width:100%;overflow:hidden;backdrop-filter:blur(24px);">
          <div style="background:linear-gradient(135deg, rgba(230,0,18,0.2) 0%, rgba(14,20,32,0.98) 100%);border-bottom:1px solid var(--admin-border);color:#ffffff;padding:26px 24px;text-align:center;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--admin-red),#991b1b);box-shadow:0 6px 20px var(--admin-red-glow);margin-bottom:12px;font-size:22px;font-weight:900;letter-spacing:0.5px;">3C</div>
            <div style="font-size:18px;font-weight:800;letter-spacing:0.5px;color:#ffffff;">HỆ THỐNG QUẢN TRỊ 3CAIDONHUA</div>
            <div style="font-size:12.5px;color:#94a3b8;margin-top:4px;">Khu vực Vận hành Đơn hàng &amp; Quản lý Kho Gunpla Studio</div>
          </div>
          <div style="padding:28px 24px;">
            <p style="font-size:13.5px;color:#cbd5e1;margin-bottom:22px;text-align:center;line-height:1.6;">
              ${user ? 'Tài khoản của bạn không có quyền Quản trị viên (Admin).' : 'Vui lòng đăng nhập với tài khoản Quản trị viên để truy cập trung tâm điều hành.'}
            </p>
            <button class="web-admin-add-btn" style="width:100%;justify-content:center;margin-bottom:12px;padding:12px;font-size:14px;" data-quick-admin-login="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Đăng nhập nhanh Admin (Nguyễn Hoàng Lân)</span>
            </button>
            <button class="web-admin-refresh-btn" style="width:100%;justify-content:center;padding:10px;font-size:13px;" data-action="${user ? 'account' : 'login'}">
              ${user ? 'Xem tài khoản của tôi' : 'Đăng nhập bằng tài khoản khác'}
            </button>
            <div style="text-align:center;margin-top:20px;">
              <a href="#home" style="color:#38bdf8;font-size:13px;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                <span>Quay về website cửa hàng</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (!adminReady) {
    container.innerHTML = `
      <div class="web-admin-wrapper" style="align-items:center;justify-content:center;min-height:100vh;">
        <div style="background:var(--admin-bg-surface);border:1px solid var(--admin-border);border-radius:14px;padding:26px 40px;box-shadow:0 12px 36px rgba(0,0,0,0.6);color:#38bdf8;font-size:15px;font-weight:700;display:flex;align-items:center;gap:14px;">
          <div class="web-admin-todo-led" style="background:#38bdf8;box-shadow:0 0 14px #38bdf8;"></div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <span>Đang đồng bộ dữ liệu quản trị hệ thống…</span>
        </div>
      </div>
    `;
    return;
  }

  const categoriesCount = (metadata.categories || []).length;
  const usersCount = adminUsers.length;
  const activeProductsCount = adminProducts.filter(p => p.status === 'active').length;

  // Tab Header & Breadcrumb mapping
  let tabTitle = 'Bảng tổng quan vận hành';
  let tabBreadcrumb = 'Bảng tổng quan';
  if (tab === 'categories') { tabTitle = 'Quản lý danh mục sản phẩm'; tabBreadcrumb = 'Quản lý danh mục'; }
  if (tab === 'products') { tabTitle = 'Quản lý kho hàng &amp; Sản phẩm'; tabBreadcrumb = 'Quản lý sản phẩm'; }
  if (tab === 'orders') { tabTitle = 'Quản lý &amp; Xử lý đơn hàng'; tabBreadcrumb = 'Quản lý đơn hàng'; }
  if (tab === 'users') { tabTitle = 'Quản lý tài khoản người dùng'; tabBreadcrumb = 'Quản lý tài khoản'; }

  const q = (adminSearchQuery || '').toLowerCase().trim();

  // 1. FILTERED ORDERS
  let filteredOrders = orders.filter(o => {
    const matchQ = !q || (o.code && o.code.toLowerCase().includes(q)) || (o.recipient && o.recipient.toLowerCase().includes(q)) || (o.phone && o.phone.includes(q)) || (o.address && o.address.toLowerCase().includes(q));
    const matchStatus = adminFilterStatus === 'all' || o.status === adminFilterStatus;
    const matchPay = adminFilterPayStatus === 'all' || o.paymentStatus === adminFilterPayStatus;
    return matchQ && matchStatus && matchPay;
  });

  // Paged Orders
  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / adminPageSize));
  if (adminPage > orderTotalPages) adminPage = orderTotalPages;
  const pagedOrders = filteredOrders.slice((adminPage - 1) * adminPageSize, adminPage * adminPageSize);

  // 2. FILTERED PRODUCTS
  let filteredProducts = adminProducts.filter(p => {
    const matchQ = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q));
    const matchGrade = adminFilterGrade === 'all' || p.grade === adminFilterGrade;
    let matchStock = true;
    if (adminFilterStock === 'in_stock') matchStock = p.stock > (p.lowStockThreshold || 5);
    else if (adminFilterStock === 'low_stock') matchStock = p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
    else if (adminFilterStock === 'out_of_stock') matchStock = p.stock === 0;
    return matchQ && matchGrade && matchStock;
  });

  // Paged Products
  const prodTotalPages = Math.max(1, Math.ceil(filteredProducts.length / adminProductPageSize));
  if (adminProductPage > prodTotalPages) adminProductPage = prodTotalPages;
  const pagedProducts = filteredProducts.slice((adminProductPage - 1) * adminProductPageSize, adminProductPage * adminProductPageSize);

  // 3. FILTERED CATEGORIES
  let filteredCategories = (metadata.categories || []).filter(c => {
    return !q || (c.name && c.name.toLowerCase().includes(q)) || (c.slug && c.slug.toLowerCase().includes(q));
  });

  // 4. FILTERED USERS
  let filteredUsers = adminUsers.filter(u => {
    const matchQ = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)) || (u.phone && u.phone.includes(q));
    const matchRole = adminFilterRole === 'all' || u.role === adminFilterRole;
    const matchStatus = adminFilterStatus === 'all' || u.status === adminFilterStatus;
    return matchQ && matchRole && matchStatus;
  });

  // -------------------------------------------------------------
  // HTML: STATS GRID PER TAB (No duplication across tabs!)
  // -------------------------------------------------------------
  let statsGridHtml = '';

  if (tab === 'overview') {
    const salesRev = adminStatsData?.salesRevenue ?? orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);
    const pendCount = adminStatsData?.pendingOrders ?? orders.filter(o => o.status === 'pending').length;
    const shipCount = adminStatsData?.shippingOrders ?? orders.filter(o => o.status === 'shipping').length;
    const lowCount = adminStatsData?.lowStockProducts ?? adminProducts.filter(p => p.status === 'active' && p.stock <= (p.lowStockThreshold || 5)).length;

    const totalVal = adminStatsData?.totalOrderValue ?? orders.reduce((s, o) => s + (o.total || 0), 0);
    const cashColl = adminStatsData?.collectedCash ?? orders.reduce((s, o) => s + (o.amountPaid || 0), 0);
    const codUnrec = adminStatsData?.unreconciledCOD ?? orders.filter(o => o.paymentMethod === 'COD' && o.status !== 'cancelled' && o.codStatus !== 'reconciled').reduce((s, o) => s + (o.total || 0), 0);

    const timeLabels = { today: 'Hôm nay', '7days': '7 ngày qua', this_month: 'Tháng này', all: 'Tất cả thời gian' };

    statsGridHtml = `
      <!-- TO-DO ACTION CENTER: VIỆC CẦN XỬ LÝ NGAY -->
      <div class="web-admin-todo-box">
        <div class="web-admin-todo-left">
          <div class="web-admin-todo-led"></div>
          <div>
            <div style="font-size:14.5px;font-weight:700;letter-spacing:0.3px;">TRUNG TÂM TÁC VỤ CẦN XỬ LÝ HÔM NAY</div>
            <div style="font-size:12.5px;color:#8e98a5;">Ưu tiên duyệt đơn và điều phối kho để tối ưu thời gian giao hàng</div>
          </div>
        </div>
        <div class="web-admin-todo-chips">
          <button class="web-admin-todo-chip" data-tab="orders" title="Lọc đơn chờ xác nhận">
            <span>Đơn chờ xác nhận:</span>
            <strong>${pendCount} đơn</strong>
          </button>
          <button class="web-admin-todo-chip" data-tab="orders" title="Lọc đơn đang chuẩn bị/giao">
            <span>Cần đóng gói gửi bưu tá:</span>
            <strong style="background:#0284c7;">${shipCount} đơn</strong>
          </button>
          <button class="web-admin-todo-chip" data-tab="products" title="Lọc mô hình sắp hết kho">
            <span>Mô hình sắp hết hàng (≤ 5):</span>
            <strong style="background:#f59e0b;color:#000;">${lowCount} mã</strong>
          </button>
        </div>
      </div>

      <div style="background:rgba(18,24,38,0.95);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 18px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="font-weight:700;color:#f1f5f9;font-size:13.5px;display:flex;align-items:center;gap:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--admin-red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span>CHỈ SỐ VẬN HÀNH TRỌNG YẾU:</span>
          <span style="color:var(--admin-red);background:rgba(230,0,18,0.12);padding:2px 8px;border-radius:6px;font-size:12px;">${timeLabels[adminTimeRange] || 'Tháng này'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12.5px;color:#8e98a5;">Kỳ báo cáo:</span>
          <button class="web-admin-page-btn ${adminTimeRange === 'today' ? 'active' : ''}" data-admin-time-range="today">Hôm nay</button>
          <button class="web-admin-page-btn ${adminTimeRange === '7days' ? 'active' : ''}" data-admin-time-range="7days">7 ngày</button>
          <button class="web-admin-page-btn ${adminTimeRange === 'this_month' ? 'active' : ''}" data-admin-time-range="this_month">Tháng này</button>
          <button class="web-admin-page-btn ${adminTimeRange === 'all' ? 'active' : ''}" data-admin-time-range="all">Tất cả</button>
        </div>
      </div>

      <div class="web-admin-stats-grid" style="margin-bottom:18px;">
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Doanh thu bán hàng</small>
            <strong style="color:#10b981;font-size:22px;">${money(salesRev)}</strong>
            <div style="font-size:11.5px;color:#10b981;margin-top:2px;font-weight:700;">↑ +18.4% so với kỳ trước</div>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon yellow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Đơn chờ xác nhận</small>
            <strong style="color:#fbbf24;font-size:22px;">${pendCount} đơn</strong>
            <div style="font-size:11.5px;color:#8e98a5;margin-top:2px;">Cần xử lý trong ngày</div>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Đơn đang giao bưu cục</small>
            <strong style="color:#38bdf8;font-size:22px;">${shipCount} đơn</strong>
            <div style="font-size:11.5px;color:#38bdf8;margin-top:2px;font-weight:600;">GHN / Tiêu chuẩn</div>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Mô hình sắp hết kho (≤ 5)</small>
            <strong style="color:#ff5e52;font-size:22px;">${lowCount} mã</strong>
            <div style="font-size:11.5px;color:#ff5e52;margin-top:2px;font-weight:600;">Cần nhập kho ngay</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:20px;">
        <div style="background:rgba(18,24,38,0.95);border:1px solid rgba(255,255,255,0.08);border-left:4px solid var(--admin-cyan);border-radius:10px;padding:14px 18px;">
          <div style="font-size:11.5px;color:#8e98a5;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Tổng giá trị đặt hàng</div>
          <div style="font-size:17px;font-weight:800;color:#ffffff;margin-top:3px;font-family:var(--mono);">${money(totalVal)}</div>
        </div>
        <div style="background:rgba(18,24,38,0.95);border:1px solid rgba(255,255,255,0.08);border-left:4px solid var(--admin-green);border-radius:10px;padding:14px 18px;">
          <div style="font-size:11.5px;color:#8e98a5;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Tiền thực tế đã thu</div>
          <div style="font-size:17px;font-weight:800;color:#10b981;margin-top:3px;font-family:var(--mono);">${money(cashColl)}</div>
        </div>
        <div style="background:rgba(18,24,38,0.95);border:1px solid rgba(255,255,255,0.08);border-left:4px solid var(--admin-amber);border-radius:10px;padding:14px 18px;">
          <div style="font-size:11.5px;color:#8e98a5;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">COD chưa đối soát ví</div>
          <div style="font-size:17px;font-weight:800;color:#fbbf24;margin-top:3px;font-family:var(--mono);">${money(codUnrec)}</div>
        </div>
      </div>
    `;
  } else if (tab === 'orders') {
    const pendCount = orders.filter(o => o.status === 'pending').length;
    const shipCount = orders.filter(o => ['processing', 'shipping'].includes(o.status)).length;
    const compCount = orders.filter(o => o.status === 'completed').length;
    const failCount = orders.filter(o => ['cancelled', 'failed_delivery', 'returning', 'returned'].includes(o.status)).length;

    statsGridHtml = `
      <div class="web-admin-stats-grid" style="margin-bottom:18px;">
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Tổng số đơn hàng</small>
            <strong style="font-size:20px;">${orders.length}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon yellow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Chờ xác nhận</small>
            <strong style="color:#fbbf24;font-size:20px;">${pendCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Đang chuẩn bị / Giao</small>
            <strong style="color:#38bdf8;font-size:20px;">${shipCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Hoàn tất thành công</small>
            <strong style="color:#10b981;font-size:20px;">${compCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Đã hủy / Giao thất bại</small>
            <strong style="color:#ff5e52;font-size:20px;">${failCount}</strong>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'products') {
    const lowCount = adminProducts.filter(p => p.status === 'active' && p.stock <= (p.lowStockThreshold || 5)).length;
    const outCount = adminProducts.filter(p => p.stock === 0).length;
    const stopCount = adminProducts.filter(p => p.status !== 'active').length;

    statsGridHtml = `
      <div class="web-admin-stats-grid" style="margin-bottom:18px;">
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Tổng SKU mô hình</small>
            <strong style="font-size:20px;">${adminProducts.length}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Đang mở bán</small>
            <strong style="color:#10b981;font-size:20px;">${activeProductsCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon yellow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Sắp hết hàng (≤ 5)</small>
            <strong style="color:#fbbf24;font-size:20px;">${lowCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Hết hàng / Ngừng bán</small>
            <strong style="color:#ff5e52;font-size:20px;">${outCount + stopCount}</strong>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'categories') {
    const activeCats = (metadata.categories || []).filter(c => c.status !== 'inactive').length;
    const inactiveCats = (metadata.categories || []).filter(c => c.status === 'inactive').length;

    statsGridHtml = `
      <div class="web-admin-stats-grid" style="margin-bottom:18px;">
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Tổng danh mục</small>
            <strong style="font-size:20px;">${categoriesCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Đang hiển thị</small>
            <strong style="color:#10b981;font-size:20px;">${activeCats}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Đang tạm ẩn</small>
            <strong style="color:#fbbf24;font-size:20px;">${inactiveCats}</strong>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'users') {
    const adminCount = adminUsers.filter(u => u.role === 'admin').length;
    const staffCount = adminUsers.filter(u => u.role === 'staff').length;
    const customerCount = adminUsers.filter(u => u.role === 'user').length;
    const lockedCount = adminUsers.filter(u => u.status === 'locked').length;

    statsGridHtml = `
      <div class="web-admin-stats-grid" style="margin-bottom:18px;">
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Tổng số tài khoản</small>
            <strong style="font-size:20px;">${usersCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Quản trị viên (Admin)</small>
            <strong style="color:#ff5e52;font-size:20px;">${adminCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Khách hàng thành viên</small>
            <strong style="color:#10b981;font-size:20px;">${customerCount + staffCount}</strong>
          </div>
        </div>
        <div class="web-admin-stat-tile">
          <div class="web-admin-stat-icon yellow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div class="web-admin-stat-content">
            <small>Tài khoản bị khóa</small>
            <strong style="color:#fbbf24;font-size:20px;">${lockedCount}</strong>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // HTML: TABLES PER TAB
  // -------------------------------------------------------------

  // Helper render order status badge
  function renderOrderStatusBadge(st) {
    const label = orderStatusLabels[st] || st;
    return `<span class="admin-badge status-${st}"><span class="badge-dot"></span><span>${esc(label)}</span></span>`;
  }

  function renderPaymentBadge(paySt) {
    const label = paymentStatusLabels[paySt] || paySt;
    const cls = paySt === 'paid' ? 'pay-paid' : (paySt.includes('refund') ? 'pay-refunded' : 'pay-unpaid');
    return `<span class="admin-badge ${cls}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><span>${esc(label)}</span></span>`;
  }

  function renderCodBadge(codSt) {
    const label = codStatusLabels[codSt] || codSt;
    const cls = codSt === 'reconciled' ? 'cod-reconciled' : (codSt === 'carrier_collected' ? 'cod-collected' : 'cod-uncollected');
    return `<span class="admin-badge ${cls}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg><span>${esc(label)}</span></span>`;
  }

  // 1. ORDERS TABLE
  const ordersTableRows = pagedOrders.map((o, idx) => {
    const globalIdx = (adminPage - 1) * adminPageSize + idx + 1;
    return `
      <tr>
        <td style="text-align:center;"><input type="checkbox" class="admin-row-chk"></td>
        <td style="text-align:center;"><span class="web-admin-stt-box">${globalIdx}</span></td>
        <td style="white-space:nowrap;">
          <strong style="color:var(--admin-red);letter-spacing:0.5px;font-size:14px;font-family:var(--mono);">${esc(o.code)}</strong>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''}</div>
        </td>
        <td style="white-space:nowrap;">
          <strong style="color:#ffffff;">${esc(o.recipient)}</strong>
          <div style="font-size:12px;color:#94a3b8;display:inline-flex;align-items:center;gap:5px;margin-top:2px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>${esc(o.phone)}</span>
          </div>
        </td>
        <td style="vertical-align:middle;">
          <div style="max-width:200px;font-size:12px;color:#cbd5e1;line-height:1.45;word-break:break-word;">${esc(o.address)}</div>
        </td>
        <td style="vertical-align:middle;">
          <div style="font-size:12.5px;color:#cbd5e1;line-height:1.5;min-width:220px;">
            ${(o.items || []).map(i => `<div style="margin-bottom:3px;display:flex;align-items:center;gap:6px;">
              <span style="color:#64748b;">•</span>
              <span>${esc(i.name)}</span>
            </div>`).join('')}
          </div>
        </td>
        <td style="text-align:center;vertical-align:middle;white-space:nowrap;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            ${(o.items || []).map(i => `<span style="color:var(--admin-cyan);background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);padding:2px 8px;border-radius:5px;font-size:12px;font-weight:700;font-family:var(--mono);">${i.quantity}</span>`).join('')}
          </div>
        </td>
        <td style="white-space:nowrap;">
          <strong style="color:#ffffff;font-size:14.5px;font-family:var(--mono);">${money(o.total)}</strong>
          <div style="font-size:11px;color:#94a3b8;font-weight:600;">${esc(o.paymentMethod || 'COD')}</div>
        </td>
        <td style="white-space:nowrap;text-align:center;">${renderOrderStatusBadge(o.status)}</td>
        <td style="white-space:nowrap;">
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
            ${renderPaymentBadge(o.paymentStatus || 'unpaid')}
            ${o.paymentMethod === 'COD' ? renderCodBadge(o.codStatus || 'uncollected') : ''}
          </div>
        </td>
        <td style="text-align:center;white-space:nowrap;">
          <button class="web-admin-btn-action" data-order="${o.id || o._id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Chi tiết
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const ordersTableHtml = `
    <div class="web-admin-table-box">
      <table class="web-admin-table">
        <thead>
          <tr>
            <th style="width:36px;text-align:center;"><input type="checkbox" id="admin-select-all"></th>
            <th style="width:48px;text-align:center;">STT</th>
            <th style="width:130px;white-space:nowrap;">MÃ ĐƠN HÀNG</th>
            <th style="width:150px;white-space:nowrap;">KHÁCH HÀNG</th>
            <th style="min-width:180px;">ĐỊA CHỈ GIAO</th>
            <th style="min-width:240px;">SẢN PHẨM</th>
            <th style="width:100px;text-align:center;white-space:nowrap;">SỐ LƯỢNG</th>
            <th style="width:130px;white-space:nowrap;">TỔNG TIỀN</th>
            <th style="width:130px;white-space:nowrap;text-align:center;">TRẠNG THÁI ĐƠN</th>
            <th style="width:140px;white-space:nowrap;">THANH TOÁN &amp; COD</th>
            <th style="text-align:center;width:120px;white-space:nowrap;">TÁC VỤ</th>
          </tr>
        </thead>
        <tbody>
          ${ordersTableRows || '<tr><td colspan="11" style="text-align:center;padding:32px;color:#777;">Không có đơn hàng nào khớp với bộ lọc tìm kiếm.</td></tr>'}
        </tbody>
      </table>
    </div>
    ${renderPaginationBar(filteredOrders.length, adminPage, adminPageSize, 'change-order-page', 'order')}
  `;

  // 2. PRODUCTS TABLE
  const productsTableRows = pagedProducts.map((p, idx) => {
    const globalIdx = (adminProductPage - 1) * adminProductPageSize + idx + 1;
    const gradeClass = (p.grade || 'kit').toLowerCase().replace(/[^a-z0-9]/g, '');
    let stockBadge = `<span class="admin-badge stock-ok">${p.stock}</span>`;
    if (p.stock === 0) stockBadge = `<span class="admin-badge stock-out">Hết hàng (0)</span>`;
    else if (p.stock <= (p.lowStockThreshold || 5)) stockBadge = `<span class="admin-badge stock-low"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Sắp hết (${p.stock})</span>`;

    return `
      <tr>
        <td style="text-align:center;"><input type="checkbox" class="admin-row-chk"></td>
        <td style="text-align:center;"><span class="web-admin-stt-box">${globalIdx}</span></td>
        <td>
          <div style="font-weight:700;color:#ffffff;font-size:13.5px;line-height:1.4;word-break:break-word;">${esc(p.name)}</div>
          <div style="font-size:11.5px;color:#94a3b8;margin-top:3px;">Danh mục: <strong style="color:#cbd5e1;">${esc(p.category || 'Mô hình Gunpla')}</strong></div>
        </td>
        <td style="text-align:center;width:64px;">
          <img class="web-admin-thumb" src="${esc(p.image || '/assets/hero-poster.jpg')}" alt="${esc(p.name)}">
        </td>
        <td style="white-space:nowrap;">
          <code style="background:rgba(255,255,255,0.06);color:var(--admin-cyan);border:1px solid rgba(255,255,255,0.1);padding:3px 8px;border-radius:4px;font-size:12px;font-family:var(--mono);font-weight:700;">${esc(p.sku)}</code>
        </td>
        <td style="white-space:nowrap;">
          ${p.grade ? `<span class="image-badge badge-${gradeClass}" style="position:static;display:inline-block;padding:2px 6px;font-size:11px;">${esc(p.grade)} ${p.scale ? `// ${esc(p.scale)}` : ''}</span>` : `<span style="font-size:11.5px;color:#94a3b8;">${esc(p.scale || 'Phụ kiện')}</span>`}
        </td>
        <td style="white-space:nowrap;"><strong style="color:#ffffff;font-size:14px;font-family:var(--mono);">${money(p.price)}</strong></td>
        <td style="text-align:center;white-space:nowrap;">
          ${stockBadge}
          <div class="web-admin-stock-gauge" title="Tồn kho: ${p.stock} kit">
            <div class="web-admin-stock-gauge-fill ${p.stock === 0 ? 'out' : (p.stock <= (p.lowStockThreshold || 5) ? 'low' : 'ok')}" style="width:${Math.min(100, Math.max(6, (p.stock / 20) * 100))}%;"></div>
          </div>
        </td>
        <td style="white-space:nowrap;">
          <span class="admin-badge ${p.status === 'active' ? 'user-active' : 'status-cancelled'}">
            <span class="badge-dot"></span>${p.status === 'active' ? 'Đang mở bán' : (p.status === 'archived' ? 'Đã lưu trữ' : 'Tạm ngừng bán')}
          </span>
        </td>
        <td style="text-align:center;white-space:nowrap;">
          <div class="web-admin-action-btn-group">
            <button class="web-admin-btn-action secondary" data-edit="${p.id || p._id}" title="Sửa thông tin">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Sửa
            </button>
            <button class="web-admin-btn-action ${p.status === 'active' ? 'warning' : 'success'}" data-toggle-product="${p.id || p._id}" title="Bật/Tắt bán">
              ${p.status === 'active' ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Dừng' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Bán'}
            </button>
            <button class="web-admin-btn-action danger" data-archive="${p.id || p._id}" title="Xóa hoặc lưu trữ sản phẩm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const productsTableHtml = `
    <div class="web-admin-table-box">
      <table class="web-admin-table">
        <thead>
          <tr>
            <th style="width:36px;text-align:center;"><input type="checkbox" id="admin-select-all"></th>
            <th style="width:48px;text-align:center;">STT</th>
            <th style="min-width:240px;">TÊN SẢN PHẨM</th>
            <th style="width:64px;text-align:center;">HÌNH ẢNH</th>
            <th style="width:120px;white-space:nowrap;">MÃ SKU</th>
            <th style="width:140px;white-space:nowrap;">PHÂN CẤP / TỶ LỆ</th>
            <th style="width:120px;white-space:nowrap;">GIÁ BÁN</th>
            <th style="text-align:center;width:110px;white-space:nowrap;">TỒN KHO</th>
            <th style="width:130px;white-space:nowrap;">TRẠNG THÁI</th>
            <th style="text-align:center;width:200px;white-space:nowrap;">TÁC VỤ</th>
          </tr>
        </thead>
        <tbody>
          ${productsTableRows || '<tr><td colspan="10" style="text-align:center;padding:32px;color:#777;">Không có sản phẩm nào khớp với tìm kiếm.</td></tr>'}
        </tbody>
      </table>
    </div>
    ${renderPaginationBar(filteredProducts.length, adminProductPage, adminProductPageSize, 'change-product-page', 'product')}
  `;

  // 3. CATEGORIES TABLE (STT starts from 1!)
  const categoriesTableRows = filteredCategories.map((c, idx) => {
    const catThumb = c.image || ((c.slug && c.slug.includes('one-piece')) ? '/assets/products/op-sunny.jpg' : ((c.slug && (c.slug.includes('but') || c.slug.includes('tool'))) ? '/assets/products/tool-nipper.jpg' : '/assets/products/rg-hinu.jpg'));
    const isShowing = c.status !== 'inactive';

    return `
      <tr>
        <td style="text-align:center;"><input type="checkbox" class="admin-row-chk"></td>
        <td style="text-align:center;"><span class="web-admin-stt-box">${idx + 1}</span></td>
        <td>
          <strong style="font-size:14px;color:#ffffff;line-height:1.4;">${esc(c.name)}</strong>
          ${c.description ? `<div style="font-size:11.5px;color:#94a3b8;margin-top:3px;line-height:1.4;">${esc(c.description)}</div>` : ''}
        </td>
        <td style="text-align:center;width:64px;">
          <img class="web-admin-thumb" src="${catThumb}" alt="${esc(c.name)}">
        </td>
        <td style="white-space:nowrap;">
          <code style="background:rgba(56,189,248,0.1);color:var(--admin-cyan);border:1px solid rgba(56,189,248,0.25);padding:3px 8px;border-radius:4px;font-size:12px;font-family:var(--mono);font-weight:700;">/${esc(c.slug)}</code>
        </td>
        <td style="text-align:center;white-space:nowrap;">
          <span class="web-admin-count-pill">${c.productCount || 0} SP</span>
        </td>
        <td style="text-align:center;font-weight:700;color:#f1f5f9;white-space:nowrap;">${c.order || 1}</td>
        <td style="text-align:center;white-space:nowrap;">
          <button class="web-admin-btn-action ${isShowing ? 'success' : 'secondary'}" data-toggle-cat="${c.id || c._id}" title="Nhấn để bật / tắt hiển thị trên website" style="padding:5px 12px;">
            ${isShowing ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Đang hiển thị' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Đang ẩn'}
          </button>
        </td>
        <td style="text-align:center;white-space:nowrap;">
          <div class="web-admin-action-btn-group" style="justify-content:center;">
            <button class="web-admin-btn-action secondary" data-category="${c.id || c._id}" title="Sửa thông tin danh mục">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Sửa
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const categoriesTableHtml = `
    <div class="web-admin-table-box">
      <table class="web-admin-table">
        <thead>
          <tr>
            <th style="width:36px;text-align:center;"><input type="checkbox" id="admin-select-all"></th>
            <th style="width:48px;text-align:center;">STT</th>
            <th style="min-width:220px;">TÊN DANH MỤC</th>
            <th style="width:64px;text-align:center;">HÌNH ẢNH</th>
            <th style="width:160px;white-space:nowrap;">ĐƯỜNG DẪN (SLUG)</th>
            <th style="text-align:center;width:120px;white-space:nowrap;">SỐ SẢN PHẨM</th>
            <th style="text-align:center;width:70px;white-space:nowrap;">THỨ TỰ</th>
            <th style="text-align:center;width:140px;white-space:nowrap;">TRẠNG THÁI</th>
            <th style="text-align:center;width:100px;white-space:nowrap;">TÁC VỤ</th>
          </tr>
        </thead>
        <tbody>
          ${categoriesTableRows || '<tr><td colspan="9" style="text-align:center;padding:32px;color:#777;">Chưa có danh mục nào.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  // 4. USERS TABLE (Plain text email, no code block look!)
  const usersTableRows = filteredUsers.map((u, idx) => {
    const isSelf = user && (user.id === (u.id || u._id) || user._id === (u.id || u._id));
    const roleBadgeClass = u.role === 'admin' ? 'admin' : (u.role === 'staff' ? 'staff' : 'customer');
    const roleLabel = u.role === 'admin' ? 'Quản trị viên' : (u.role === 'staff' ? 'Nhân viên kho' : 'Khách hàng');

    return `
      <tr>
        <td style="text-align:center;"><input type="checkbox" class="admin-row-chk"></td>
        <td style="text-align:center;"><span class="web-admin-stt-box">${idx + 1}</span></td>
        <td>
          <div style="font-weight:700;color:#ffffff;font-size:13.5px;line-height:1.4;">${esc(u.name || 'Người dùng Bandai')}</div>
          ${isSelf ? '<span style="font-size:10.5px;background:rgba(56,189,248,0.15);color:var(--admin-cyan);padding:2px 6px;border-radius:4px;font-weight:700;display:inline-block;margin-top:2px;">(Tài khoản của bạn)</span>' : ''}
        </td>
        <td style="white-space:nowrap;">
          <div style="font-size:13px;color:#cbd5e1;font-weight:500;font-family:var(--mono);display:inline-flex;align-items:center;gap:6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>${esc(u.email)}</span>
          </div>
        </td>
        <td style="color:#94a3b8;font-family:var(--mono);white-space:nowrap;">${esc(u.phone || '—')}</td>
        <td style="white-space:nowrap;">
          <span class="web-admin-role-badge ${roleBadgeClass}">${roleLabel}</span>
        </td>
        <td style="text-align:center;font-weight:700;color:var(--admin-cyan);font-family:var(--mono);white-space:nowrap;">${u.orderCount || 0}</td>
        <td style="white-space:nowrap;"><strong style="color:#10b981;font-size:14px;font-family:var(--mono);">${money(u.totalSpent || 0)}</strong></td>
        <td style="white-space:nowrap;">
          <span class="admin-badge ${u.status === 'locked' ? 'user-locked' : 'user-active'}">
            <span class="badge-dot"></span><span>${u.status === 'locked' ? 'Đã khóa' : 'Hoạt động'}</span>
          </span>
        </td>
        <td style="text-align:center;white-space:nowrap;">
          <div class="web-admin-action-btn-group">
            <button class="web-admin-btn-action secondary" data-view-user="${u._id || u.id}" title="Xem chi tiết tài khoản">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Chi tiết
            </button>
            <button class="web-admin-btn-action ${u.status === 'locked' ? 'success' : 'warning'}" data-toggle-user="${u._id || u.id}" ${isSelf ? 'disabled title="Bạn không thể tự khóa tài khoản của chính mình"' : 'title="Khóa / Mở khóa tài khoản"'}>
              ${u.status === 'locked' ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Mở' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Khóa'}
            </button>
            <button class="web-admin-btn-action info" data-change-role="${u._id || u.id}" ${isSelf ? 'disabled title="Bạn không thể tự đổi vai trò của chính mình"' : 'title="Phân quyền quản trị"'}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Vai trò
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const usersTableHtml = `
    <div class="web-admin-table-box">
      <table class="web-admin-table">
        <thead>
          <tr>
            <th style="width:36px;text-align:center;"><input type="checkbox" id="admin-select-all"></th>
            <th style="width:48px;text-align:center;">STT</th>
            <th style="min-width:180px;">HỌ VÀ TÊN</th>
            <th style="min-width:210px;white-space:nowrap;">EMAIL TÀI KHOẢN</th>
            <th style="width:120px;white-space:nowrap;">SỐ ĐIỆN THOẠI</th>
            <th style="width:110px;white-space:nowrap;">VAI TRÒ</th>
            <th style="text-align:center;width:90px;white-space:nowrap;">ĐƠN HÀNG</th>
            <th style="width:130px;white-space:nowrap;">TỔNG CHI TIÊU</th>
            <th style="width:110px;white-space:nowrap;">TRẠNG THÁI</th>
            <th style="text-align:center;width:200px;white-space:nowrap;">TÁC VỤ</th>
          </tr>
        </thead>
        <tbody>
          ${usersTableRows || '<tr><td colspan="10" style="text-align:center;padding:32px;color:#777;">Không có người dùng nào khớp với tìm kiếm.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  // -------------------------------------------------------------
  // HTML: TOOLBAR & TAB BODIES
  // -------------------------------------------------------------
  let mainBodyHtml = '';

  if (tab === 'overview') {
    // Recent orders snippet for overview (full width)
    const recentList = (adminStatsData?.recentOrders && adminStatsData.recentOrders.length) ? adminStatsData.recentOrders : orders.slice(0, 8);

    const recentTableHtml = `
      <div class="web-admin-table-box" style="margin-top:0;">
        <table class="web-admin-table">
          <thead>
            <tr>
              <th style="width:48px;text-align:center;">STT</th>
              <th style="width:130px;white-space:nowrap;">MÃ ĐƠN HÀNG</th>
              <th style="width:160px;white-space:nowrap;">KHÁCH HÀNG</th>
              <th style="min-width:260px;">SẢN PHẨM ĐẶT MUA</th>
              <th style="width:100px;text-align:center;white-space:nowrap;">SỐ LƯỢNG</th>
              <th style="width:130px;white-space:nowrap;">TỔNG TIỀN</th>
              <th style="width:130px;white-space:nowrap;text-align:center;">TRẠNG THÁI</th>
              <th style="width:140px;white-space:nowrap;text-align:center;">THANH TOÁN</th>
              <th style="text-align:center;width:110px;white-space:nowrap;">TÁC VỤ</th>
            </tr>
          </thead>
          <tbody>
            ${recentList.map((o, idx) => `
              <tr>
                <td style="text-align:center;"><span class="web-admin-stt-box">${idx + 1}</span></td>
                <td style="white-space:nowrap;">
                  <strong style="color:var(--admin-red);font-size:13.5px;font-family:var(--mono);letter-spacing:0.3px;">${esc(o.code)}</strong>
                  <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''}</div>
                </td>
                <td style="white-space:nowrap;">
                  <strong style="color:#ffffff;">${esc(o.recipient)}</strong>
                  <div style="font-size:12px;color:#94a3b8;display:inline-flex;align-items:center;gap:5px;margin-top:2px;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span>${esc(o.phone)}</span>
                  </div>
                </td>
                <td style="vertical-align:middle;">
                  <div style="font-size:12.5px;color:#cbd5e1;line-height:1.5;">
                    ${(o.items || []).slice(0, 3).map(i => `<div style="margin-bottom:3px;display:flex;align-items:center;gap:6px;">
                      <span style="color:#64748b;">•</span>
                      <span>${esc(i.name)}</span>
                    </div>`).join('')}
                    ${(o.items || []).length > 3 ? `<div style="color:#64748b;font-size:11px;margin-top:2px;">+ ${(o.items.length - 3)} sản phẩm khác</div>` : ''}
                  </div>
                </td>
                <td style="text-align:center;vertical-align:middle;white-space:nowrap;">
                  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                    ${(o.items || []).slice(0, 3).map(i => `<span style="color:var(--admin-cyan);background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);padding:2px 8px;border-radius:5px;font-size:12px;font-weight:700;font-family:var(--mono);">${i.quantity}</span>`).join('')}
                    ${(o.items || []).length > 3 ? `<span style="font-size:10.5px;color:#64748b;margin-top:2px;">...</span>` : ''}
                  </div>
                </td>
                <td style="white-space:nowrap;">
                  <strong style="color:#ffffff;font-size:14.5px;font-family:var(--mono);">${money(o.total)}</strong>
                  <div style="font-size:11px;color:#94a3b8;font-weight:600;margin-top:2px;">${esc(o.paymentMethod || 'COD')}</div>
                </td>
                <td style="white-space:nowrap;text-align:center;">${renderOrderStatusBadge(o.status)}</td>
                <td style="white-space:nowrap;text-align:center;">
                  <div style="display:inline-flex;flex-direction:column;gap:4px;align-items:center;">
                    ${renderPaymentBadge(o.paymentStatus || 'unpaid')}
                    ${o.paymentMethod === 'COD' ? renderCodBadge(o.codStatus || 'uncollected') : ''}
                  </div>
                </td>
                <td style="text-align:center;white-space:nowrap;">
                  <button class="web-admin-btn-action" data-order="${o.id || o._id}" title="Xem chi tiết đơn hàng">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Chi tiết
                  </button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="9" style="text-align:center;padding:36px;color:#94a3b8;">Chưa có đơn hàng nào phát sinh.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    mainBodyHtml = `
      <div class="web-admin-overview-full">
        <div class="web-admin-toolbar" style="margin-bottom:16px;">
          <div class="web-admin-toolbar-left">
            <span style="font-weight:800;color:#ffffff;font-size:14px;letter-spacing:0.3px;display:flex;align-items:center;gap:10px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--admin-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>ĐƠN HÀNG GẦN ĐÂY CẦN XỬ LÝ</span>
            </span>
            <span class="web-admin-count-pill" style="font-size:11px;padding:2px 8px;">${recentList.length} đơn mới nhất</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="web-admin-refresh-btn" id="admin-refresh-btn" title="Cập nhật lại số liệu mới nhất">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Làm mới</span>
            </button>
            <button class="web-admin-btn-action" data-tab="orders" style="background:linear-gradient(135deg,var(--admin-red),#991b1b);color:#fff;border:none;padding:8px 16px;font-weight:700;">
              <span>Xem toàn bộ đơn hàng</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
        ${recentTableHtml}
      </div>
    `;
  } else if (tab === 'orders') {
    mainBodyHtml = `
      <div class="web-admin-toolbar">
        <div class="web-admin-toolbar-left">
          <select class="web-admin-select" id="admin-bulk-select">
            <option value="">Tác vụ chọn</option>
            <option value="select-all">Chọn tất cả</option>
            <option value="deselect-all">Bỏ chọn</option>
            <option value="export-excel">Xuất Excel</option>
          </select>
          <input type="text" id="admin-search-input" class="web-admin-search-input" placeholder="Tìm theo mã đơn, tên khách, số điện thoại..." value="${esc(adminSearchQuery)}">
          <select id="admin-status-select" class="web-admin-select">
            <option value="all">Tất cả trạng thái đơn</option>
            <option value="pending" ${adminFilterStatus === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
            <option value="confirmed" ${adminFilterStatus === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
            <option value="processing" ${adminFilterStatus === 'processing' ? 'selected' : ''}>Đang chuẩn bị hàng</option>
            <option value="shipping" ${adminFilterStatus === 'shipping' ? 'selected' : ''}>Đang giao hàng</option>
            <option value="delivered" ${adminFilterStatus === 'delivered' ? 'selected' : ''}>Đã giao hàng</option>
            <option value="completed" ${adminFilterStatus === 'completed' ? 'selected' : ''}>Hoàn tất</option>
            <option value="cancelled" ${adminFilterStatus === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
            <option value="failed_delivery" ${adminFilterStatus === 'failed_delivery' ? 'selected' : ''}>Giao không thành công</option>
            <option value="returning" ${adminFilterStatus === 'returning' ? 'selected' : ''}>Đang hoàn về</option>
            <option value="returned" ${adminFilterStatus === 'returned' ? 'selected' : ''}>Đã hoàn về</option>
          </select>
          <select id="admin-pay-status-select" class="web-admin-select">
            <option value="all">Tất cả thanh toán</option>
            <option value="unpaid" ${adminFilterPayStatus === 'unpaid' ? 'selected' : ''}>Chưa thanh toán</option>
            <option value="partially_paid" ${adminFilterPayStatus === 'partially_paid' ? 'selected' : ''}>Thanh toán 1 phần</option>
            <option value="paid" ${adminFilterPayStatus === 'paid' ? 'selected' : ''}>Đã thanh toán đủ</option>
            <option value="partially_refunded" ${adminFilterPayStatus === 'partially_refunded' ? 'selected' : ''}>Đã hoàn 1 phần</option>
            <option value="refunded" ${adminFilterPayStatus === 'refunded' ? 'selected' : ''}>Đã hoàn đủ</option>
          </select>
          <button class="web-admin-refresh-btn" id="admin-refresh-btn" title="Làm mới danh sách">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Làm mới</span>
          </button>
        </div>
        <div>
          <span style="font-size:13px;color:#94a3b8;font-weight:600;">Tổng đơn khớp: <strong style="color:var(--admin-cyan);font-family:var(--mono);">${filteredOrders.length}</strong></span>
        </div>
      </div>
      ${ordersTableHtml}
    `;
  } else if (tab === 'products') {
    mainBodyHtml = `
      <div class="web-admin-toolbar">
        <div class="web-admin-toolbar-left">
          <select class="web-admin-select" id="admin-bulk-select">
            <option value="">Tác vụ chọn</option>
            <option value="select-all">Chọn tất cả</option>
            <option value="deselect-all">Bỏ chọn</option>
            <option value="export-excel">Xuất Excel</option>
          </select>
          <input type="text" id="admin-search-input" class="web-admin-search-input" placeholder="Tìm tên sản phẩm, mã SKU..." value="${esc(adminSearchQuery)}">
          <select id="admin-grade-select" class="web-admin-select">
            <option value="all">Tất cả phân cấp (Grade)</option>
            <option value="SD" ${adminFilterGrade === 'SD' ? 'selected' : ''}>SD Gundam</option>
            <option value="HG" ${adminFilterGrade === 'HG' ? 'selected' : ''}>HG (High Grade)</option>
            <option value="RG" ${adminFilterGrade === 'RG' ? 'selected' : ''}>RG (Real Grade)</option>
            <option value="MG" ${adminFilterGrade === 'MG' ? 'selected' : ''}>MG (Master Grade)</option>
            <option value="MGEX" ${adminFilterGrade === 'MGEX' ? 'selected' : ''}>MGEX Extreme</option>
            <option value="PG" ${adminFilterGrade === 'PG' ? 'selected' : ''}>PG (Perfect Grade)</option>
            <option value="Mega Size" ${adminFilterGrade === 'Mega Size' ? 'selected' : ''}>Mega Size 1/48</option>
          </select>
          <select id="admin-stock-select" class="web-admin-select">
            <option value="all">Tất cả mức tồn kho</option>
            <option value="in_stock" ${adminFilterStock === 'in_stock' ? 'selected' : ''}>Tồn an toàn (> 5)</option>
            <option value="low_stock" ${adminFilterStock === 'low_stock' ? 'selected' : ''}>Sắp hết hàng (≤ 5)</option>
            <option value="out_of_stock" ${adminFilterStock === 'out_of_stock' ? 'selected' : ''}>Hết hàng (0)</option>
          </select>
          <button class="web-admin-refresh-btn" id="admin-refresh-btn" title="Làm mới danh sách">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Làm mới</span>
          </button>
        </div>
        <div>
          <button class="web-admin-add-btn" data-new-product="true">
            <span>+</span> Thêm mới sản phẩm
          </button>
        </div>
      </div>
      ${productsTableHtml}
    `;
  } else if (tab === 'categories') {
    mainBodyHtml = `
      <div class="web-admin-toolbar">
        <div class="web-admin-toolbar-left">
          <input type="text" id="admin-search-input" class="web-admin-search-input" placeholder="Tìm tên danh mục, đường dẫn (slug)..." value="${esc(adminSearchQuery)}">
          <button class="web-admin-refresh-btn" id="admin-refresh-btn" title="Làm mới danh sách">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Làm mới</span>
          </button>
        </div>
        <div>
          <button class="web-admin-add-btn" data-category="new">
            <span>+</span> Thêm mới danh mục
          </button>
        </div>
      </div>
      ${categoriesTableHtml}
    `;
  } else if (tab === 'users') {
    mainBodyHtml = `
      <div class="web-admin-toolbar">
        <div class="web-admin-toolbar-left">
          <input type="text" id="admin-search-input" class="web-admin-search-input" placeholder="Tìm theo tên, email, số điện thoại..." value="${esc(adminSearchQuery)}">
          <select id="admin-role-select" class="web-admin-select">
            <option value="all">Tất cả vai trò</option>
            <option value="admin" ${adminFilterRole === 'admin' ? 'selected' : ''}>Quản trị viên (Admin)</option>
            <option value="staff" ${adminFilterRole === 'staff' ? 'selected' : ''}>Nhân viên (Staff)</option>
            <option value="user" ${adminFilterRole === 'user' ? 'selected' : ''}>Khách hàng (User)</option>
          </select>
          <select id="admin-status-select" class="web-admin-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="active" ${adminFilterStatus === 'active' ? 'selected' : ''}>Đang hoạt động</option>
            <option value="locked" ${adminFilterStatus === 'locked' ? 'selected' : ''}>Đã bị khóa</option>
          </select>
          <button class="web-admin-refresh-btn" id="admin-refresh-btn" title="Làm mới danh sách">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Làm mới</span>
          </button>
        </div>
        <div>
          <span style="font-size:13px;color:#94a3b8;font-weight:600;">Tổng tài khoản: <strong style="color:var(--admin-cyan);font-family:var(--mono);">${filteredUsers.length}</strong></span>
        </div>
      </div>
      ${usersTableHtml}
    `;
  }

  // -------------------------------------------------------------
  // MAIN WRAPPER RENDER
  // -------------------------------------------------------------
  container.innerHTML = `
    <div class="web-admin-wrapper ${adminSidebarCollapsed ? 'sidebar-collapsed' : ''}">
      <header class="web-admin-header">
        <a href="#admin" class="web-admin-brand-box">
          <img src="/assets/logo3cai.png" alt="3caidonhua" class="web-admin-brand-logo-img">
          <span class="brand-text">3CAIDONHUA STUDIO</span>
        </a>
        <div class="web-admin-topbar">
          <div class="web-admin-topbar-left">
            <button class="web-admin-toggle-sidebar" id="admin-toggle-sidebar" title="Thu gọn / Mở rộng menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <a href="#home" class="web-admin-site-btn" target="_blank">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              <span>Xem website cửa hàng</span>
            </a>
          </div>
          <div class="web-admin-topbar-right">
            <div class="web-admin-user-pill">
              <div class="web-admin-user-avatar-sm">
                ${esc(user.name?.charAt(0).toUpperCase() || 'A')}
                <span class="online-dot"></span>
              </div>
              <span class="web-admin-user-title">${esc(user.name || 'Admin')}</span>
            </div>
            <button class="web-admin-logout-btn" data-action="logout" title="Đăng xuất khỏi hệ thống">Đăng xuất</button>
          </div>
        </div>
      </header>

      <div class="web-admin-body">
        <aside class="web-admin-sidebar">
          <div class="web-admin-user-panel">
            <div class="web-admin-user-avatar">
              ${esc(user.name?.charAt(0).toUpperCase() || 'A')}
              <span class="online-indicator"></span>
            </div>
            <div class="web-admin-user-info">
              <div class="web-admin-user-name">${esc(user.name || 'Admin')}</div>
              <div class="web-admin-online-badge"><span class="badge-dot" style="background:#10b981;box-shadow:0 0 6px rgba(16,185,129,0.8);display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;"></span>Trực tuyến</div>
            </div>
          </div>

          <div class="web-admin-menu-header">ĐIỀU HƯỚNG VẬN HÀNH</div>

          <a class="web-admin-nav-item ${tab === 'overview' ? 'active' : ''}" data-tab="overview">
            <svg class="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span class="nav-text">BẢNG TỔNG QUAN</span>
          </a>
          <a class="web-admin-nav-item ${tab === 'orders' ? 'active' : ''}" data-tab="orders">
            <svg class="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span class="nav-text">QUẢN LÝ ĐƠN HÀNG</span>
            <span class="web-admin-badge-count red">${orders.length}</span>
          </a>
          <a class="web-admin-nav-item ${tab === 'products' ? 'active' : ''}" data-tab="products">
            <svg class="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span class="nav-text">KHO &amp; SẢN PHẨM</span>
            <span class="web-admin-badge-count blue">${adminProducts.length}</span>
          </a>
          <a class="web-admin-nav-item ${tab === 'categories' ? 'active' : ''}" data-tab="categories">
            <svg class="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
            <span class="nav-text">DANH MỤC HÀNG</span>
            <span class="web-admin-badge-count">${categoriesCount}</span>
          </a>
          <a class="web-admin-nav-item ${tab === 'users' ? 'active' : ''}" data-tab="users">
            <svg class="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-text">QUẢN TRỊ TÀI KHOẢN</span>
            <span class="web-admin-badge-count">${usersCount}</span>
          </a>
        </aside>

        <main class="web-admin-main">
          <div class="web-admin-content-header">
            <h1>${tabTitle}</h1>
            <div class="web-admin-breadcrumb">
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:3px;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Trang chủ</span>
              <span>›</span>
              <span>Quản trị</span>
              <span>›</span>
              <strong>${tabBreadcrumb}</strong>
            </div>
          </div>

          ${statsGridHtml}
          ${mainBodyHtml}
        </main>
      </div>
    </div>
  `;
}

function options(list, selected, optional = false) {
  return (optional ? '<option value="">Không áp dụng</option>' : '') + list.map(x => `<option value="${x.id || x._id}" ${(x.id == selected || x._id == selected) ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
}

function editProduct(id) {
  const p = adminProducts.find(x => x.id == id || x._id == id);
  openPanel(p ? 'Sửa thông tin sản phẩm & SKU' : 'Thêm sản phẩm mới', `
    <form id="product-form" data-id="${id || ''}" class="form-grid">
      <label>Tên sản phẩm
        <input name="name" value="${esc(p?.name)}" required maxlength="255" placeholder="Ví dụ: RG 1/144 Hi-Nu Gundam">
      </label>
      <label>Mã SKU
        <input name="sku" value="${esc(p?.sku)}" required maxlength="100" placeholder="Ví dụ: RG-HINU">
      </label>
      <label>Danh mục phân loại
        <select name="categoryId" required>${options(metadata.categories, p?.categoryId || p?.category)}</select>
      </label>
      <label>Phân cấp Gunpla (Grade)
        <select name="grade">
          <option value="">Không áp dụng (Phụ kiện / One Piece)</option>
          <option value="SD" ${p?.grade === 'SD' ? 'selected' : ''}>SD Gundam</option>
          <option value="HG" ${p?.grade === 'HG' ? 'selected' : ''}>HG (1/144 High Grade)</option>
          <option value="RG" ${p?.grade === 'RG' ? 'selected' : ''}>RG (1/144 Real Grade)</option>
          <option value="MG" ${p?.grade === 'MG' ? 'selected' : ''}>MG (1/100 Master Grade)</option>
          <option value="MGEX" ${p?.grade === 'MGEX' ? 'selected' : ''}>MGEX / Ver.Ka</option>
          <option value="PG" ${p?.grade === 'PG' ? 'selected' : ''}>PG (1/60 Perfect Grade)</option>
          <option value="Mega Size" ${p?.grade === 'Mega Size' ? 'selected' : ''}>Mega Size 1/48</option>
        </select>
      </label>
      <label>Tỷ lệ mô hình (Scale)
        <input name="scale" value="${esc(p?.scale || '1/144')}" maxlength="30" placeholder="1/144, 1/100, 1/60, Non-scale...">
      </label>
      <label>Giá bán VND (≥ 0)
        <input name="price" type="number" value="${p?.price ?? 0}" min="0" max="1000000000" step="1" required>
      </label>
      <label>Số lượng tồn kho (≥ 0)
        <input name="stock" type="number" value="${p?.stock ?? p?.quantity ?? 10}" min="0" max="100000" step="1" required>
      </label>
      <label>Ngưỡng cảnh báo sắp hết hàng
        <input name="lowStockThreshold" type="number" value="${p?.lowStockThreshold ?? 5}" min="1" max="1000" step="1" required>
      </label>
      <label>Trạng thái kinh doanh
        <select name="status">
          <option value="active" ${p?.status === 'active' ? 'selected' : ''}>Đang mở bán (Active)</option>
          <option value="inactive" ${p?.status === 'inactive' ? 'selected' : ''}>Tạm ngừng bán (Inactive)</option>
          <option value="archived" ${p?.status === 'archived' ? 'selected' : ''}>Lưu trữ / Hết vòng đời (Archived)</option>
        </select>
      </label>
      <label>Hình ảnh sản phẩm (URL hoặc đường dẫn)
        <input name="image" value="${esc(p?.image || '/assets/products/rg-hinu.jpg')}" maxlength="500">
      </label>
      <label style="grid-column: 1 / -1;">Mô tả chi tiết sản phẩm
        <textarea name="description" maxlength="10000" style="min-height:90px;">${esc(p?.description)}</textarea>
      </label>
      <div style="grid-column: 1 / -1;display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
        <button type="button" class="button secondary" data-close="true">Hủy</button>
        <button type="submit" class="button primary">Lưu sản phẩm</button>
      </div>
    </form>
  `);
}

function categoryForm(value) {
  const c = metadata.categories.find(x => x.id == value || x._id == value);
  openPanel(c ? 'Sửa thông tin danh mục' : 'Thêm danh mục mới', `
    <form id="category-form" data-id="${c?.id || c?._id || ''}" class="form-grid">
      <label>Tên danh mục
        <input name="name" value="${esc(c?.name)}" maxlength="100" required placeholder="Ví dụ: Mô hình Gundam">
      </label>
      <label>Đường dẫn SEO (Slug - để trống tự tạo)
        <input name="slug" value="${esc(c?.slug)}" maxlength="150" placeholder="mo-hinh-gundam">
      </label>
      <label>Thứ tự hiển thị
        <input name="order" type="number" value="${c?.order ?? 1}" min="1" max="999" required>
      </label>
      <label>Trạng thái hiển thị
        <select name="status">
          <option value="active" ${c?.status !== 'inactive' ? 'selected' : ''}>Hiển thị (Active)</option>
          <option value="inactive" ${c?.status === 'inactive' ? 'selected' : ''}>Tạm ẩn (Inactive)</option>
        </select>
      </label>
      <label style="grid-column: 1 / -1;">Ảnh đại diện danh mục
        <input name="image" value="${esc(c?.image || '/assets/products/rg-hinu.jpg')}" maxlength="500">
      </label>
      <label style="grid-column: 1 / -1;">Mô tả danh mục
        <textarea name="description" maxlength="2000" style="min-height:80px;">${esc(c?.description)}</textarea>
      </label>
      <div style="grid-column: 1 / -1;display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
        <button type="button" class="button secondary" data-close="true">Hủy</button>
        <button type="submit" class="button primary">Lưu danh mục</button>
      </div>
    </form>
  `);
}

function userRoleModal(userId) {
  const u = adminUsers.find(x => (x._id || x.id) == userId);
  if (!u) return;
  openPanel('Phân quyền tài khoản ' + (u.name || u.email), `
    <form id="user-role-form" data-id="${u._id || u.id}" class="form-grid">
      <p style="grid-column:1 / -1;font-size:13px;color:#cbd5e1;">
        Cập nhật quyền hạn cho tài khoản <strong>${esc(u.email)}</strong>. Quản trị viên duy nhất sẽ không thể bị hạ quyền.
      </p>
      <label style="grid-column:1 / -1;">Vai trò hệ thống
        <select name="role">
          <option value="user" ${u.role === 'user' ? 'selected' : ''}>Khách hàng (User) - Chỉ mua hàng & theo dõi đơn</option>
          <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Nhân viên (Staff) - Quản lý đơn & kho hàng</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Quản trị viên (Admin) - Toàn quyền hệ thống</option>
        </select>
      </label>
      <div style="grid-column:1 / -1;display:flex;justify-content:flex-end;gap:10px;margin-top:14px;">
        <button type="button" class="button secondary" data-close="true">Đóng</button>
        <button type="submit" class="button primary">Cập nhật vai trò</button>
      </div>
    </form>
  `);
}

function adminOrderDetail(id) {
  const o = orders.find(x => x.id == id || x._id == id);
  if (!o) {
    toast('Không tìm thấy thông tin đơn hàng.');
    return;
  }

  const choices = allowedTransitions[o.status] || [];
  const items = o.items || [];
  const history = o.statusHistory || [];
  const returns = o.returnRequests || [];
  const refunds = o.refundRequests || [];

  const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
  const totalMoney = o.total || 0;
  const paid = o.amountPaid || 0;
  const refunded = o.amountRefunded || 0;
  const balance = Math.max(0, totalMoney - paid);

  openPanel('Chi tiết Đơn hàng ' + o.code, `
    <div style="font-size:13.5px;color:#f1f5f9;line-height:1.5;">
      <!-- TOP STATUS STRIP -->
      <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <div>
          <span style="font-size:12px;color:#94a3b8;">MÃ ĐƠN:</span>
          <strong style="font-size:16px;color:var(--admin-red);letter-spacing:0.5px;margin-left:4px;font-family:var(--mono);">${esc(o.code)}</strong>
          <span style="font-size:12px;color:#94a3b8;margin-left:8px;">(${o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''})</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="admin-badge status-${o.status}"><span class="badge-dot"></span><span>${orderStatusLabels[o.status] || o.status}</span></span>
          <span class="admin-badge ${o.paymentStatus === 'paid' ? 'pay-paid' : (o.paymentStatus.includes('refund') ? 'pay-refunded' : 'pay-unpaid')}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <span>${paymentStatusLabels[o.paymentStatus] || o.paymentStatus}</span>
          </span>
          ${o.paymentMethod === 'COD' ? `<span class="admin-badge ${o.codStatus === 'reconciled' ? 'cod-reconciled' : (o.codStatus === 'carrier_collected' ? 'cod-collected' : 'cod-uncollected')}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg><span>${codStatusLabels[o.codStatus] || o.codStatus}</span></span>` : ''}
        </div>
      </div>

      <!-- 2-COL INFO GRID -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
        <!-- Column 1: Customer & Delivery -->
        <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;padding:16px;">
          <div style="font-weight:700;color:#ffffff;border-bottom:1px solid var(--admin-border);padding-bottom:10px;margin-bottom:12px;font-size:13.5px;display:flex;align-items:center;gap:8px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--admin-cyan)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>THÔNG TIN NGƯỜI NHẬN &amp; GIAO HÀNG</span>
          </div>
          <div style="line-height:1.8;font-size:13px;color:#cbd5e1;">
            <div><strong>Họ và tên:</strong> <span style="color:#ffffff;">${esc(o.recipient)}</span></div>
            <div><strong>Điện thoại:</strong> <a href="tel:${esc(o.phone)}" style="color:var(--admin-cyan);text-decoration:none;font-weight:600;font-family:var(--mono);">${esc(o.phone)}</a></div>
            <div><strong>Địa chỉ:</strong> ${esc(o.address)}</div>
            <div><strong>Đơn vị vận chuyển:</strong> <span style="color:#ffffff;">${esc(o.carrier || 'Giao Hàng Nhanh')}</span></div>
            <div><strong>Mã vận đơn:</strong> <code style="background:rgba(255,255,255,0.06);color:var(--admin-cyan);border:1px solid rgba(255,255,255,0.1);padding:3px 8px;border-radius:4px;font-family:var(--mono);font-size:12px;">${esc(o.trackingNumber || 'GHN' + (o.id || o._id).slice(-6).toUpperCase())}</code></div>
            ${o.note ? `<div style="margin-top:8px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);padding:8px 12px;border-radius:6px;font-size:12.5px;color:#fbbf24;"><strong>Ghi chú:</strong> ${esc(o.note)}</div>` : ''}
            ${o.cancelReason ? `<div style="margin-top:8px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);padding:8px 12px;border-radius:6px;font-size:12.5px;color:#ff5e52;"><strong>Lý do hủy đơn:</strong> ${esc(o.cancelReason)}</div>` : ''}
            ${o.failedDeliveryReason ? `<div style="margin-top:8px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);padding:8px 12px;border-radius:6px;font-size:12.5px;color:#ff5e52;"><strong>Lý do giao thất bại (${o.failedDeliveryCount || 1} lần):</strong> ${esc(o.failedDeliveryReason)}</div>` : ''}
          </div>
        </div>

        <!-- Column 2: Financial Summary -->
        <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;padding:16px;">
          <div style="font-weight:700;color:#ffffff;border-bottom:1px solid var(--admin-border);padding-bottom:10px;margin-bottom:12px;font-size:13.5px;display:flex;align-items:center;gap:8px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/></svg>
            <span>TỔNG QUAN TÀI CHÍNH &amp; THANH TOÁN</span>
          </div>
          <div style="line-height:1.9;font-size:13px;color:#cbd5e1;">
            <div style="display:flex;justify-content:space-between;"><span>Hình thức thanh toán:</span><strong style="color:#ffffff;">${esc(o.paymentMethod || 'COD')}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>Tiền hàng:</span><span style="font-family:var(--mono);">${money(subtotal)}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Phí vận chuyển:</span><span>${o.shippingFee ? money(o.shippingFee) : 'Miễn phí'}</span></div>
            ${o.discountAmount ? `<div style="display:flex;justify-content:space-between;color:#10b981;"><span>Giảm giá (${esc(o.discountCode || '')}):</span><span style="font-family:var(--mono);">-${money(o.discountAmount)}</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;border-top:1px dashed rgba(255,255,255,0.15);padding-top:8px;margin-top:6px;font-size:15px;">
              <strong style="color:#ffffff;">Tổng thanh toán:</strong>
              <strong style="color:var(--admin-red);font-family:var(--mono);">${money(totalMoney)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;color:#10b981;"><span>Đã thanh toán:</span><strong style="font-family:var(--mono);">${money(paid)}</strong></div>
            ${refunded > 0 ? `<div style="display:flex;justify-content:space-between;color:#ff5e52;"><span>Đã hoàn tiền:</span><strong style="font-family:var(--mono);">-${money(refunded)}</strong></div>` : ''}
            ${balance > 0 ? `<div style="display:flex;justify-content:space-between;color:#fbbf24;font-weight:700;"><span>Còn lại cần thu/đối soát:</span><strong style="font-family:var(--mono);">${money(balance)}</strong></div>` : ''}
          </div>
        </div>
      </div>

      <!-- PRODUCTS TABLE -->
      <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <div style="background:rgba(255,255,255,0.03);padding:12px 16px;font-weight:700;color:#ffffff;font-size:13px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;gap:8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--admin-amber)" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <span>DANH SÁCH MÔ HÌNH TRONG ĐƠN (${items.length} mặt hàng)</span>
        </div>
        <table class="web-admin-table" style="margin:0;">
          <thead>
            <tr>
              <th style="width:48px;text-align:center;">STT</th>
              <th style="width:46px;text-align:center;">ẢNH</th>
              <th>MÔ HÌNH GUNDAM</th>
              <th>MÃ SKU</th>
              <th style="text-align:right;">ĐƠN GIÁ</th>
              <th style="text-align:center;width:100px;">SỐ LƯỢNG</th>
              <th style="text-align:right;">THÀNH TIỀN</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((it, idx) => `
              <tr>
                <td style="text-align:center;"><span class="web-admin-stt-box">${idx + 1}</span></td>
                <td style="text-align:center;">
                  <img src="${esc(it.image || '/assets/hero-poster.jpg')}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);">
                </td>
                <td><strong style="color:#ffffff;">${esc(it.name)}</strong></td>
                <td><code style="font-size:11.5px;color:var(--admin-cyan);font-family:var(--mono);">${esc(it.sku || 'KIT-BANDAI')}</code></td>
                <td style="text-align:right;font-family:var(--mono);">${money(it.price)}</td>
                <td style="text-align:center;font-weight:700;color:var(--admin-cyan);font-family:var(--mono);">${it.quantity}</td>
                <td style="text-align:right;font-weight:700;color:#ffffff;font-family:var(--mono);">${money(it.price * it.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- SECTION: CHUYỂN TRẠNG THÁI ĐƠN HÀNG (STRICT ENFORCEMENT) -->
      <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;padding:18px;margin-bottom:18px;">
        <div style="font-weight:700;color:#ffffff;font-size:13.5px;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--admin-cyan)" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <span>QUY TRÌNH XỬ LÝ TRẠNG THÁI ĐƠN</span>
        </div>

        ${choices.length ? `
          <form id="admin-order-status-form" data-id="${o.id || o._id}" class="form-grid" style="grid-template-columns:1fr 1.5fr auto;align-items:end;gap:12px;">
            <label>Chuyển bước kế tiếp sang
              <select name="status" id="admin-next-status-select" required>
                ${choices.map(s => `<option value="${s}">${orderStatusLabels[s] || s}</option>`).join('')}
              </select>
            </label>
            <label>Lý do / Ghi chú (Bắt buộc khi hủy đơn hoặc giao thất bại)
              <input name="reason" id="admin-status-reason-input" placeholder="Nhập lý do chuyển trạng thái...">
            </label>
            <button type="submit" class="button primary" style="height:40px;padding:0 20px;margin-bottom:1px;width:auto;">Cập nhật trạng thái</button>
          </form>
          <div style="font-size:11.5px;color:#94a3b8;margin-top:8px;">
            * Quy tắc vận hành: Hủy trước khi xuất kho sẽ tự động hoàn tồn kho. Đơn COD khi "Đã giao hàng" sẽ chuyển COD sang ĐVVC đã thu tiền. Khi "Hoàn tất", doanh thu mới được ghi nhận vào báo cáo.
          </div>
        ` : `
          <div style="background:rgba(255,255,255,0.04);padding:12px 16px;border-radius:8px;color:#94a3b8;font-size:13px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Đơn hàng đã ở trạng thái kết thúc (<strong style="color:#ffffff;">${orderStatusLabels[o.status] || o.status}</strong>), không thể thay đổi tiến trình tiếp theo.</span>
          </div>
        `}
      </div>

      <!-- SECTION: TÀI CHÍNH, COD & THANH TOÁN ĐỘC LẬP -->
      <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;padding:18px;margin-bottom:18px;">
        <div style="font-weight:700;color:#ffffff;font-size:13.5px;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--admin-cyan)" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <span>ĐỐI SOÁT COD &amp; CẬP NHẬT THANH TOÁN ĐỘC LẬP</span>
        </div>
        <form id="admin-order-payment-form" data-id="${o.id || o._id}" class="form-grid" style="grid-template-columns:1fr 1fr 1fr auto;align-items:end;gap:12px;">
          <label>Trạng thái thanh toán
            <select name="paymentStatus">
              <option value="unpaid" ${o.paymentStatus === 'unpaid' ? 'selected' : ''}>Chưa thanh toán</option>
              <option value="partially_paid" ${o.paymentStatus === 'partially_paid' ? 'selected' : ''}>Thanh toán một phần</option>
              <option value="paid" ${o.paymentStatus === 'paid' ? 'selected' : ''}>Đã thanh toán đủ</option>
              <option value="partially_refunded" ${o.paymentStatus === 'partially_refunded' ? 'selected' : ''}>Đã hoàn một phần</option>
              <option value="refunded" ${o.paymentStatus === 'refunded' ? 'selected' : ''}>Đã hoàn tiền đủ</option>
            </select>
          </label>
          <label>Trạng thái đối soát COD
            <select name="codStatus">
              <option value="uncollected" ${o.codStatus === 'uncollected' ? 'selected' : ''}>Chưa thu COD</option>
              <option value="carrier_collected" ${o.codStatus === 'carrier_collected' ? 'selected' : ''}>ĐVVC đã thu tiền (chưa đối soát)</option>
              <option value="reconciled" ${o.codStatus === 'reconciled' ? 'selected' : ''}>Đã đối soát vào ví shop</option>
            </select>
          </label>
          <label>Số tiền thực tế đã thu (VND)
            <input name="amountPaid" type="number" min="0" max="${totalMoney * 2}" step="1000" value="${paid}">
          </label>
          <button type="submit" class="button primary" style="height:40px;padding:0 20px;margin-bottom:1px;width:auto;">Lưu thanh toán</button>
        </form>
      </div>

      <!-- SECTION: ĐỔI TRẢ & HOÀN TIỀN -->
      <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;padding:18px;margin-bottom:18px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
          <div style="font-weight:700;color:#ffffff;font-size:13.5px;display:flex;align-items:center;gap:8px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <span>QUẢN LÝ ĐỔI / TRẢ HÀNG &amp; HOÀN TIỀN</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="web-admin-btn-action secondary" data-open-return-modal="${o.id || o._id}">+ Tạo phiếu đổi / trả</button>
            <button class="web-admin-btn-action warning" data-open-refund-modal="${o.id || o._id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Hoàn tiền</button>
          </div>
        </div>

        ${returns.length ? `
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;margin-bottom:10px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">HỒ SƠ ĐỔI TRẢ ĐÃ TẠO:</div>
            ${returns.map(r => `
              <div style="background:rgba(14,20,32,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:12.5px;">
                <div>
                  <strong style="color:var(--admin-cyan);font-family:var(--mono);">#${esc(r.requestCode)}</strong> —
                  <span style="color:#ffffff;">${r.desiredAction === 'exchange' ? 'Đổi hàng mới' : 'Trả hàng hoàn tiền'}</span>
                  <div style="color:#94a3b8;font-size:11.5px;margin-top:2px;">Lý do: ${esc(r.reason)} | Đánh giá hàng: <strong>${r.inspectionResult === 'restockable' ? 'Đạt (Nhập kho)' : (r.inspectionResult === 'damaged' ? 'Lỗi (Không nhập)' : 'Đang giám định')}</strong></div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="admin-badge ${r.status === 'resolved' ? 'status-completed' : 'status-pending'}">${r.status === 'resolved' ? 'Đã giải quyết' : 'Chờ xử lý'}</span>
                  ${r.status !== 'resolved' ? `
                    <button class="web-admin-btn-action success" data-resolve-return="${o.id || o._id}" data-req-code="${r.requestCode}" data-result="restockable" title="Kiểm tra đạt chuẩn, tự động nhập lại kho">Duyệt &amp; Nhập kho</button>
                    <button class="web-admin-btn-action danger" data-resolve-return="${o.id || o._id}" data-req-code="${r.requestCode}" data-result="damaged" title="Hàng hỏng không thể bán lại">Bỏ qua kho</button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:8px;">Chưa có yêu cầu đổi / trả nào cho đơn hàng này.</div>'}

        ${refunds.length ? `
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">LỊCH SỬ HOÀN TIỀN:</div>
            ${refunds.map(rf => `
              <div style="font-size:12.5px;color:#cbd5e1;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                • Đã hoàn <strong style="color:#ff5e52;font-family:var(--mono);">${money(rf.amount)}</strong> (${rf.method || 'VietQR'}) - Lý do: ${esc(rf.reason)} - Mã GD: <code style="font-family:var(--mono);color:var(--admin-cyan);">${esc(rf.transactionRef || 'N/A')}</code>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- SECTION: NHẬT KÝ THAO TÁC / AUDIT TRAIL -->
      <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;padding:18px;">
        <div style="font-weight:700;color:#ffffff;font-size:13.5px;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--admin-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>NHẬT KÝ VẬN HÀNH &amp; AUDIT TIMELINE</span>
        </div>

        ${returns.length ? `
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;margin-bottom:10px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">HỒ SƠ ĐỔI TRẢ ĐÃ TẠO:</div>
            ${returns.map(r => `
              <div style="background:rgba(14,20,32,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:12.5px;">
                <div>
                  <strong style="color:var(--admin-cyan);font-family:var(--mono);">#${esc(r.requestCode)}</strong> —
                  <span style="color:#ffffff;">${r.desiredAction === 'exchange' ? 'Đổi hàng mới' : 'Trả hàng hoàn tiền'}</span>
                  <div style="color:#94a3b8;font-size:11.5px;margin-top:2px;">Lý do: ${esc(r.reason)} | Đánh giá hàng: <strong>${r.inspectionResult === 'restockable' ? 'Đạt (Nhập kho)' : (r.inspectionResult === 'damaged' ? 'Lỗi (Không nhập)' : 'Đang giám định')}</strong></div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="admin-badge ${r.status === 'resolved' ? 'status-completed' : 'status-pending'}">${r.status === 'resolved' ? 'Đã giải quyết' : 'Chờ xử lý'}</span>
                  ${r.status !== 'resolved' ? `
                    <button class="web-admin-btn-action success" data-resolve-return="${o.id || o._id}" data-req-code="${r.requestCode}" data-result="restockable" title="Kiểm tra đạt chuẩn, tự động nhập lại kho">Duyệt &amp; Nhập kho</button>
                    <button class="web-admin-btn-action danger" data-resolve-return="${o.id || o._id}" data-req-code="${r.requestCode}" data-result="damaged" title="Hàng hỏng không thể bán lại">Bỏ qua kho</button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:8px;">Chưa có yêu cầu đổi / trả nào cho đơn hàng này.</div>'}

        ${refunds.length ? `
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">LỊCH SỬ HOÀN TIỀN:</div>
            ${refunds.map(rf => `
              <div style="font-size:12.5px;color:#cbd5e1;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                • Đã hoàn <strong style="color:#ff5e52;font-family:var(--mono);">${money(rf.amount)}</strong> (${rf.method || 'VietQR'}) - Lý do: ${esc(rf.reason)} - Mã GD: <code style="font-family:var(--mono);color:var(--admin-cyan);">${esc(rf.transactionRef || 'N/A')}</code>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- SECTION: NHẬT KÝ THAO TÁC / AUDIT TRAIL -->
      <div style="background:rgba(18,24,38,0.95);border:1px solid var(--admin-border);border-radius:10px;padding:18px;">
        <div style="font-weight:700;color:#ffffff;font-size:13.5px;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--admin-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>NHẬT KÝ VẬN HÀNH &amp; AUDIT TIMELINE</span>
        </div>
        <div style="max-height:180px;overflow-y:auto;padding-right:6px;">
          ${history.length ? history.map(h => `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12.5px;">
              <span style="color:var(--admin-cyan);font-weight:600;min-width:130px;font-family:var(--mono);">${h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN') : ''}</span>
              <span style="font-weight:700;color:#ffffff;min-width:110px;">${esc(h.actor || 'Quản trị viên')}:</span>
              <span style="color:#cbd5e1;flex:1;">
                ${esc(h.action)}
                ${h.note ? `<span style="color:#94a3b8;"> — "${esc(h.note)}"</span>` : ''}
              </span>
            </div>
          `).reverse().join('') : '<div style="font-size:12.5px;color:#94a3b8;">Chưa có ghi nhận nhật ký thao tác.</div>'}
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;margin-top:20px;">
        <button class="button secondary" data-close="true">Đóng chi tiết đơn</button>
      </div>
    </div>
  `);
}

function adminReturnRequestModal(orderId) {
  const o = orders.find(x => x.id == orderId || x._id == orderId);
  if (!o) return;
  openPanel('Tạo hồ sơ Đổi / Trả hàng cho ' + o.code, `
    <form id="admin-order-return-form" data-id="${o.id || o._id}" class="form-grid">
      <p style="grid-column:1 / -1;font-size:13px;color:#cbd5e1;">
        Tiếp nhận yêu cầu Đổi hoặc Trả hàng từ khách hàng <strong>${esc(o.recipient)}</strong>.
      </p>
      <label>Phương án xử lý
        <select name="desiredAction">
          <option value="refund">Trả hàng &amp; Hoàn tiền (Refund)</option>
          <option value="exchange">Đổi sang mẫu Gunpla khác (Exchange)</option>
        </select>
      </label>
      <label>Số tiền hoàn dự kiến (VND)
        <input name="refundAmount" type="number" min="0" max="${o.amountPaid || o.total}" value="${o.amountPaid || o.total}" step="1000">
      </label>
      <label>Bên chịu phí vận chuyển hoàn
        <select name="shippingFeePayer">
          <option value="shop">Cửa hàng chịu phí (Hàng lỗi / bể runner do shop)</option>
          <option value="customer">Khách hàng chịu phí (Đổi ý muốn đổi mẫu khác)</option>
        </select>
      </label>
      <label>Lý do đổi trả chi tiết
        <input name="reason" required placeholder="Ví dụ: Giao nhầm mã, gãy runner giáp A...">
      </label>
      <label style="grid-column:1 / -1;">Ghi chú nội bộ
        <textarea name="note" style="min-height:70px;" placeholder="Ghi chú thêm về tình trạng hộp, runner..."></textarea>
      </label>
      <div style="grid-column:1 / -1;display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
        <button type="button" class="button secondary" data-close="true">Hủy</button>
        <button type="submit" class="button primary">Tạo hồ sơ đổi trả</button>
      </div>
    </form>
  `);
}

function adminRefundModal(orderId) {
  const o = orders.find(x => x.id == orderId || x._id == orderId);
  if (!o) return;
  const maxRefundable = Math.max(0, (o.amountPaid || 0) - (o.amountRefunded || 0));
  openPanel('Hoàn tiền cho đơn hàng ' + o.code, `
    <form id="admin-order-refund-form" data-id="${o.id || o._id}" class="form-grid">
      <p style="grid-column:1 / -1;font-size:13px;color:#cbd5e1;">
        Khách đã thanh toán: <strong style="color:#ffffff;font-family:var(--mono);">${money(o.amountPaid || 0)}</strong> · Đã hoàn trước đó: <strong style="color:#ffffff;font-family:var(--mono);">${money(o.amountRefunded || 0)}</strong><br>
        Số tiền tối đa có thể hoàn thêm: <strong style="color:#ff5e52;font-family:var(--mono);">${money(maxRefundable)}</strong>
      </p>
      <label>Số tiền hoàn (VND)
        <input name="amount" type="number" min="1000" max="${maxRefundable}" value="${maxRefundable}" step="1000" required>
      </label>
      <label>Phương thức hoàn trả
        <select name="method">
          <option value="Chuyển khoản VietQR">Chuyển khoản VietQR</option>
          <option value="Tiền mặt trực tiếp">Tiền mặt trực tiếp tại shop</option>
          <option value="Ví điện tử">Ví điện tử Momo / ZaloPay</option>
        </select>
      </label>
      <label>Mã giao dịch ngân hàng / Ref
        <input name="transactionRef" placeholder="Ví dụ: VCB-982314">
      </label>
      <label>Lý do hoàn tiền
        <input name="reason" required placeholder="Ví dụ: Khách hoàn hàng nguyên vẹn, bồi hoàn phí...">
      </label>
      <div style="grid-column:1 / -1;display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
        <button type="button" class="button secondary" data-close="true">Hủy</button>
        <button type="submit" class="button primary">Xác nhận hoàn tiền</button>
      </div>
    </form>
  `);
}

/* ==========================================================================
   ROUTING
   ========================================================================== */
async function route() {
  const hash = location.hash;
  const isAdmin = hash === '#admin';
  const isCheckout = hash === '#checkout';
  const isProductDetail = hash.startsWith('#product-');
  const isAuth = (hash === '#login' || hash === '#register' || hash === '#auth');
  const isAccount = (hash === '#account' || hash === '#orders' || hash === '#tracking');

  $('#storefront').hidden = isAdmin;
  $('#admin').hidden = !isAdmin;
  document.body.classList.toggle('admin-mode', isAdmin);
  document.body.classList.toggle('checkout-mode', isCheckout);
  document.body.classList.toggle('product-detail-mode', isProductDetail);
  document.body.classList.toggle('auth-mode', isAuth);
  document.body.classList.toggle('account-mode', isAccount);

  if (panel && panel.open) panel.close();

  if (isAdmin) {
    if (video) video.pause();
    renderAdmin();
    await loadAdmin();
    window.scrollTo(0, 0);
    return;
  }

  if (hash === '#cart') { await refreshCart(); cartPanel(); }

  let activePage = 'home';
  let activeProductId = null;

  if (hash.startsWith('#product-')) {
    activePage = 'product-detail';
    activeProductId = hash.slice(9);
  } else if (hash.startsWith('#catalog')) {
    activePage = 'catalog';
  } else if (hash === '#grades') {
    activePage = 'grades';
  } else if (hash === '#about') {
    activePage = 'about';
  } else if (hash === '#checkout') {
    activePage = 'checkout';
  } else if (isAuth) {
    activePage = 'auth';
  } else if (isAccount) {
    activePage = 'account';
  } else if (hash === '#home' || !hash || hash === '#cart') {
    activePage = 'home';
  }

  const pageHome = $('#page-home');
  const pageCatalog = $('#page-catalog');
  const pageGrades = $('#page-grades');
  const pageAbout = $('#page-about');
  const pageCheckout = $('#page-checkout');
  const pageProductDetail = $('#page-product-detail');
  const pageAuth = $('#page-auth');
  const pageAccount = $('#page-account');

  if (pageHome) pageHome.hidden = activePage !== 'home';
  if (pageCatalog) pageCatalog.hidden = activePage !== 'catalog';
  if (pageGrades) pageGrades.hidden = activePage !== 'grades';
  if (pageAbout) pageAbout.hidden = activePage !== 'about';
  if (pageCheckout) pageCheckout.hidden = activePage !== 'checkout';
  if (pageProductDetail) pageProductDetail.hidden = activePage !== 'product-detail';
  if (pageAuth) pageAuth.hidden = activePage !== 'auth';
  if (pageAccount) pageAccount.hidden = activePage !== 'account';

  if (activePage === 'product-detail') {
    if (video) video.pause();
    renderProductDetailPage(activeProductId);
  } else if (activePage === 'checkout') {
    if (video) video.pause();
    renderDedicatedCheckout();
  } else if (activePage === 'auth') {
    if (video) video.pause();
    renderAuthPage(hash === '#register' ? 'register' : 'login');
  } else if (activePage === 'account') {
    if (video) video.pause();
    const subTab = hash === '#tracking' ? 'tracking' : (hash === '#orders' ? 'orders' : undefined);
    await renderAccountPage(subTab);
  } else if (activePage === 'catalog') {
    if (video) video.pause();
    renderProducts();
  } else if (activePage === 'home') {
    renderHomeFeatured();
    if (video && !matchMedia('(prefers-reduced-motion: reduce)').matches && video.paused) {
      video.play().catch(() => {});
    }
  } else {
    if (video) video.pause();
  }

  document.querySelectorAll('.desktop-nav > a, .desktop-nav > .nav-dropdown-item > a.nav-dropdown-trigger, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    const isCurrent = (href === '#' + activePage) || (activePage === 'home' && href === '#home') || (activePage === 'account' && (href === '#tracking' || href === '#account'));
    a.classList.toggle('active', Boolean(isCurrent));
  });
  document.querySelectorAll('.mega-column a').forEach(a => a.classList.remove('active'));

  if (hash !== '#cart') {
    window.scrollTo(0, 0);
  }
}

/* ==========================================================================
   EVENT HANDLERS
   ========================================================================== */
async function handleClick(target) {
  if (target.dataset.confirmTransfer || target.dataset.simulateTransfer) {
    const isSimulate = Boolean(target.dataset.simulateTransfer);
    const transferBillId = target.dataset.confirmTransfer || target.dataset.simulateTransfer;
    const parentBox = document.getElementById('qr-payment-container-' + transferBillId) || target.closest('#page-checkout');

    if (isSimulate) {
      target.disabled = true;
      target.textContent = '⏳ Đang chờ ngân hàng gửi Webhook...';
      toast('Đang mô phỏng biến động số dư Techcombank/MoMo...');
      await new Promise(r => setTimeout(r, 2200));
    }

    try {
      target.disabled = true;
      target.textContent = '⏳ Đang xử lý lên đơn...';
      const updatedBill = await api('/bills/' + transferBillId, 'PUT', {
        paymentStatus: 'paid',
        status: 'processing',
        actor: isSimulate ? 'SePay Webhook (Mô phỏng)' : 'Khách hàng xác nhận QR'
      });

      toast('🎉 Thanh toán thành công! Đã tự động lên đơn chuẩn bị giao hàng.');

      if (parentBox) {
        const trackingNum = updatedBill.trackingNumber || ('GHN' + (updatedBill._id || transferBillId).slice(-6).toUpperCase());
        const billCode = updatedBill.code || ('HD' + (updatedBill._id || transferBillId).slice(-6).toUpperCase());
        parentBox.innerHTML = `
          <div style="background:#ecfdf5;border:2px solid #059669;border-radius:14px;padding:28px 20px;text-align:center;box-shadow:0 8px 24px rgba(5,150,105,0.15);margin-bottom:24px;">
            <div style="width:64px;height:64px;background:#d1fae5;color:#059669;font-size:32px;font-weight:900;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px auto;box-shadow:0 4px 12px rgba(5,150,105,0.2);">✓</div>
            <h3 style="color:#065f46;font-size:21px;font-weight:800;margin-bottom:8px;">THANH TOÁN THÀNH CÔNG!</h3>
            <p style="color:#047857;font-size:14px;line-height:1.6;margin-bottom:18px;">
              Hệ thống đã tự động ghi nhận thanh toán và chuyển đơn sang khâu:<br>
              <strong style="background:#059669;color:#ffffff;padding:4px 14px;border-radius:20px;display:inline-block;margin-top:6px;font-size:14.5px;letter-spacing:0.3px;">📦 ĐANG CHUẨN BỊ HÀNG</strong>
            </p>
            <div style="background:#ffffff;border:1px solid #a7f3d0;border-radius:10px;padding:16px;max-width:440px;margin:0 auto 20px auto;text-align:left;font-size:13.5px;line-height:1.9;">
              <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Mã đơn hàng:</span><strong style="color:#e60012;">${esc(billCode)}</strong></div>
              <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Trạng thái tài chính:</span><strong style="color:#059669;">Đã thanh toán đủ</strong></div>
              <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Đơn vị vận chuyển:</span><strong>Giao Hàng Nhanh</strong></div>
              <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Mã vận đơn bưu cục:</span><strong style="color:#0284c7;letter-spacing:0.5px;">${esc(trackingNum)}</strong></div>
              <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Dự kiến giao hàng:</span><strong>2 - 3 ngày làm việc</strong></div>
            </div>
            <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
              <button type="button" class="button" data-track-code="${esc(billCode)}" style="background:#059669;color:#ffffff;border:none;min-height:44px;padding:11px 24px;font-weight:700;box-shadow:0 4px 12px rgba(5,150,105,0.25);display:inline-flex;align-items:center;gap:8px;border-radius:8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Xem tiến trình đơn hàng (${esc(billCode)})</span>
              </button>
              <a href="#catalog" class="button" style="background:#ffffff;color:#334155;border:1px solid #cbd5e1;min-height:44px;padding:11px 20px;display:inline-flex;align-items:center;gap:8px;border-radius:8px;text-decoration:none;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span>Tiếp tục mua sắm</span>
              </a>
            </div>
          </div>
        `;
      }
    } catch (e) {
      toast('Lỗi cập nhật: ' + e.message);
      if (target) {
        target.disabled = false;
        target.textContent = 'Thử lại';
      }
    }
    return;
  }

  if (target.dataset.catalogPage) {
    catalogPage = Number(target.dataset.catalogPage);
    renderProducts();
    const catSection = $('#catalog') || $('#page-catalog');
    if (catSection) {
      window.scrollTo({ top: catSection.offsetTop - 50, behavior: 'smooth' });
    }
    return;
  }

  if (target.dataset.add) { await addToCart(target.dataset.add); return; }

  // Product detail page: Mua ngay & Thêm giỏ hàng
  if (target.dataset.pdetailBuy) {
    const id = target.dataset.pdetailBuy;
    const ok = await addToCart(id, currentDetailQty);
    if (ok) {
      location.hash = 'checkout';
    }
    return;
  }

  if (target.dataset.pdetailCart) {
    const id = target.dataset.pdetailCart;
    const ok = await addToCart(id, currentDetailQty);
    if (ok) {
      await refreshCart();
      cartPanel();
    }
    return;
  }

  // Product detail accordion toggle
  if (target.dataset.toggleAcc || target.closest('[data-toggle-acc]')) {
    const btn = target.dataset.toggleAcc ? target : target.closest('[data-toggle-acc]');
    const key = btn.dataset.toggleAcc;
    const item = $(`#acc-${key}`);
    if (item) item.classList.toggle('open');
    return;
  }

  // Product detail quantity buttons
  if (target.id === 'pdetail-minus') {
    currentDetailQty = Math.max(1, currentDetailQty - 1);
    const inputEl = $('#pdetail-qty-input');
    if (inputEl) inputEl.value = String(currentDetailQty);
    return;
  }
  if (target.id === 'pdetail-plus') {
    const p = products.find(x => location.hash.replace('#product-', '') == (x.id || x._id));
    const maxStock = p ? ((p.stock !== undefined ? p.stock : p.quantity) ?? 15) : 15;
    if (currentDetailQty >= maxStock) {
      toast(`Rất xin lỗi quý khách! Hiện tại shop chỉ còn ${maxStock} cái trong kho.`);
      return;
    }
    currentDetailQty += 1;
    const inputEl = $('#pdetail-qty-input');
    if (inputEl) inputEl.value = String(currentDetailQty);
    return;
  }

  // Product detail thumbnail switcher
  if (target.dataset.switchThumb || target.closest('[data-switch-thumb]')) {
    const btn = target.dataset.switchThumb ? target : target.closest('[data-switch-thumb]');
    document.querySelectorAll('.pdetail-thumb-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mainImg = $('#pdetail-main-image');
    if (mainImg) {
      if (btn.dataset.imgSrc) {
        mainImg.src = btn.dataset.imgSrc;
      }
      mainImg.style.objectPosition = 'center center';
      mainImg.style.transform = 'scale(1)';
    }
    return;
  }

  // Checkout quantity & remove
  if (target.dataset.checkoutQty) {
    const variantId = target.dataset.checkoutQty;
    const delta = Number(target.dataset.delta || 0);
    const line = cart.find(x => x.variantId == variantId || x.id == variantId);
    if (line) {
      const p = products.find(x => x.id == variantId || x._id == variantId || x.variantId == variantId);
      const maxStock = p ? ((p.stock !== undefined ? p.stock : p.quantity) ?? 0) : (line.stock || 999);
      const quantity = Math.max(1, line.quantity + delta);
      if (delta > 0 && quantity > maxStock) {
        toast(`Rất xin lỗi quý khách! Hiện tại shop chỉ còn ${maxStock} cái trong kho.`);
        return;
      }
      try {
        cart = await api('/cart/items/' + variantId, 'PUT', { quantity });
        count();
        renderDedicatedCheckout();
      } catch (err) {
        toast(err.message || 'Không thể cập nhật số lượng.');
      }
    }
    return;
  }

  if (target.dataset.checkoutRemove) {
    const variantId = target.dataset.checkoutRemove;
    cart = await api('/cart/items/' + variantId, 'DELETE');
    count();
    renderDedicatedCheckout();
    toast('Đã xóa sản phẩm khỏi giỏ hàng.');
    return;
  }

  // Drawer cart quantity & remove
  if (target.dataset.qty || target.dataset.remove) {
    const variantId = target.dataset.qty || target.dataset.remove;
    const line = cart.find(x => x.variantId == variantId || x.id == variantId);
    const delta = Number(target.dataset.delta || 0);
    const p = products.find(x => x.id == variantId || x._id == variantId || x.variantId == variantId);
    const maxStock = p ? ((p.stock !== undefined ? p.stock : p.quantity) ?? 0) : (line?.stock || 999);
    const quantity = target.dataset.remove ? 0 : (line ? line.quantity : 1) + delta;
    if (!target.dataset.remove && delta > 0 && quantity > maxStock) {
      toast(`Rất xin lỗi quý khách! Hiện tại shop chỉ còn ${maxStock} cái trong kho.`);
      return;
    }
    try {
      cart = await api('/cart/items/' + variantId, quantity ? 'PUT' : 'DELETE', quantity ? { quantity } : undefined);
      count();
      cartPanel();
    } catch (err) {
      toast(err.message || 'Không thể cập nhật số lượng.');
    }
    return;
  }

  // Promo code trigger on checkout page
  if (target.id === 'promo-btn' || target.closest('#promo-btn')) {
    const code = (input('#promo-input')?.value || '').trim().toUpperCase();
    applyPromoCode(code);
    return;
  }
  if (target.id === 'promo-select-trigger' || target.closest('#promo-select-trigger')) {
    const code = appliedDiscountCode ? '' : 'GUNPLA10';
    applyPromoCode(code);
    return;
  }

  // Admin refresh
  if (target.id === 'admin-refresh-btn' || target.closest('#admin-refresh-btn')) {
    await loadAdmin();
    toast('Đã làm mới dữ liệu!');
    return;
  }

  if (target.dataset.grade) { setGrade(target.dataset.grade); return; }

  if (target.dataset.filterLink) {
    if (input('#search')) input('#search').value = '';
    const b = document.querySelector('#brand-select');
    if (b) b.value = 'all';
    setGrade(target.dataset.filterLink);
    if (location.hash !== '#catalog') {
      location.hash = '#catalog';
    }
    await route();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    target.blur();
    return;
  }
  if (target.dataset.brandFilter) {
    if (input('#search')) input('#search').value = '';
    setGrade('all');
    const b = document.querySelector('#brand-select');
    if (b) b.value = target.dataset.brandFilter;
    renderProducts();
    if (location.hash !== '#catalog') {
      location.hash = '#catalog';
    }
    await route();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    target.blur();
    return;
  }
  if (target.dataset.searchFilter) {
    setGrade('all');
    const b = document.querySelector('#brand-select');
    if (b) b.value = 'all';
    if (input('#search')) input('#search').value = target.dataset.searchFilter;
    renderProducts();
    if (location.hash !== '#catalog') {
      location.hash = '#catalog';
    }
    await route();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    target.blur();
    return;
  }
  if (target.classList.contains('nav-dropdown-trigger') || target.closest('.nav-dropdown-trigger')) {
    if (input('#search')) input('#search').value = '';
    const b = document.querySelector('#brand-select');
    if (b) b.value = 'all';
    setGrade('all');
    if (location.hash !== '#catalog') {
      location.hash = '#catalog';
    }
    await route();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Admin tab navigation
  if (target.dataset.tab) {
    tab = target.dataset.tab;
    adminSearchQuery = '';
    adminPage = 1;
    adminProductPage = 1;
    renderAdmin();
    return;
  }

  // Admin time range filter
  if (target.dataset.adminTimeRange) {
    adminTimeRange = target.dataset.adminTimeRange;
    await loadAdmin();
    toast('Đã cập nhật kỳ thống kê!');
    return;
  }

  // Admin pagination
  if (target.dataset.action === 'change-order-page') {
    const p = Number(target.dataset.page);
    if (!isNaN(p) && p >= 1) {
      adminPage = p;
      renderAdmin();
    }
    return;
  }
  if (target.dataset.action === 'change-product-page') {
    const p = Number(target.dataset.page);
    if (!isNaN(p) && p >= 1) {
      adminProductPage = p;
      renderAdmin();
    }
    return;
  }

  // Admin toggle category status
  if (target.dataset.toggleCat) {
    const res = await api('/categories/' + target.dataset.toggleCat + '/toggle-status', 'PATCH');
    await loadAdmin();
    toast(res.message || 'Đã cập nhật trạng thái danh mục.');
    return;
  }

  // Admin toggle product active status
  if (target.dataset.toggleProduct) {
    const res = await api('/products/' + target.dataset.toggleProduct + '/toggle-status', 'PATCH');
    await refreshProducts();
    await loadAdmin();
    toast(res.message || 'Đã cập nhật trạng thái kinh doanh sản phẩm.');
    return;
  }

  // Admin toggle user lock/unlock status
  if (target.dataset.toggleUser) {
    const res = await api('/users/' + target.dataset.toggleUser + '/toggle-status', 'PATCH');
    await loadAdmin();
    toast(res.message || 'Đã cập nhật trạng thái tài khoản.');
    return;
  }

  // Admin change user role modal
  if (target.dataset.changeRole) {
    userRoleModal(target.dataset.changeRole);
    return;
  }

  // Admin open return request modal
  if (target.dataset.openReturnModal) {
    adminReturnRequestModal(target.dataset.openReturnModal);
    return;
  }

  // Admin open refund modal
  if (target.dataset.openRefundModal) {
    adminRefundModal(target.dataset.openRefundModal);
    return;
  }

  // Admin resolve return request
  if (target.dataset.resolveReturn) {
    const orderId = target.dataset.resolveReturn;
    const reqCode = target.dataset.reqCode;
    const result = target.dataset.result;
    const res = await api('/admin/orders/' + orderId + '/return-request/' + reqCode + '/status', 'PATCH', {
      status: 'resolved',
      inspectionResult: result,
      note: result === 'restockable' ? 'Kiểm tra đạt chuẩn, tự động hoàn trả tồn kho' : 'Hàng lỗi/hỏng, hủy bỏ không nhập kho'
    });
    await refreshProducts();
    await loadAdmin();
    adminOrderDetail(orderId);
    toast(res.message || 'Đã xử lý hồ sơ đổi trả thành công!');
    return;
  }

  if (target.dataset.quickAdminLogin || target.closest('[data-quick-admin-login]')) {
    setUser(await api('/auth/login', 'POST', { email: 'cuckydangiu111@gmail.com', password: 'adminpassword' }));
    await loadAdmin();
    toast('Đã đăng nhập thành công với quyền Admin!');
    return;
  }

  if (target.id === 'admin-toggle-sidebar' || target.closest('#admin-toggle-sidebar')) {
    adminSidebarCollapsed = !adminSidebarCollapsed;
    const wrapper = $('.web-admin-wrapper');
    if (wrapper) wrapper.classList.toggle('sidebar-collapsed', adminSidebarCollapsed);
    return;
  }

  if (target.dataset.viewUser) {
    const u = adminUsers.find(x => (x._id || x.id) == target.dataset.viewUser);
    if (u) {
      openPanel('Chi tiết tài khoản ' + (u.name || ''), `
        <div style="line-height:1.8;font-size:13px;">
          <p><strong>Họ và tên:</strong> ${esc(u.name)}</p>
          <p><strong>Email:</strong> ${esc(u.email)}</p>
          <p><strong>Số điện thoại:</strong> ${esc(u.phone || '0907652267')}</p>
          <p><strong>Địa chỉ:</strong> ${esc(u.address || 'TP. Hồ Chí Minh')}</p>
          <p><strong>Vai trò:</strong> <span class="web-admin-role-badge ${u.role === 'admin' ? 'admin' : (u.role === 'staff' ? 'staff' : 'customer')}">${u.role === 'admin' ? 'Quản trị viên (Admin)' : (u.role === 'staff' ? 'Nhân viên (Staff)' : 'Khách hàng (Customer)')}</span></p>
          <p><strong>Trạng thái:</strong> <span class="admin-badge ${u.status === 'locked' ? 'user-locked' : 'user-active'}">${u.status === 'locked' ? 'Đã khóa' : 'Đang hoạt động'}</span></p>
          <p><strong>Đơn đã đặt:</strong> ${u.orderCount || 0} đơn · <strong>Tổng chi tiêu:</strong> ${money(u.totalSpent || 0)}</p>
          <p><strong>Ngày tạo:</strong> ${u.createdAt ? new Date(u.createdAt).toLocaleString('vi-VN') : 'Mặc định'}</p>
          <div style="display:flex;justify-content:flex-end;margin-top:14px;">
            <button class="button secondary" data-close="true">Đóng</button>
          </div>
        </div>
      `);
    }
    return;
  }

  if (target.dataset.newProduct) editProduct();
  if (target.dataset.edit) editProduct(target.dataset.edit);
  if (target.dataset.category) categoryForm(target.dataset.category);
  if (target.dataset.order) adminOrderDetail(target.dataset.order);

  if (target.dataset.archive) {
    openPanel('Xóa / Lưu trữ sản phẩm', '<p style="font-size:13.5px;color:#555;line-height:1.6;">Nếu sản phẩm đã từng phát sinh đơn hàng, hệ thống sẽ tự động chuyển sang trạng thái <strong>"Lưu trữ / Ngừng bán"</strong> để bảo toàn lịch sử giao dịch. Nếu là sản phẩm mới chưa có đơn, hệ thống sẽ xóa hoàn toàn khỏi cơ sở dữ liệu.</p><button class="button primary" data-confirm-archive="' + target.dataset.archive + '">Xác nhận thực hiện</button>');
  }
  if (target.dataset.confirmArchive) {
    const res = await api('/products/' + target.dataset.confirmArchive, 'DELETE');
    panel.close();
    await refreshProducts();
    await loadAdmin();
    toast(res.message || 'Đã xử lý sản phẩm.');
  }

  if (target.dataset.deleteCategory) {
    openPanel('Xóa danh mục', '<p style="font-size:13.5px;color:#555;line-height:1.6;">Lưu ý: Chỉ xóa được danh mục chưa có bất kỳ sản phẩm nào liên kết. Nếu còn sản phẩm, vui lòng chuyển các sản phẩm đó sang danh mục khác trước.</p><button class="button primary" data-confirm-category="' + target.dataset.deleteCategory + '">Xác nhận xóa danh mục</button>');
  }
  if (target.dataset.confirmCategory) {
    try {
      const res = await api('/categories/' + target.dataset.confirmCategory, 'DELETE');
      panel.close();
      await loadAdmin();
      toast(res.message || 'Đã xóa danh mục.');
    } catch (err) {
      showError(err);
    }
  }

  // Dedicated Auth & Tracking actions
  if (target.dataset.switchAuth) {
    currentAuthMode = target.dataset.switchAuth;
    location.hash = currentAuthMode === 'register' ? 'register' : 'login';
    renderAuthPage(currentAuthMode);
    return;
  }

  if (target.dataset.togglePw || target.closest('[data-toggle-pw]')) {
    const btn = target.dataset.togglePw ? target : target.closest('[data-toggle-pw]');
    const inputId = btn.dataset.togglePw;
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
      const isPw = inputEl.type === 'password';
      inputEl.type = isPw ? 'text' : 'password';
      btn.textContent = isPw ? '🔒' : '👁️';
    }
    return;
  }

  if (target.dataset.quickFill) {
    const role = target.dataset.quickFill;
    const emailEl = $('#login-email-input');
    const pwEl = $('#login-pw-input');
    if (role === 'admin') {
      if (emailEl) emailEl.value = 'cuckydangiu111@gmail.com';
      if (pwEl) pwEl.value = 'adminpassword';
    } else {
      if (emailEl) emailEl.value = 'customer@gmail.com';
      if (pwEl) pwEl.value = 'password123';
    }
    toast('Đã điền thông tin đăng nhập mẫu.');
    return;
  }

  if (target.dataset.accTab) {
    currentAccountTab = target.dataset.accTab;
    await renderAccountPage(currentAccountTab);
    return;
  }

  if (target.dataset.sampleTrack) {
    const q = target.dataset.sampleTrack;
    const inputEl = $('#tracking-input');
    if (inputEl) inputEl.value = q;
    await doTrackOrder(q);
    return;
  }

  if (target.dataset.trackCode) {
    const code = target.dataset.trackCode;
    currentAccountTab = 'tracking';
    location.hash = 'tracking';
    setTimeout(async () => {
      const inputEl = $('#tracking-input');
      if (inputEl) inputEl.value = code;
      await doTrackOrder(code);
    }, 50);
    return;
  }

  if (target.dataset.cancelOrder) {
    await doCancelOrder(target.dataset.cancelOrder);
    return;
  }

  const action = target.dataset.action;
  if (action === 'login') loginPanel();
  if (action === 'register') loginPanel(true);
  if (action === 'account') await account();
  if (action === 'checkout') checkout();
  if (action === 'shop') { if (panel && panel.open) panel.close(); location.hash = 'catalog'; }
  if (action === 'logout') {
    await api('/auth/logout', 'POST', {});
    setUser(null);
    cart = [];
    orders = [];
    adminProducts = [];
    adminReady = false;
    count();
    if (panel && panel.open) panel.close();
    if (location.hash === '#admin') renderAdmin();
    else if (location.hash === '#account' || location.hash === '#orders') location.hash = 'login';
    else location.hash = 'home';
    toast('Đã đăng xuất.');
  }

  if (target.dataset.close) panel.close();
  if (target.closest('#mobile-menu')) {
    $('#mobile-menu').hidden = true;
    $('#menu-button')?.setAttribute('aria-expanded', 'false');
  }
}

async function submit(form) {
  const body = Object.fromEntries(new FormData(form));

  if (form.id === 'dedicated-register-form') {
    if (body.password !== body.confirmPassword) {
      toast('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }
    const res = await api('/auth/register', 'POST', body);
    registerSuccessNotice = res.message || 'Đăng ký tài khoản thành công! Vui lòng đăng nhập với thông tin vừa tạo.';
    registeredEmailPrefill = body.email;
    currentAuthMode = 'login';
    location.hash = 'login';
    renderAuthPage('login', body.email, registerSuccessNotice);
    toast('Đăng ký tài khoản thành công! Hãy đăng nhập để tiếp tục.');
    return;
  }

  if (form.id === 'dedicated-login-form') {
    const u = await api('/auth/login', 'POST', body);
    setUser(u);
    await refreshCart();
    registerSuccessNotice = '';
    registeredEmailPrefill = '';
    toast('Đăng nhập thành công! Chào mừng ' + (u.name || 'bạn'));
    if (location.hash === '#checkout') {
      renderDedicatedCheckout();
    } else if (u.role === 'admin' && location.hash === '#admin') {
      await loadAdmin();
    } else if (u.role === 'admin') {
      location.hash = 'admin';
    } else {
      location.hash = 'account';
    }
    return;
  }

  if (form.id === 'tracking-search-form') {
    const q = (input('#tracking-input')?.value || '').trim();
    await doTrackOrder(q);
    return;
  }

  if (form.id === 'profile-form') {
    const updated = await api('/users/me', 'PUT', body);
    setUser(updated);
    toast('Cập nhật thông tin thành công!');
    await renderAccountPage('profile');
    return;
  }

  if (form.id === 'auth-form') {
    setUser(await api('/auth/' + (form.dataset.register === 'true' ? 'register' : 'login'), 'POST', body));
    await refreshCart();
    panel.close();
    if (location.hash === '#admin') await loadAdmin();
    if (location.hash === '#checkout') renderDedicatedCheckout();
    toast('Đăng nhập thành công.');
  }

  if (form.id === 'checkout-form') {
    let fullAddress = body.address || '';
    if (body.district && !fullAddress.includes(body.district)) fullAddress += `, ${body.district}`;
    if (body.city && !fullAddress.includes(body.city)) fullAddress += `, ${body.city}`;
    body.address = fullAddress;

    const o = await api('/orders', 'POST', body);
    await refreshCart();
    await refreshProducts();
    const prevDiscount = discountPercent;
    const prevCode = appliedDiscountCode;
    discountPercent = 0;
    appliedDiscountCode = '';

    if (body.paymentMethod === 'VNPAY') {
      toast('Đang chuyển hướng sang Cổng thanh toán VNPAY...');
      try {
        const orderId = o.id || o._id || (o.bill ? o.bill._id : '');
        const amount = (o.bill && o.bill.totalMoney) ? o.bill.totalMoney : 100000;
        const payRes = await api('/payment/create_payment_url', 'POST', {
          orderId: orderId,
          amount: amount,
          orderInfo: `Thanh toan don hang ${o.code || orderId}`
        });
        if (payRes && payRes.paymentUrl) {
          window.location.href = payRes.paymentUrl;
          return;
        }
      } catch (e) {
        console.error('Lỗi khởi tạo VNPAY:', e);
      }
    }

    renderCheckoutSuccess(o, body, prevDiscount, prevCode);
    toast('Đặt hàng thành công!');
    return;
  }

  if (form.id === 'product-form') {
    const id = form.dataset.id;
    await api('/products' + (id ? '/' + id : ''), id ? 'PUT' : 'POST', body);
    panel.close();
    await refreshProducts();
    await loadAdmin();
    toast(id ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm mới thành công.');
    return;
  }

  if (form.id === 'category-form') {
    const id = form.dataset.id;
    await api('/categories' + (id ? '/' + id : ''), id ? 'PUT' : 'POST', body);
    panel.close();
    await loadAdmin();
    toast(id ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục mới thành công.');
    return;
  }

  if (form.id === 'user-role-form') {
    const id = form.dataset.id;
    const res = await api('/users/' + id + '/role', 'PATCH', body);
    panel.close();
    await loadAdmin();
    toast(res.message || 'Đã cập nhật vai trò tài khoản thành công.');
    return;
  }

  if (form.id === 'admin-order-status-form') {
    const id = form.dataset.id;
    const res = await api('/admin/orders/' + id + '/status', 'PATCH', body);
    await refreshProducts();
    await loadAdmin();
    adminOrderDetail(id);
    toast(res.message || 'Đã cập nhật trạng thái đơn hàng thành công!');
    return;
  }

  if (form.id === 'admin-order-payment-form') {
    const id = form.dataset.id;
    const res = await api('/admin/orders/' + id + '/payment', 'PATCH', body);
    await loadAdmin();
    adminOrderDetail(id);
    toast(res.message || 'Đã lưu thông tin thanh toán & COD thành công!');
    return;
  }

  if (form.id === 'admin-order-return-form') {
    const id = form.dataset.id;
    const res = await api('/admin/orders/' + id + '/return-request', 'POST', body);
    await loadAdmin();
    adminOrderDetail(id);
    toast(res.message || 'Đã tạo hồ sơ đổi/trả hàng thành công!');
    return;
  }

  if (form.id === 'admin-order-refund-form') {
    const id = form.dataset.id;
    const res = await api('/admin/orders/' + id + '/refunds', 'POST', body);
    await loadAdmin();
    adminOrderDetail(id);
    toast(res.message || 'Đã hoàn tiền thành công!');
    return;
  }

  if (form.id === 'status-form') {
    await api('/admin/orders/' + form.dataset.id + '/status', 'PATCH', body);
    panel.close();
    await refreshProducts();
    await loadAdmin();
    toast('Đã cập nhật đơn hàng.');
    return;
  }
}

/* ==========================================================================
   INITIALIZATION & LISTENERS
   ========================================================================== */
$('#close-panel')?.addEventListener('click', () => panel.close());
panel?.addEventListener('close', () => { document.body.style.overflow = ''; });
panel?.addEventListener('click', e => { if (e.target === panel) panel.close(); });

$('#cart-button')?.addEventListener('click', () => run(async () => { await refreshCart(); cartPanel(); }));
$('#account-button')?.addEventListener('click', () => {
  if (user) {
    if (location.hash === '#account') {
      void route();
    } else {
      location.hash = '#account';
    }
  } else {
    if (location.hash === '#login') {
      void route();
    } else {
      location.hash = '#login';
    }
  }
});
$('#search-button')?.addEventListener('click', () => {
  const focusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const s = input('#search');
    if (s) { s.focus(); s.select(); }
  };
  if (location.hash === '#catalog') {
    void route().then(focusSearch);
  } else {
    location.hash = '#catalog';
    setTimeout(focusSearch, 80);
  }
});
$('#menu-button')?.addEventListener('click', () => {
  const menu = $('#mobile-menu');
  if (menu) {
    menu.hidden = !menu.hidden;
    $('#menu-button')?.setAttribute('aria-expanded', String(!menu.hidden));
  }
});

input('#search')?.addEventListener('input', () => { catalogPage = 1; renderProducts(); });
$('#sort')?.addEventListener('change', () => { catalogPage = 1; renderProducts(); });
document.querySelector('#brand-select')?.addEventListener('change', () => { catalogPage = 1; renderProducts(); });

// Admin search & filter listeners and Quantity Input listener
document.addEventListener('input', e => {
  if (e.target.id === 'pdetail-qty-input') {
    const inputEl = e.target;
    const prodId = location.hash.replace('#product-', '');
    const p = products.find(x => x.id == prodId || x._id == prodId);
    const maxStock = p ? ((p.stock !== undefined ? p.stock : p.quantity) ?? 15) : 15;
    const val = parseInt(inputEl.value, 10);
    if (!isNaN(val) && val > maxStock) {
      inputEl.value = maxStock;
      currentDetailQty = maxStock;
      toast(`Rất xin lỗi quý khách! Hiện tại shop chỉ còn ${maxStock} cái trong kho.`);
    } else if (!isNaN(val) && val >= 1) {
      currentDetailQty = val;
    }
  }
  if (e.target.id === 'admin-search-input') {
    adminSearchQuery = e.target.value;
    adminPage = 1;
    adminProductPage = 1;
    renderAdmin();
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'pdetail-qty-input') {
    const inputEl = e.target;
    const prodId = location.hash.replace('#product-', '');
    const p = products.find(x => x.id == prodId || x._id == prodId);
    const maxStock = p ? ((p.stock !== undefined ? p.stock : p.quantity) ?? 15) : 15;
    let val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val < 1) {
      inputEl.value = 1;
      currentDetailQty = 1;
    } else if (val > maxStock) {
      inputEl.value = maxStock;
      currentDetailQty = maxStock;
      toast(`Rất xin lỗi quý khách! Hiện tại shop chỉ còn ${maxStock} cái trong kho.`);
    } else {
      currentDetailQty = val;
    }
  }
  if (e.target.dataset.changeSize === 'order') {
    adminPageSize = Number(e.target.value) || 10;
    adminPage = 1;
    renderAdmin();
  }
  if (e.target.dataset.changeSize === 'product') {
    adminProductPageSize = Number(e.target.value) || 10;
    adminProductPage = 1;
    renderAdmin();
  }
  if (e.target.id === 'admin-grade-select') {
    adminFilterGrade = e.target.value;
    adminProductPage = 1;
    renderAdmin();
  }
  if (e.target.id === 'admin-stock-select') {
    adminFilterStock = e.target.value;
    adminProductPage = 1;
    renderAdmin();
  }
  if (e.target.id === 'admin-status-select') {
    adminFilterStatus = e.target.value;
    adminPage = 1;
    renderAdmin();
  }
  if (e.target.id === 'admin-pay-status-select') {
    adminFilterPayStatus = e.target.value;
    adminPage = 1;
    renderAdmin();
  }
  if (e.target.id === 'admin-role-select') {
    adminFilterRole = e.target.value;
    renderAdmin();
  }
  if (e.target.id === 'admin-bulk-select') {
    const val = e.target.value;
    if (val === 'select-all') {
      document.querySelectorAll('.admin-row-chk, #admin-select-all').forEach(c => c.checked = true);
      toast('Đã chọn tất cả các dòng trên trang này.');
    } else if (val === 'deselect-all') {
      document.querySelectorAll('.admin-row-chk, #admin-select-all').forEach(c => c.checked = false);
      toast('Đã bỏ chọn tất cả.');
    } else if (val === 'export-excel') {
      toast('Đã xuất báo cáo dữ liệu quản trị thành công!');
    }
    e.target.value = '';
  }
  if (e.target.id === 'admin-select-all') {
    document.querySelectorAll('.admin-row-chk').forEach(c => c.checked = e.target.checked);
  }
});

function videoUI() {
  if (!video || !$('#video-toggle')) return;
  $('#video-toggle').innerHTML = `${video.paused ? '▶' : 'Ⅱ'} <span>${video.paused ? 'Phát video' : 'Tạm dừng'}</span>`;
  $('#video-toggle').setAttribute('aria-label', video.paused ? 'Phát video' : 'Tạm dừng video');
}

if (video && $('#video-toggle')) {
  $('#video-toggle').addEventListener('click', () => {
    if (video.paused) video.play().catch(() => toast('Trình duyệt không phát được video.'));
    else video.pause();
  });
  video.addEventListener('play', videoUI);
  video.addEventListener('pause', videoUI);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.autoplay = false;
    video.pause();
  } else {
    video.play().catch(videoUI);
  }
}

window.addEventListener('hashchange', () => { route().catch(showError); });

document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    const targetHash = link.getAttribute('href');
    const mobMenu = $('#mobile-menu');
    if (mobMenu && !mobMenu.hidden) {
      mobMenu.hidden = true;
      $('#menu-button')?.setAttribute('aria-expanded', 'false');
    }

    const curHash = location.hash || '#home';
    const normTarget = targetHash || '#home';
    if (curHash === normTarget) {
      void route();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const target = e.target.closest('button, a, input, select');
  if (target) {
    if (target.id === 'promo-btn' || target.closest('#promo-btn') || target.id === 'promo-select-trigger' || target.closest('#promo-select-trigger') || target.id === 'admin-refresh-btn' || target.closest('#admin-refresh-btn') || target.id === 'pdetail-minus' || target.id === 'pdetail-plus' || target.classList.contains('nav-dropdown-trigger') || target.closest('.nav-dropdown-trigger') || Object.keys(target.dataset).length) {
      void run(() => handleClick(target));
    }
  }
});

document.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  void run(async () => {
    const button = form.querySelector('button[type="submit"], button:not([type])');
    if (button) button.disabled = true;
    try {
      await submit(form);
    } finally {
      if (button) button.disabled = false;
    }
  });
});

async function init() {
  try {
    await refreshProducts();
  } catch (e) {
    products = DEFAULT_PRODUCTS;
    renderProducts();
    renderHomeFeatured();
  }

  try {
    metadata = await api('/metadata');
  } catch (e) {
    metadata = { categories: [], brands: [], grades: [], series: [] };
  }

  try {
    setUser(await api('/auth/me'));
    await refreshCart();
  } catch (e) {
    try {
      await refreshCart();
    } catch (_) {}
  }

  try {
    await route();
  } catch (e) {
    console.error('Route error during init:', e);
  }

  renderHomeFeatured();
  videoUI();
}

void init();
