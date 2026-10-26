// ====================================================================================
// [FRONTEND] products.js - Hiển thị Danh sách sản phẩm, Tìm kiếm & Bộ lọc Grade
// ====================================================================================

import { api, money, esc } from './api.js';
import { addToCart } from './cart.js';

let allProducts = [];

export async function loadProducts() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">Đang tải danh sách mô hình Gundam...</div>';

  try {
    allProducts = await api('/products');
    applyFilters();
  } catch (err) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#ef4444;padding:40px;">Không thể tải sản phẩm: ${err.message}</div>`;
  }
}

export function applyFilters() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const searchInput = document.getElementById('filter-search');
  const gradeSelect = document.getElementById('filter-grade');
  const sortSelect = document.getElementById('filter-sort');

  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedGrade = gradeSelect ? gradeSelect.value : 'ALL';
  const sortOrder = sortSelect ? sortSelect.value : 'default';

  let filtered = allProducts.filter(p => {
    // Ẩn sản phẩm đã lưu trữ / ngừng kinh doanh
    if (p.status === 'archived' || p.status === 'inactive') return false;

    // Lọc theo từ khóa
    const matchSearch = !keyword || (p.name && p.name.toLowerCase().includes(keyword)) || (p.sku && p.sku.toLowerCase().includes(keyword));

    // Lọc theo Grade
    const pGrade = (p.grade || '').toUpperCase();
    const matchGrade = (selectedGrade === 'ALL') || (selectedGrade === pGrade) ||
      (selectedGrade === 'OTHER' && !['SD', 'HG', 'RG', 'MG', 'PG', 'TOOLS', 'ONEPIECE'].includes(pGrade));

    return matchSearch && matchGrade;
  });

  // Sắp xếp
  if (sortOrder === 'price_asc') {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortOrder === 'price_desc') {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortOrder === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const countBadge = document.getElementById('product-count');
  if (countBadge) countBadge.textContent = `${filtered.length} mô hình`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:50px 20px;background:#1e293b;border-radius:12px;border:1px solid #334155;">
        <div style="font-size:40px;margin-bottom:12px;">🔍</div>
        <h3 style="color:#fff;margin-bottom:6px;">Không tìm thấy sản phẩm phù hợp</h3>
        <p style="color:#94a3b8;font-size:14px;">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác xem sao.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isOutOfStock = (p.quantity !== undefined && p.quantity <= 0);
    const gradeBadge = p.grade ? `<span style="background:#0284c7;color:#fff;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;letter-spacing:0.5px;">${esc(p.grade)}</span>` : '';

    return `
      <div class="product-card" style="background:#1e293b;border:1px solid #334155;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;transition:transform 0.2s, border-color 0.2s;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
        <div style="position:relative;background:#0b1120;aspect-ratio:1/1;overflow:hidden;">
          <a href="detail.html?id=${p.id || p._id}">
            <img src="${esc(p.image || 'assets/hero-poster.jpg')}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          </a>
          <div style="position:absolute;top:10px;left:10px;display:flex;gap:6px;">
            ${gradeBadge}
            ${isOutOfStock ? '<span style="background:#ef4444;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">HẾT HÀNG</span>' : ''}
          </div>
        </div>

        <div style="padding:16px;display:flex;flex-direction:column;flex:1;">
          <div style="font-size:11.5px;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">${esc(p.sku || 'GUNPLA')}</div>
          <h3 style="font-size:15px;font-weight:700;color:#fff;margin-bottom:10px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
            <a href="detail.html?id=${p.id || p._id}" style="color:inherit;text-decoration:none;">${esc(p.name)}</a>
          </h3>
          <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="color:#e60012;font-size:17px;font-weight:800;">${money(p.price)}</div>
              <div style="font-size:12px;color:#64748b;">Kho: ${p.quantity !== undefined ? p.quantity : 15} cái</div>
            </div>
            <button class="btn-add-cart" data-id="${p.id || p._id}" ${isOutOfStock ? 'disabled' : ''} style="background:${isOutOfStock ? '#475569' : '#e60012'};color:#fff;border:none;padding:8px 14px;border-radius:6px;font-weight:700;font-size:13px;cursor:${isOutOfStock ? 'not-allowed' : 'pointer'};transition:0.2s;">
              ${isOutOfStock ? 'Hết hàng' : '+ Giỏ hàng'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Gắn sự kiện thêm giỏ hàng
  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.onclick = async () => {
      const pid = btn.dataset.id;
      btn.textContent = 'Đang thêm...';
      btn.disabled = true;
      try {
        await addToCart(pid, 1);
      } finally {
        btn.textContent = '+ Giỏ hàng';
        btn.disabled = false;
      }
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('products-grid')) {
    loadProducts();

    const searchInput = document.getElementById('filter-search');
    const gradeSelect = document.getElementById('filter-grade');
    const sortSelect = document.getElementById('filter-sort');

    if (searchInput) searchInput.oninput = applyFilters;
    if (gradeSelect) gradeSelect.onchange = applyFilters;
    if (sortSelect) sortSelect.onchange = applyFilters;

    // Đọc URL param nếu có ?grade=...
    const urlParams = new URLSearchParams(window.location.search);
    const gradeParam = urlParams.get('grade');
    if (gradeParam && gradeSelect) {
      gradeSelect.value = gradeParam.toUpperCase();
    }
  }
});
