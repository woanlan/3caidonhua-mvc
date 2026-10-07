import {api,user,setUser,ApiError,type Product,type User} from './api.js';
interface CartLine{variantId:number;id:number;quantity:number;name:string;price:number;stock:number;status:string;variantStatus:string}
interface Order{id:number;code:string;recipient:string;phone:string;address:string;status:string;total:number;items:{name:string;quantity:number;price:number}[]}

const DEFAULT_PRODUCTS: Product[] = [
  { id: 101, name: 'SD Gundam RX-78-2 EX-Standard', slug: 'sd-rx78-2', description: 'Mô hình SD Gundam thiết kế dễ thương, dễ lắp ráp, phù hợp cho người mới bắt đầu.', categoryId: 1, brandId: 1, gradeId: 1, seriesId: 1, scale: 'Non-scale', status: 'active', grade: 'SD', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Universal Century', variantId: 101, sku: 'KIT-SD-RX78', price: 160000, stock: 25, reserved: 0 },
  { id: 102, name: 'SD Gundam Barbatos Lupus Rex', slug: 'sd-barbatos', description: 'Mô hình SD Gundam Barbatos Lupus Rex dạng chibi sắc nét kèm vũ khí mace siêu to.', categoryId: 1, brandId: 1, gradeId: 1, seriesId: 3, scale: 'Non-scale', status: 'active', grade: 'SD', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Post Disaster (IBO)', variantId: 102, sku: 'KIT-SD-BARBATOS', price: 190000, stock: 18, reserved: 0 },
  { id: 103, name: 'HG 1/144 Gundam Aerial', slug: 'hg-aerial', description: 'Bộ kit Gundam Aerial từ anime The Witch from Mercury với hiệu ứng Bit On Form ấn tượng.', categoryId: 1, brandId: 1, gradeId: 2, seriesId: 4, scale: '1/144', status: 'active', grade: 'HG', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Witch from Mercury', variantId: 103, sku: 'KIT-HG-AERIAL', price: 380000, stock: 30, reserved: 0 },
  { id: 104, name: 'HG 1/144 Moon Gundam', slug: 'hg-moon', description: 'Bộ kit HG chi tiết bậc nhất vũ trụ UC, khớp nối hiện đại và mảng psycho plate hoành tráng.', categoryId: 1, brandId: 1, gradeId: 2, seriesId: 1, scale: '1/144', status: 'active', grade: 'HG', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Universal Century', variantId: 104, sku: 'KIT-HG-MOON', price: 650000, stock: 12, reserved: 0 },
  { id: 105, name: 'RG 1/144 Hi-Nu Gundam', slug: 'rg-hi-nu', description: 'Tuyệt tác Real Grade với độ tinh xảo đỉnh cao, fin funnel linh hoạt và biên độ cử động hoàn hảo.', categoryId: 1, brandId: 1, gradeId: 3, seriesId: 1, scale: '1/144', status: 'active', grade: 'RG', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Universal Century', variantId: 105, sku: 'KIT-RG-HINU', price: 1180000, stock: 15, reserved: 0 },
  { id: 106, name: 'RG 1/144 Sazabi Special', slug: 'rg-sazabi', description: 'Mô hình RG Sazabi to lớn uy nghi với khung xương thép đúc và nhiều cơ chế bung giáp độc đáo.', categoryId: 1, brandId: 1, gradeId: 3, seriesId: 1, scale: '1/144', status: 'active', grade: 'RG', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Universal Century', variantId: 106, sku: 'KIT-RG-SAZABI', price: 1250000, stock: 10, reserved: 0 },
  { id: 107, name: 'MG 1/100 Freedom Gundam Ver 2.0', slug: 'mg-freedom-2', description: 'Mô hình Master Grade Freedom 2.0 với hệ cánh mở rộng lộng lẫy và chi tiết cơ khí sắc nét.', categoryId: 1, brandId: 1, gradeId: 6, seriesId: 2, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Cosmic Era (SEED)', variantId: 107, sku: 'KIT-MG-FREEDOM2', price: 1290000, stock: 14, reserved: 0 },
  { id: 108, name: 'MG 1/100 Gundam Barbatos', slug: 'mg-barbatos', description: 'Khung xương Gundam Frame hoàn chỉnh bằng kim loại giả lập, xi lanh thủy lực chuyển động thật.', categoryId: 1, brandId: 1, gradeId: 6, seriesId: 3, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Post Disaster (IBO)', variantId: 108, sku: 'KIT-MG-BARBATOS', price: 1350000, stock: 12, reserved: 0 },
  { id: 109, name: 'MGEX 1/100 Strike Freedom Gundam', slug: 'mgex-strike-freedom', description: 'Đỉnh cao Master Grade Extreme với khung xương mạ vàng 3 lớp kim loại cao cấp nhất lịch sử Gunpla.', categoryId: 1, brandId: 1, gradeId: 7, seriesId: 2, scale: '1/100', status: 'active', grade: 'MGEX', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Cosmic Era (SEED)', variantId: 109, sku: 'KIT-MGEX-SF', price: 3450000, stock: 6, reserved: 0 },
  { id: 110, name: 'MG 1/100 Sazabi Ver.Ka', slug: 'mg-sazabi-verka', description: 'Thiết kế đỉnh cao của Katoki Hajime với giáp mở đa tầng, khung sườn bạc và decal nước độc quyền.', categoryId: 1, brandId: 1, gradeId: 7, seriesId: 1, scale: '1/100', status: 'active', grade: 'MGEX', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Universal Century', variantId: 110, sku: 'KIT-MG-SAZABI-VK', price: 2300000, stock: 8, reserved: 0 },
  { id: 111, name: 'PG 1/60 Unleashed RX-78-2 Gundam', slug: 'pg-unleashed-rx78', description: 'Tuyệt phẩm kỷ niệm 40 năm Gunpla với cấu trúc 5 giai đoạn lắp ráp, đèn LED đa màu.', categoryId: 1, brandId: 1, gradeId: 8, seriesId: 1, scale: '1/60', status: 'active', grade: 'PG', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Universal Century', variantId: 111, sku: 'KIT-PG-UNLEASHED', price: 6200000, stock: 5, reserved: 0 },
  { id: 112, name: 'Mega Size 1/48 RX-78-2 Gundam', slug: 'mega-size-rx78', description: 'Kích thước khổng lồ cao tới 37.5cm, các mảnh ghép to bản dễ lắp và siêu ấn tượng khi trưng bày.', categoryId: 1, brandId: 1, gradeId: 9, seriesId: 1, scale: '1/48', status: 'active', grade: 'Mega Size', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Universal Century', variantId: 112, sku: 'KIT-MEGA-RX78', price: 2150000, stock: 7, reserved: 0 },
  { id: 113, name: 'IBO 1/100 Full Mechanics Barbatos Lupus', slug: 'ibo-barbatos', description: 'Tỷ lệ 1/100 Full Mechanics với khung xương đúc chuẩn xác, trang bị kiếm katana và vuốt tay dũng mãnh.', categoryId: 1, brandId: 1, gradeId: 4, seriesId: 3, scale: '1/100', status: 'active', grade: 'IBO', category: 'Mô hình Gundam', brand: 'Bandai', series: 'Post Disaster (IBO)', variantId: 113, sku: 'KIT-IBO-BARBATOS', price: 850000, stock: 16, reserved: 0 },
  { id: 114, name: 'Gundam Daban 8802 Strike Freedom', slug: 'daban-strike-freedom', description: 'Mô hình Gundam Daban 8802 chi tiết sắc bén phong cách Metal Build cho người chơi chuyên sâu.', categoryId: 1, brandId: 2, gradeId: 6, seriesId: 2, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Daban', series: 'Cosmic Era (SEED)', variantId: 114, sku: 'KIT-DABAN-8802', price: 720000, stock: 20, reserved: 0 },
  { id: 115, name: 'Gundam Jijia Wing Zero Custom', slug: 'jijia-wing-zero', description: 'Bộ kit ráp mẫu Wing Zero Custom từ hãng Jijia với hiệu ứng lông vũ bung cánh lộng lẫy.', categoryId: 1, brandId: 3, gradeId: 6, seriesId: 1, scale: '1/100', status: 'active', grade: 'MG', category: 'Mô hình Gundam', brand: 'Jijia', series: 'Universal Century', variantId: 115, sku: 'KIT-JIJIA-WING', price: 680000, stock: 15, reserved: 0 },
  { id: 116, name: 'Bút kẻ lằn chìm Gundam Marker GM01 Đen', slug: 'gundam-marker-gm01', description: 'Bút ngòi kim 0.05mm chuyên dụng kẻ lằn chi tiết rãnh giáp mô hình Gundam. Mực gốc dầu.', categoryId: 2, brandId: 1, gradeId: 10, seriesId: 6, scale: 'Non-scale', status: 'active', grade: 'TOOLS', category: 'Bút kẻ & Dụng cụ', brand: 'Bandai', series: 'Hobby Tools', variantId: 116, sku: 'TOOL-GM01', price: 65000, stock: 100, reserved: 0 },
  { id: 117, name: 'Bộ bút tô Gundam Metallic Marker GMS121', slug: 'metallic-marker-gms121', description: 'Set 6 cây bút tô ánh kim loại (Vàng, Bạc, Đồng, Xanh, Đỏ kim loại) tạo điểm nhấn cơ khí.', categoryId: 2, brandId: 1, gradeId: 10, seriesId: 6, scale: 'Non-scale', status: 'active', grade: 'TOOLS', category: 'Bút kẻ & Dụng cụ', brand: 'Bandai', series: 'Hobby Tools', variantId: 117, sku: 'TOOL-GMS121', price: 320000, stock: 45, reserved: 0 },
  { id: 118, name: 'Kìm cắt mô hình Bandai Entry Nipper', slug: 'bandai-nipper', description: 'Kìm cắt lưỡi thép chuyên dụng cắt runner mô hình chính hãng Bandai Spirits, vết cắt phẳng mịn.', categoryId: 2, brandId: 1, gradeId: 10, seriesId: 6, scale: 'Non-scale', status: 'active', grade: 'TOOLS', category: 'Bút kẻ & Dụng cụ', brand: 'Bandai', series: 'Hobby Tools', variantId: 118, sku: 'TOOL-NIPPER', price: 195000, stock: 50, reserved: 0 },
  { id: 119, name: 'Mô hình Tàu Thousand Sunny Grand Ship', slug: 'onepiece-thousand-sunny', description: 'Mô hình thuyền hải tặc Thousand Sunny của băng Mũ Rơm từ Bandai Spirits, kèm đế sóng biển.', categoryId: 3, brandId: 1, gradeId: 11, seriesId: 5, scale: 'Non-scale', status: 'active', grade: 'ONEPIECE', category: 'Mô hình One Piece', brand: 'Bandai', series: 'One Piece Grand Ship', variantId: 119, sku: 'OP-SUNNY', price: 480000, stock: 20, reserved: 0 },
  { id: 120, name: 'Mô hình Tàu Going Merry Memorial Color', slug: 'onepiece-going-merry', description: 'Mô hình thuyền Going Merry kỷ niệm màu đặc biệt, kèm đầy đủ cờ hải tặc và mỏ neo.', categoryId: 3, brandId: 1, gradeId: 11, seriesId: 5, scale: 'Non-scale', status: 'active', grade: 'ONEPIECE', category: 'Mô hình One Piece', brand: 'Bandai', series: 'One Piece Grand Ship', variantId: 120, sku: 'OP-MERRY', price: 490000, stock: 15, reserved: 0 }
];

let products:Product[]=[],cart:CartLine[]=[],orders:Order[]=[],adminProducts:Product[]=[];
let metadata:{categories:any[];brands:any[];grades:any[];series:any[]}={categories:[],brands:[],grades:[],series:[]};
let grade='all',tab='overview',pending=false,adminReady=false;
const $=(s:string)=>document.querySelector<HTMLElement>(s)!;
const input=(s:string)=>document.querySelector<HTMLInputElement>(s)!;
const panel=document.querySelector<HTMLDialogElement>('#panel')!;
const video=document.querySelector<HTMLVideoElement>('#hero-video')!;
const money=(n:number)=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(n);
const esc=(x:unknown)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const statuses:Record<string,string>={pending:'Chờ xác nhận',confirmed:'Đã xác nhận',shipping:'Đang giao',completed:'Hoàn tất',cancelled:'Đã hủy'};
const nextStatuses:Record<string,string[]>={pending:['confirmed','cancelled'],confirmed:['shipping','cancelled'],shipping:['completed'],completed:[],cancelled:[]};
let timer:ReturnType<typeof setTimeout>;
function toast(message:string){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function openPanel(title:string,body:string){$('#panel-title').textContent=title;$('#panel-body').innerHTML=body;if(!panel.open)panel.showModal();document.body.style.overflow='hidden';}
function showError(e:unknown){toast(e instanceof Error?e.message:'Có lỗi xảy ra.');if(e instanceof ApiError&&e.status===401){setUser(null);adminReady=false;cart=[];count();}}
async function run(fn:()=>Promise<void>){if(pending)return;pending=true;try{await fn();}catch(e){showError(e);}finally{pending=false;}}
function count(){$('.cart-count').textContent=String(cart.reduce((s,x)=>s+x.quantity,0));}
async function refreshCart(){cart=user?await api<CartLine[]>('/cart'):[];count();}
function setGrade(value:string){grade=value;document.querySelectorAll<HTMLButtonElement>('[data-grade]').forEach(b=>{b.classList.toggle('selected',b.dataset.grade===grade);b.setAttribute('aria-pressed',String(b.dataset.grade===grade));});renderProducts();}

function renderProducts(){
 const query=input('#search').value.toLowerCase().trim();
 const brandSelect=document.querySelector<HTMLSelectElement>('#brand-select')?.value||'all';
 let found=products.filter(p=>{
   const matchGrade = grade==='all' || p.grade===grade || (grade==='IBO' && (p.grade==='IBO'||p.grade==='RE/100'));
   const matchBrand = brandSelect==='all' || (p.brand && p.brand.toLowerCase().includes(brandSelect.toLowerCase()));
   const matchQuery = `${p.name} ${p.sku} ${p.brand||''} ${p.series||''} ${p.category||''}`.toLowerCase().includes(query);
   return matchGrade && matchBrand && matchQuery;
 });
 const sort=input('#sort').value;
 if(sort==='price-up')found.sort((a,b)=>a.price-b.price);
 if(sort==='price-down')found.sort((a,b)=>b.price-a.price);
 $('#result-count').textContent=found.length+' mô hình & sản phẩm';
 $('#products').innerHTML=found.map(p=>{
  const gradeClass=(p.grade||'kit').toLowerCase().replace(/[^a-z0-9]/g,'');
  const inStock=p.stock>0;
  return `<article class="product-card"><a href="#product-${p.id}" class="product-image"><img src="/assets/hero-poster.jpg" loading="lazy" width="640" height="360" alt="${esc(p.name)}"><span class="image-badge badge-${gradeClass}">${esc(p.grade||'KIT')} // ${esc(p.scale)}</span><span class="image-note">${esc(p.brand||'Bandai')}</span></a><div class="product-body"><div class="product-meta"><span class="stock-indicator ${inStock?'':'out'}"></span><span>${inStock?'Còn hàng':'Tạm hết'}</span><span>·</span><span>${esc(p.brand)}</span><span>·</span><span>${esc(p.series)}</span></div><h3><a href="#product-${p.id}">${esc(p.name)}</a></h3><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="Thêm ${esc(p.name)} vào giỏ" ${inStock?'':'disabled'}>${inStock?'Thêm giỏ +':'Hết hàng'}</button></div></div></article>`;
 }).join('')||'<div class="empty"><strong>Chưa tìm thấy mô hình</strong>Thử chọn dòng sản phẩm hoặc từ khóa khác.</div>';
}

function renderHomeFeatured(){
 const el=$('#home-featured-products');
 if(!el)return;
 const featured=products.slice(0,3);
 el.innerHTML=featured.map(p=>{
  const gradeClass=(p.grade||'kit').toLowerCase().replace(/[^a-z0-9]/g,'');
  const inStock=p.stock>0;
  return `<article class="product-card"><a href="#product-${p.id}" class="product-image"><img src="/assets/hero-poster.jpg" loading="lazy" width="640" height="360" alt="${esc(p.name)}"><span class="image-badge badge-${gradeClass}">${esc(p.grade||'KIT')} // ${esc(p.scale)}</span><span class="image-note">${esc(p.brand||'Bandai')}</span></a><div class="product-body"><div class="product-meta"><span class="stock-indicator ${inStock?'':'out'}"></span><span>${inStock?'Còn hàng':'Tạm hết'}</span><span>·</span><span>${esc(p.brand)}</span></div><h3><a href="#product-${p.id}">${esc(p.name)}</a></h3><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="Thêm ${esc(p.name)} vào giỏ" ${inStock?'':'disabled'}>${inStock?'Thêm giỏ +':'Hết hàng'}</button></div></div></article>`;
 }).join('');
}

async function refreshProducts(){
 try {
   const list = await api<Product[]>('/products');
   products = list && list.length ? list : DEFAULT_PRODUCTS;
 } catch (e) {
   products = DEFAULT_PRODUCTS;
 }
 renderProducts();
 renderHomeFeatured();
}

function productDetail(id:number){
 const p=products.find(x=>x.id===id);
 if(!p){toast('Sản phẩm không còn hiển thị.');return;}
 const gradeClass=(p.grade||'kit').toLowerCase().replace(/[^a-z0-9]/g,'');
 const inStock=p.stock>0;
 const innerFrame=p.grade==='MG'||p.grade==='MGEX'?'Full Inner Frame (Khung xương toàn phần)':(p.grade==='RG'||p.grade==='PG'?'Advanced MS Joint / Multi-Layer Frame':'Khớp nối tiêu chuẩn linh hoạt');
 const runnerEst=p.grade==='PG'?'25 – 40 vỉ runner':(p.grade==='MG'||p.grade==='MGEX'?'15 – 24 vỉ runner':(p.grade==='RG'?'10 – 14 vỉ runner':'5 – 8 vỉ runner'));
 const heightEst=p.scale==='1/60'?'~30 – 35 cm':(p.scale==='1/48'?'~37.5 cm':(p.scale==='1/100'?'~18 – 20 cm':(p.scale==='1/144'?'~13 – 15 cm':'Tiêu chuẩn')));
 openPanel('Chi tiết sản phẩm',`
  <img class="detail-image" src="/assets/hero-poster.jpg" alt="${esc(p.name)}">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
    <span class="image-badge badge-${gradeClass}" style="position:static">${esc(p.grade||'KIT')} // ${esc(p.scale)}</span>
    <span class="badge ${inStock?'badge-completed':'badge-cancelled'}">${inStock?`Còn hàng (${p.stock} bộ)`:'Tạm hết hàng'}</span>
  </div>
  <h2>${esc(p.name)}</h2>
  <p style="margin-top:16px;line-height:1.75">${esc(p.description)}</p>
  <div class="detail-facts">
    <div><small>Phân loại & Tỷ lệ</small>${esc(p.grade)} · ${esc(p.scale)}</div>
    <div><small>Mã sản phẩm (SKU)</small>${esc(p.sku)}</div>
    <div><small>Cơ cấu khung xương</small>${innerFrame}</div>
    <div><small>Số vỉ Runner dự kiến</small>${runnerEst}</div>
    <div><small>Chiều cao khi hoàn thiện</small>${heightEst}</div>
    <div><small>Thương hiệu & Vũ trụ</small>${esc(p.brand)} · ${esc(p.series)}</div>
  </div>
  <div class="total-row"><span>Giá niêm yết</span><strong>${money(p.price)}</strong></div>
  <button class="button primary wide" data-add="${p.id}" ${inStock?'':'disabled'}>${inStock?'Thêm vào giỏ hàng ↗':'Sản phẩm tạm hết hàng'}</button>
 `);
}

function loginPanel(register=false){openPanel(register?'Tạo tài khoản Studio':'Đăng nhập Studio',`<form id="auth-form" data-register="${register}" class="form-grid">${register?'<label>Họ tên<input name="name" autocomplete="name" required maxlength="100"></label>':''}<label>Email<input name="email" type="email" autocomplete="email" required maxlength="255"></label><label>Mật khẩu<input name="password" type="password" autocomplete="${register?'new-password':'current-password'}" minlength="10" maxlength="128" required></label><button class="button primary wide">${register?'Đăng ký tài khoản':'Đăng nhập ngay'}</button><button type="button" class="text-button" data-action="${register?'login':'register'}">${register?'Đã có tài khoản? Đăng nhập':'Chưa có tài khoản? Đăng ký'}</button></form>`);}
async function addToCart(id:number){if(!user){loginPanel();return;}const p=products.find(x=>x.id===id);if(!p){toast('Sản phẩm không còn bán.');return;}const quantity=(cart.find(x=>x.variantId===p.variantId)?.quantity||0)+1;cart=await api<CartLine[]>('/cart/items/'+p.variantId,'PUT',{quantity});count();toast('Đã thêm '+p.name+' vào giỏ hàng.');}
function cartPanel(){
 if(!user){loginPanel();return;}
 if(!cart.length){openPanel('Giỏ hàng Studio','<div class="empty"><strong>Giỏ hàng đang trống</strong>Mảnh ghép Gunpla tiếp theo đang chờ bạn hoàn thiện.</div><button class="button primary wide" data-action="shop">Khám phá mô hình →</button>');return;}
 const total=cart.reduce((s,p)=>s+p.price*p.quantity,0);
 openPanel('Giỏ hàng của bạn',`
  <div class="cart-shipping-bar"><span style="color:var(--emerald);font-weight:700">✓</span><span>Đơn hàng đồ án MVC · <strong>Miễn phí vận chuyển</strong> toàn quốc</span></div>
  <div class="cart-list">${cart.map(p=>`<div class="cart-line"><div><h3>${esc(p.name)}</h3><span class="muted">${money(p.price)} ${p.status!=='active'||p.variantStatus!=='active'?'· <span style="color:var(--red)">Đã ngừng bán</span>':''}</span><div class="quantity"><button data-qty="${p.variantId}" data-delta="-1" aria-label="Giảm số lượng">−</button><span>${p.quantity}</span><button data-qty="${p.variantId}" data-delta="1" aria-label="Tăng số lượng">+</button></div></div><div style="text-align:right"><strong>${money(p.quantity*p.price)}</strong><br><button class="text-button" data-remove="${p.variantId}">Xóa</button></div></div>`).join('')}</div>
  <div class="total-row"><span>Tổng thanh toán</span><strong>${money(total)}</strong></div>
  <p class="muted" style="font-size:12px;margin-bottom:20px">Tồn kho và đơn giá được xác thực an toàn tại máy chủ.</p>
  <button class="button primary wide" data-action="checkout">Tiến hành đặt hàng →</button>
 `);
}
function checkout(){if(!user||!cart.length){cartPanel();return;}openPanel('Thông tin đặt hàng',`<div class="notice">Website đồ án MVC. Đơn sẽ lưu vào database MySQL; chưa kết nối thanh toán thật. Vui lòng dùng thông tin thử nghiệm.</div><form id="checkout-form" class="form-grid"><label>Người nhận<input name="recipient" required maxlength="100" value="${esc(user.name)}"></label><label>Điện thoại<input name="phone" required pattern="[0-9+ ()-]{9,20}" maxlength="20"></label><label>Địa chỉ<textarea name="address" rows="3" required maxlength="500"></textarea></label><p class="muted">Thanh toán COD · Phí vận chuyển đồ án: 0 ₫</p><button class="button primary wide">Xác nhận đặt hàng</button></form>`);}
async function account(){
 if(!user){loginPanel();return;}
 const list=await api<Order[]>('/orders');
 openPanel('Tài khoản & Đơn hàng',`
  <div style="padding-bottom:18px;border-bottom:1px solid var(--line);margin-bottom:20px">
    <h3 style="margin-bottom:4px">${esc(user.name)}</h3>
    <p style="margin-bottom:16px">${esc(user.email)}</p>
    <div style="display:flex;gap:10px">
      <button class="button" data-action="logout" style="padding:8px 16px;min-height:38px;font-size:12px">Đăng xuất</button>
      ${user.role==='admin'?'<a class="button primary" href="#admin" data-close="true" style="padding:8px 16px;min-height:38px;font-size:12px">Quản trị Studio ↗</a>':''}
    </div>
  </div>
  <h3 style="margin-bottom:14px">Lịch sử đơn hàng</h3>
  ${list.map(o=>`
    <div class="cart-line">
      <div>
        <strong>${esc(o.code)}</strong>
        <div class="muted" style="margin-top:4px">${o.items.map(i=>esc(i.name)+' × '+i.quantity).join('<br>')}</div>
      </div>
      <div style="text-align:right">
        <strong>${money(o.total)}</strong><br>
        <span class="badge badge-${o.status}" style="margin-top:6px">${statuses[o.status]||o.status}</span>
      </div>
    </div>
  `).join('')||'<p class="muted">Bạn chưa có đơn hàng nào.</p>'}
 `);
}
async function loadAdmin(){if(!user||user.role!=='admin'){adminReady=false;renderAdmin();return;}[adminProducts,orders,metadata]=await Promise.all([api('/admin/products'),api('/admin/orders'),api('/metadata')]);adminReady=true;renderAdmin();}
function renderAdmin(){if(!user||user.role!=='admin'){$('#admin').innerHTML=`<section class="section"><h2>Khu vực quản trị</h2><p style="margin-top:20px">${user?'Tài khoản hiện tại không có quyền quản trị.':'Đăng nhập tài khoản admin để tiếp tục.'}</p><button class="button primary" data-action="${user?'account':'login'}">${user?'Tài khoản của tôi':'Đăng nhập'}</button></section>`;return;}
 if(!adminReady){$('#admin').innerHTML='<section class="section">Đang tải dữ liệu quản trị…</section>';return;}
 const tabs=[['overview','Tổng quan'],['products','Sản phẩm'],['categories','Danh mục'],['orders','Đơn hàng']];
 const orderTable=orders.length?`<div class="table-wrap"><table><thead><tr><th>Mã đơn</th><th>Người nhận</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>${orders.map(o=>`<tr><td><strong>${esc(o.code)}</strong></td><td>${esc(o.recipient)}</td><td><strong>${money(o.total)}</strong></td><td><span class="badge badge-${o.status}">${statuses[o.status]||o.status}</span></td><td><button data-order="${o.id}">Xem đơn</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Chưa có đơn hàng.</div>';
 let body='';if(tab==='overview')body=`<div class="stats"><div class="stat"><small>Doanh thu hợp lệ (200 đơn gần nhất)</small><strong>${money(orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0))}</strong></div><div class="stat"><small>Tổng đơn hàng ghi nhận</small><strong>${orders.length}</strong></div><div class="stat"><small>Kit Gunpla đang bán</small><strong>${adminProducts.filter(p=>p.status==='active').length}</strong></div></div><h3>Đơn hàng mới nhất</h3>${orderTable}`;
 if(tab==='products')body=`<button class="button primary" data-new-product="true">Thêm sản phẩm +</button><div class="table-wrap"><table><thead><tr><th>SKU</th><th>Sản phẩm</th><th>Giá</th><th>Tồn</th><th>Trạng thái</th><th></th></tr></thead><tbody>${adminProducts.map(p=>`<tr><td>${esc(p.sku)}</td><td>${esc(p.name)}</td><td>${money(p.price)}</td><td>${p.stock}</td><td>${p.status==='active'?'Đang bán':'Ngừng bán'}</td><td><button data-edit="${p.id}">Sửa</button> ${p.status==='active'?`<button data-archive="${p.id}">Ngừng bán</button>`:''}</td></tr>`).join('')}</tbody></table></div>`;
 if(tab==='categories')body=`<button class="button primary" data-category="new">Thêm danh mục +</button><div class="table-wrap"><table><thead><tr><th>Tên danh mục</th><th>Slug</th><th></th></tr></thead><tbody>${metadata.categories.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.slug)}</td><td><button data-category="${c.id}">Sửa</button> <button data-delete-category="${c.id}">Xóa</button></td></tr>`).join('')}</tbody></table></div>`;
 if(tab==='orders')body=orderTable;
 $('#admin').innerHTML=`<div class="admin-shell"><aside class="admin-sidebar"><p>3CAIDONHUA // STUDIO ADMIN</p>${tabs.map(([key,label])=>`<button class="${tab===key?'selected':''}" data-tab="${key}">${label}</button>`).join('')}<button data-action="logout">Đăng xuất</button></aside><section class="admin-content"><div class="admin-heading"><div><div class="eyebrow red">QUẢN TRỊ CỬA HÀNG</div><h1>${tabs.find(t=>t[0]===tab)![1]}</h1></div><a href="#catalog" class="button">Về cửa hàng ↗</a></div><p class="admin-alert">Xin chào ${esc(user.name)} · Dữ liệu được lưu trữ an toàn trong MySQL.</p>${body}</section></div>`;
}
function options(list:any[],selected:any,optional=false){return (optional?'<option value="">Không áp dụng</option>':'')+list.map(x=>`<option value="${x.id}" ${x.id===selected?'selected':''}>${esc(x.name)}</option>`).join('');}
function editProduct(id?:number){const p=adminProducts.find(x=>x.id===id);openPanel(p?'Sửa sản phẩm & SKU mặc định':'Thêm sản phẩm',`<form id="product-form" data-id="${id||''}" class="form-grid"><label>Tên sản phẩm<input name="name" value="${esc(p?.name)}" required maxlength="255"></label><label>Slug<input name="slug" value="${esc(p?.slug)}" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="rx-78-2-hg" maxlength="150"></label><label>Danh mục<select name="categoryId" required>${options(metadata.categories,p?.categoryId)}</select></label><label>Thương hiệu<select name="brandId" required>${options(metadata.brands,p?.brandId)}</select></label><label>Grade<select name="gradeId">${options(metadata.grades,p?.gradeId,true)}</select></label><label>Series<select name="seriesId">${options(metadata.series,p?.seriesId,true)}</select></label><label>Tỷ lệ<input name="scale" value="${esc(p?.scale)}" maxlength="30"></label><label>SKU<input name="sku" value="${esc(p?.sku)}" required maxlength="100"></label><label>Giá VND<input name="price" type="number" value="${p?.price??0}" min="0" max="1000000000" step="1" required></label><label>Tồn kho<input name="stock" type="number" value="${p?.stock??0}" min="0" max="100000" step="1" required></label><label>Mô tả<textarea name="description" maxlength="10000">${esc(p?.description)}</textarea></label><button class="button primary">Lưu sản phẩm</button></form>`);}
function categoryForm(value:string){const c=metadata.categories.find(x=>x.id===Number(value));openPanel(c?'Sửa danh mục':'Thêm danh mục',`<form id="category-form" data-id="${c?.id||''}" class="form-grid"><label>Tên<input name="name" value="${esc(c?.name)}" maxlength="100" required></label><label>Slug<input name="slug" value="${esc(c?.slug)}" maxlength="150" pattern="[a-z0-9]+(-[a-z0-9]+)*" required></label><label>Mô tả<textarea name="description" maxlength="2000">${esc(c?.description)}</textarea></label><button class="button primary">Lưu danh mục</button></form>`);}
function orderDetail(id:number){const o=orders.find(x=>x.id===id)!;const choices=nextStatuses[o.status];openPanel(o.code,`<p>${esc(o.recipient)} · ${esc(o.phone)}<br>${esc(o.address)}</p>${o.items.map(x=>`<div class="total-row"><span>${esc(x.name)} × ${x.quantity}</span><strong>${money(x.price*x.quantity)}</strong></div>`).join('')}<div class="total-row"><span>Tổng tiền</span><strong>${money(o.total)}</strong></div><p style="margin:16px 0">Trạng thái hiện tại: <span class="badge badge-${o.status}">${statuses[o.status]}</span></p>${choices.length?`<form id="status-form" data-id="${o.id}" class="form-grid"><label>Chuyển sang<select name="status">${choices.map(s=>`<option value="${s}">${statuses[s]}</option>`).join('')}</select></label><p class="muted">Hủy đơn sẽ hoàn tồn kho một lần. Hoàn tất không tự xác nhận tiền COD.</p><button class="button primary">Cập nhật trạng thái</button></form>`:'<p class="muted">Đơn đã kết thúc, không thể đổi trạng thái.</p>'}`);}
async function route(){
 const hash=location.hash,isAdmin=hash==='#admin';
 $('#storefront').hidden=isAdmin;
 $('#admin').hidden=!isAdmin;
 document.body.classList.toggle('admin-mode',isAdmin);
 if(isAdmin){
  video.pause();
  renderAdmin();
  await loadAdmin();
  window.scrollTo(0,0);
  return;
 }
 
 if(hash.startsWith('#product-'))productDetail(Number(hash.slice(9)));
 else if(hash==='#cart'){await refreshCart();cartPanel();}
 
 let activePage='home';
 if(hash.startsWith('#catalog')||hash.startsWith('#product-'))activePage='catalog';
 else if(hash==='#grades')activePage='grades';
 else if(hash==='#about')activePage='about';
 else if(hash==='#home'||!hash||hash==='#cart')activePage='home';

 const pageHome=$('#page-home'),pageCatalog=$('#page-catalog'),pageGrades=$('#page-grades'),pageAbout=$('#page-about');
 if(pageHome)pageHome.hidden=activePage!=='home';
 if(pageCatalog)pageCatalog.hidden=activePage!=='catalog';
 if(pageGrades)pageGrades.hidden=activePage!=='grades';
 if(pageAbout)pageAbout.hidden=activePage!=='about';

 if(activePage==='home'){
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&video.paused){video.play().catch(()=>{});}
 }else{
  video.pause();
 }

 document.querySelectorAll('.desktop-nav a, .mobile-menu a').forEach(a=>{
  const href=a.getAttribute('href');
  if(href==='#'+activePage||(activePage==='home'&&href==='#home')){
   a.classList.add('active');
  }else if(href&&href.startsWith('#')&&!a.classList.contains('nav-dropdown-trigger')){
   a.classList.remove('active');
  }
 });

 if(!hash.startsWith('#product-')&&hash!=='#cart'){
  window.scrollTo(0,0);
 }
}

async function handleClick(target:HTMLElement){
 if(target.dataset.add){await addToCart(Number(target.dataset.add));return;}
 if(target.dataset.qty||target.dataset.remove){const variantId=Number(target.dataset.qty||target.dataset.remove),line=cart.find(x=>x.variantId===variantId)!;const quantity=target.dataset.remove?0:line.quantity+Number(target.dataset.delta);cart=await api('/cart/items/'+variantId,quantity?'PUT':'DELETE',quantity?{quantity}:undefined);count();cartPanel();return;}
 if(target.dataset.grade){setGrade(target.dataset.grade);return;}
 if(target.dataset.filterLink){
   input('#search').value='';
   setGrade(target.dataset.filterLink);
   const b=document.querySelector<HTMLSelectElement>('#brand-select');
   if(b)b.value='all';
   location.hash='catalog';
   return;
 }
 if(target.dataset.brandFilter){
   input('#search').value='';
   setGrade('all');
   const b=document.querySelector<HTMLSelectElement>('#brand-select');
   if(b)b.value=target.dataset.brandFilter;
   renderProducts();
   location.hash='catalog';
   return;
 }
 if(target.dataset.searchFilter){
   setGrade('all');
   const b=document.querySelector<HTMLSelectElement>('#brand-select');
   if(b)b.value='all';
   input('#search').value=target.dataset.searchFilter;
   renderProducts();
   location.hash='catalog';
   return;
 }
 if(target.dataset.tab){tab=target.dataset.tab;renderAdmin();}
 if(target.dataset.newProduct)editProduct();if(target.dataset.edit)editProduct(Number(target.dataset.edit));if(target.dataset.category)categoryForm(target.dataset.category);if(target.dataset.order)orderDetail(Number(target.dataset.order));
 if(target.dataset.archive){openPanel('Ngừng kinh doanh sản phẩm','<p>Sản phẩm sẽ ẩn khỏi cửa hàng. Các đơn cũ vẫn giữ nguyên.</p><button class="button primary" data-confirm-archive="'+target.dataset.archive+'">Xác nhận ngừng bán</button>');}
 if(target.dataset.confirmArchive){await api('/products/'+target.dataset.confirmArchive,'DELETE');panel.close();await refreshProducts();await loadAdmin();toast('Đã ngừng kinh doanh sản phẩm.');}
 if(target.dataset.deleteCategory){openPanel('Xóa danh mục','<p>Chỉ xóa được danh mục chưa có sản phẩm sử dụng.</p><button class="button primary" data-confirm-category="'+target.dataset.deleteCategory+'">Xác nhận xóa</button>');}
 if(target.dataset.confirmCategory){await api('/categories/'+target.dataset.confirmCategory,'DELETE');panel.close();await loadAdmin();toast('Đã xóa danh mục.');}
 const action=target.dataset.action;if(action==='login')loginPanel();if(action==='register')loginPanel(true);if(action==='account')await account();if(action==='checkout')checkout();if(action==='shop'){panel.close();location.hash='catalog';}
 if(action==='logout'){await api('/auth/logout','POST',{});setUser(null);cart=[];orders=[];adminProducts=[];adminReady=false;count();panel.close();renderAdmin();toast('Đã đăng xuất.');}
 if(target.dataset.close)panel.close();if(target.closest('#mobile-menu')){$('#mobile-menu').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');}
 if(target.getAttribute('href')===location.hash&&location.hash.startsWith('#product-'))productDetail(Number(location.hash.slice(9)));
}

async function submit(form:HTMLFormElement){const body=Object.fromEntries(new FormData(form));
 if(form.id==='auth-form'){setUser(await api<User>('/auth/'+(form.dataset.register==='true'?'register':'login'),'POST',body));await refreshCart();panel.close();if(location.hash==='#admin')await loadAdmin();toast('Đăng nhập thành công.');}
 if(form.id==='checkout-form'){const o=await api('/orders','POST',body);await refreshCart();await refreshProducts();openPanel('Đặt hàng thành công',`<div class="success"><span>✓</span><h2>${esc(o.code)}</h2><p>Đơn đã được lưu. Xem lại trong tài khoản của bạn.</p><button class="button primary" data-action="account">Xem đơn hàng</button></div>`);}
 if(form.id==='product-form'){const id=form.dataset.id;await api('/products'+(id?'/'+id:''),id?'PUT':'POST',body);panel.close();await refreshProducts();await loadAdmin();toast('Đã lưu sản phẩm.');}
 if(form.id==='category-form'){const id=form.dataset.id;await api('/categories'+(id?'/'+id:''),id?'PUT':'POST',body);panel.close();await loadAdmin();toast('Đã lưu danh mục.');}
 if(form.id==='status-form'){await api('/admin/orders/'+form.dataset.id+'/status','PATCH',body);panel.close();await refreshProducts();await loadAdmin();toast('Đã cập nhật đơn hàng.');}
}

$('#close-panel').addEventListener('click',()=>panel.close());
panel.addEventListener('close',()=>{document.body.style.overflow='';});
panel.addEventListener('click',e=>{if(e.target===panel)panel.close();});
$('#cart-button').addEventListener('click',()=>run(async()=>{await refreshCart();cartPanel();}));$('#account-button').addEventListener('click',()=>run(account));
$('#search-button').addEventListener('click',()=>{location.hash='catalog';setTimeout(()=>input('#search').focus(),50);});$('#menu-button').addEventListener('click',()=>{$('#mobile-menu').hidden=!$('#mobile-menu').hidden;$('#menu-button').setAttribute('aria-expanded',String(!$('#mobile-menu').hidden));});
input('#search').addEventListener('input',renderProducts);$('#sort').addEventListener('change',renderProducts);
document.querySelector<HTMLSelectElement>('#brand-select')?.addEventListener('change', renderProducts);

function videoUI(){$('#video-toggle').innerHTML=`${video.paused?'▶':'Ⅱ'} <span>${video.paused?'Phát video':'Tạm dừng'}</span>`;$('#video-toggle').setAttribute('aria-label',video.paused?'Phát video':'Tạm dừng video');}
$('#video-toggle').addEventListener('click',()=>{if(video.paused)video.play().catch(()=>toast('Trình duyệt không phát được video.'));else video.pause();});video.addEventListener('play',videoUI);video.addEventListener('pause',videoUI);if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.autoplay=false;video.pause();}else video.play().catch(videoUI);
window.addEventListener('hashchange',()=>{route().catch(showError);});
document.addEventListener('click',e=>{const target=(e.target as HTMLElement).closest<HTMLElement>('button,a');if(target&&Object.keys(target.dataset).length)void run(()=>handleClick(target));});
document.addEventListener('submit',e=>{e.preventDefault();const form=e.target as HTMLFormElement;void run(async()=>{const button=form.querySelector<HTMLButtonElement>('button[type="submit"],button:not([type])');if(button)button.disabled=true;try{await submit(form);}finally{if(button)button.disabled=false;}});});

async function init(){try{await refreshProducts();metadata=await api('/metadata');try{setUser(await api<User>('/auth/me'));await refreshCart();}catch(e){if(!(e instanceof ApiError)||e.status!==401)throw e;}await route();}catch(e){products=DEFAULT_PRODUCTS;renderProducts();showError(e);}videoUI();}
void init();
