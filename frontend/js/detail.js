// ====================================================================================
// [FRONTEND] detail.js - Hiển thị Chi tiết Sản phẩm Mô hình Gunpla theo ID
// ====================================================================================

import { api, money, esc, toast } from './api.js';
import { addToCart } from './cart.js';

export async function loadProductDetail() {
  const container = document.getElementById('detail-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = `
      <div style="text-align:center;padding:50px 20px;background:#1e293b;border-radius:16px;">
        <h2 style="color:#ef4444;margin-bottom:12px;">Thiếu mã sản phẩm</h2>
        <p style="color:#94a3b8;margin-bottom:20px;">Vui lòng quay lại danh sách sản phẩm để chọn mô hình cần xem.</p>
        <a href="products.html" style="padding:10px 20px;background:#e60012;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;">Quay lại danh mục</a>
      </div>
    `;
    return;
  }

  container.innerHTML = '<div style="text-align:center;padding:60px;color:#94a3b8;">Đang tải thông tin mô hình...</div>';

  try {
    const p = await api(`/products/${productId}`);
    document.title = `${p.name} - 3caidonhua Gunpla Studio`;

    const isOutOfStock = (p.quantity !== undefined && p.quantity <= 0);
    const maxStock = p.quantity !== undefined ? p.quantity : 15;

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;">
        <!-- Ảnh mô hình -->
        <div style="background:#0b1120;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <img src="${esc(p.image || 'assets/hero-poster.jpg')}" alt="${esc(p.name)}" style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block;">
        </div>

        <!-- Thông tin chi tiết -->
        <div>
          <div style="display:flex;gap:8px;margin-bottom:10px;">
            ${p.grade ? `<span style="background:#0284c7;color:#fff;font-size:12px;font-weight:800;padding:3px 10px;border-radius:4px;">${esc(p.grade)}</span>` : ''}
            <span style="background:#334155;color:#94a3b8;font-size:12px;font-weight:700;padding:3px 10px;border-radius:4px;">${esc(p.category || 'Mô hình Gundam')}</span>
          </div>

          <div style="font-size:13px;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Mã SKU: ${esc(p.sku || 'KIT-0000')}</div>
          <h1 style="font-size:24px;font-weight:800;color:#fff;margin-bottom:14px;line-height:1.3;">${esc(p.name)}</h1>

          <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:20px;padding:16px 0;border-top:1px solid #334155;border-bottom:1px solid #334155;">
            <div style="font-size:28px;font-weight:800;color:#e60012;">${money(p.price)}</div>
            <div style="color:${isOutOfStock ? '#ef4444' : '#10b981'};font-size:13.5px;font-weight:600;">
              ${isOutOfStock ? '✖ Tạm hết hàng' : `✓ Còn ${maxStock} sản phẩm trong kho`}
            </div>
          </div>

          <!-- Thông số kỹ thuật -->
          <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px;margin-bottom:24px;font-size:13.5px;line-height:2;">
            <div><span style="color:#64748b;">Thương hiệu:</span> <strong style="color:#fff;">Bandai Spirits</strong></div>
            ${p.scale ? `<div><span style="color:#64748b;">Tỷ lệ mô hình:</span> <strong style="color:#fff;">${esc(p.scale)}</strong></div>` : ''}
            <div><span style="color:#64748b;">Xuất xứ:</span> <strong style="color:#fff;">Nhật Bản (Made in Japan)</strong></div>
          </div>

          <!-- Chọn số lượng & Nút mua -->
          <div style="display:flex;gap:14px;align-items:center;margin-bottom:24px;">
            <div style="display:inline-flex;align-items:center;border:1px solid #475569;border-radius:8px;overflow:hidden;background:#0f172a;">
              <button id="btn-dec" style="padding:10px 16px;background:none;border:none;color:#fff;cursor:pointer;font-size:16px;">−</button>
              <input type="number" id="detail-qty" value="1" min="1" max="${maxStock}" style="width:48px;text-align:center;background:none;border:none;color:#fff;font-weight:700;font-size:15px;" readonly>
              <button id="btn-inc" style="padding:10px 16px;background:none;border:none;color:#fff;cursor:pointer;font-size:16px;">+</button>
            </div>

            <button id="btn-add-cart" ${isOutOfStock ? 'disabled' : ''} style="flex:1;padding:14px 20px;background:#e60012;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:15px;cursor:${isOutOfStock ? 'not-allowed' : 'pointer'};box-shadow:0 4px 14px rgba(230,0,18,0.35);">
              ${isOutOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ hàng'}
            </button>
          </div>

          <!-- Mô tả sản phẩm -->
          <div>
            <h3 style="font-size:16px;color:#fff;margin-bottom:8px;font-weight:700;">Giới thiệu mô hình:</h3>
            <p style="color:#94a3b8;font-size:14px;line-height:1.7;">${esc(p.description || 'Bộ lắp ráp Gunpla Bandai chính hãng với độ chi tiết cao, biên độ cử động khớp linh hoạt, không cần dùng keo dán. Phù hợp cho người chơi mô hình từ cơ bản đến nâng cao.')}</p>
          </div>
        </div>
      </div>
    `;

    // Xử lý tăng giảm số lượng
    const qtyInput = document.getElementById('detail-qty');
    const btnInc = document.getElementById('btn-inc');
    const btnDec = document.getElementById('btn-dec');
    const btnAdd = document.getElementById('btn-add-cart');

    if (btnInc && qtyInput) {
      btnInc.onclick = () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val < maxStock) qtyInput.value = val + 1;
        else toast(`Số lượng tối đa trong kho là ${maxStock}`, 'info');
      };
    }

    if (btnDec && qtyInput) {
      btnDec.onclick = () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) qtyInput.value = val - 1;
      };
    }

    if (btnAdd && qtyInput) {
      btnAdd.onclick = async () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        btnAdd.textContent = 'Đang thêm...';
        btnAdd.disabled = true;
        try {
          await addToCart(p.id || p._id, qty);
        } finally {
          btnAdd.textContent = 'Thêm vào giỏ hàng';
          btnAdd.disabled = false;
        }
      };
    }
  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:50px;color:#ef4444;">Lỗi tải sản phẩm: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('detail-container')) {
    loadProductDetail();
  }
});
