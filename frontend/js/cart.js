// ====================================================================================
// [FRONTEND] cart.js - Quản lý Giỏ hàng (Thêm, Sửa, Xóa, Tồn kho & Cập nhật Badge)
// ====================================================================================

import { api, money, esc, toast } from './api.js';

export async function getCart() {
  try {
    return await api('/cart');
  } catch (e) {
    return [];
  }
}

export async function addToCart(id, qty = 1) {
  try {
    const cart = await api(`/cart/items/${id}`, 'PUT', { quantity: qty });
    updateCartBadge(cart);
    toast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    return cart;
  } catch (err) {
    toast(err.message || 'Không thể thêm vào giỏ hàng', 'error');
    throw err;
  }
}

export async function updateQuantity(id, newQty) {
  try {
    const cart = await api(`/cart/items/${id}`, 'PUT', { quantity: newQty });
    updateCartBadge(cart);
    return cart;
  } catch (err) {
    toast(err.message || 'Không thể cập nhật số lượng', 'error');
    throw err;
  }
}

export async function removeFromCart(id) {
  try {
    const cart = await api(`/cart/items/${id}`, 'DELETE');
    updateCartBadge(cart);
    toast('Đã xóa sản phẩm khỏi giỏ', 'info');
    return cart;
  } catch (err) {
    toast(err.message || 'Lỗi khi xóa sản phẩm', 'error');
    throw err;
  }
}

export async function updateCartBadge(cartData = null) {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const items = cartData || await getCart();
  const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

export async function renderCartPage() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;">Đang tải giỏ hàng...</div>';
  const cart = await getCart();

  if (!cart || cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;background:#1e293b;border-radius:16px;border:1px solid #334155;">
        <div style="font-size:48px;margin-bottom:16px;">🛒</div>
        <h2 style="font-size:20px;margin-bottom:8px;color:#fff;">Giỏ hàng của bạn đang trống</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">Hãy khám phá các mô hình Gunpla Bandai mới nhất để lấp đầy bộ sưu tập của bạn.</p>
        <a href="products.html" style="display:inline-block;padding:12px 24px;background:#e60012;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Khám phá sản phẩm &rarr;</a>
      </div>
    `;
    updateCartBadge(cart);
    return;
  }

  const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;">
      <!-- Danh sách sản phẩm -->
      <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:24px;">
        <h2 style="font-size:18px;font-weight:800;margin-bottom:16px;color:#fff;border-bottom:1px solid #334155;padding-bottom:12px;">Sản phẩm trong giỏ (${cart.length})</h2>
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${cart.map(item => `
            <div style="display:flex;gap:16px;align-items:center;padding-bottom:16px;border-bottom:1px solid #28374d;">
              <img src="${esc(item.image || 'assets/hero-poster.jpg')}" alt="${esc(item.name)}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid #334155;">
              <div style="flex:1;">
                <h3 style="font-size:15px;color:#fff;margin-bottom:4px;">${esc(item.name)}</h3>
                <div style="color:#e60012;font-weight:700;font-size:14px;">${money(item.price)}</div>
              </div>
              <!-- Tăng giảm số lượng -->
              <div style="display:inline-flex;align-items:center;border:1px solid #334155;border-radius:6px;overflow:hidden;background:#0f172a;">
                <button class="btn-qty" data-id="${item.variantId || item.id}" data-action="dec" style="padding:6px 12px;background:none;border:none;color:#fff;cursor:pointer;font-size:14px;">−</button>
                <span style="padding:0 8px;font-weight:700;font-size:14px;color:#38bdf8;">${item.quantity}</span>
                <button class="btn-qty" data-id="${item.variantId || item.id}" data-action="inc" style="padding:6px 12px;background:none;border:none;color:#fff;cursor:pointer;font-size:14px;">+</button>
              </div>
              <div style="width:100px;text-align:right;font-weight:700;color:#fff;">
                ${money(item.price * item.quantity)}
              </div>
              <button class="btn-del" data-id="${item.variantId || item.id}" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:6px;font-size:18px;" title="Xóa">✕</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tóm tắt thanh toán -->
      <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:24px;position:sticky;top:100px;">
        <h3 style="font-size:17px;font-weight:800;margin-bottom:16px;color:#fff;border-bottom:1px solid #334155;padding-bottom:10px;">Tóm tắt đơn hàng</h3>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;color:#94a3b8;font-size:14px;">
          <span>Tạm tính:</span>
          <span style="color:#fff;font-weight:600;">${money(totalMoney)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:14px;color:#94a3b8;font-size:14px;">
          <span>Phí vận chuyển:</span>
          <span style="color:#10b981;font-weight:600;">Miễn phí (Toàn quốc)</span>
        </div>
        <div style="border-top:1px dashed #334155;padding-top:14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <span style="font-weight:700;color:#fff;">Tổng cộng:</span>
          <span style="font-size:20px;font-weight:800;color:#e60012;">${money(totalMoney)}</span>
        </div>
        <a href="checkout.html" style="display:block;width:100%;padding:14px;background:#e60012;color:#fff;text-align:center;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;transition:0.2s;box-shadow:0 4px 14px rgba(230,0,18,0.4);">Tiến hành thanh toán &rarr;</a>
        <a href="products.html" style="display:block;text-align:center;margin-top:12px;color:#94a3b8;text-decoration:none;font-size:13.5px;">&larr; Tiếp tục chọn thêm mô hình</a>
      </div>
    </div>
  `;

  // Gắn sự kiện nút tăng giảm
  container.querySelectorAll('.btn-qty').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const currentItem = cart.find(x => (x.variantId || x.id) == id);
      if (!currentItem) return;
      const newQty = action === 'inc' ? currentItem.quantity + 1 : currentItem.quantity - 1;
      await updateQuantity(id, newQty);
      renderCartPage();
    };
  });

  // Gắn sự kiện nút xóa
  container.querySelectorAll('.btn-del').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ?')) {
        await removeFromCart(btn.dataset.id);
        renderCartPage();
      }
    };
  });

  updateCartBadge(cart);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  if (document.getElementById('cart-container')) {
    renderCartPage();
  }
});
