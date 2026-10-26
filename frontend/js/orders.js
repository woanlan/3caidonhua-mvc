// ====================================================================================
// [FRONTEND] orders.js - Tra cứu tiến trình & Lịch sử Đơn hàng
// ====================================================================================

import { api, money, esc, toast } from './api.js';

export async function initOrdersPage() {
  const container = document.getElementById('orders-container');
  const trackForm = document.getElementById('form-track-order');

  if (trackForm) {
    trackForm.onsubmit = async (e) => {
      e.preventDefault();
      const input = document.getElementById('track-input');
      const query = input ? input.value.trim() : '';
      if (!query) return;

      const trackResult = document.getElementById('track-result');
      if (trackResult) {
        trackResult.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;">Đang tra cứu đơn hàng...</div>';
      }

      try {
        const res = await api(`/orders/track/${encodeURIComponent(query)}`);
        const orders = res.orders || [];
        renderTrackOrders(trackResult, orders);
      } catch (err) {
        if (trackResult) {
          trackResult.innerHTML = `
            <div style="background:#1e293b;border:1px solid #ef4444;border-radius:12px;padding:24px;text-align:center;color:#ef4444;">
              ${err.message || 'Không tìm thấy đơn hàng nào khớp với thông tin tra cứu.'}
            </div>
          `;
        }
      }
    };
  }

  // Tải danh sách đơn hàng của tài khoản đang đăng nhập
  if (container) {
    loadUserOrders(container);
  }
}

async function loadUserOrders(container) {
  try {
    const orders = await api('/orders');
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;background:#1e293b;border-radius:12px;color:#94a3b8;">
          Bạn chưa có đơn hàng nào. Hãy đặt mua mô hình để theo dõi lịch sử tại đây!
        </div>
      `;
      return;
    }
    renderTrackOrders(container, orders);
  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:30px;color:#94a3b8;">Đăng nhập để xem lịch sử đơn hàng của bạn hoặc dùng khung tra cứu phía trên.</div>`;
  }
}

function renderTrackOrders(container, orders) {
  if (!container) return;
  if (!orders || orders.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;">Không có đơn hàng nào.</div>';
    return;
  }

  container.innerHTML = orders.map(o => {
    const statusMap = {
      'pending': { text: 'Chờ xác nhận', color: '#f59e0b', step: 1 },
      'confirmed': { text: 'Đã xác nhận', color: '#0284c7', step: 2 },
      'processing': { text: 'Đang đóng gói', color: '#8b5cf6', step: 2 },
      'shipping': { text: 'Đang giao hàng', color: '#3b82f6', step: 3 },
      'delivered': { text: 'Đã giao hàng', color: '#10b981', step: 4 },
      'completed': { text: 'Hoàn tất', color: '#10b981', step: 4 },
      'cancelled': { text: 'Đã hủy', color: '#ef4444', step: 0 }
    };

    const st = statusMap[o.status] || { text: o.status, color: '#94a3b8', step: 1 };
    const canCancel = ['pending', 'confirmed'].includes(o.status);

    return `
      <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:24px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding-bottom:14px;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <div>
            <span style="font-size:16px;font-weight:800;color:#fff;">Mã đơn: #${esc(o.code || o.id)}</span>
            <span style="font-size:13px;color:#64748b;margin-left:12px;">Ngày đặt: ${new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="background:${st.color};color:#fff;font-size:12.5px;font-weight:700;padding:4px 12px;border-radius:20px;">
              ${st.text}
            </span>
            ${canCancel ? `<button class="btn-cancel-order" data-id="${o.id || o._id}" style="background:#7f1d1d;color:#fca5a5;border:none;padding:5px 12px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">Hủy đơn</button>` : ''}
          </div>
        </div>

        <!-- Danh sách món -->
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
          ${(o.items || []).map(item => `
            <div style="display:flex;gap:12px;align-items:center;font-size:13.5px;">
              <img src="${esc(item.image || 'assets/hero-poster.jpg')}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #334155;">
              <div style="flex:1;">
                <div style="color:#fff;font-weight:600;">${esc(item.name)}</div>
                <div style="color:#94a3b8;font-size:12px;">Số lượng: ${item.quantity} x ${money(item.price)}</div>
              </div>
              <div style="font-weight:700;color:#fff;">${money(item.price * item.quantity)}</div>
            </div>
          `).join('')}
        </div>

        <!-- Thông tin nhận hàng & Tổng tiền -->
        <div style="border-top:1px dashed #334155;padding-top:12px;display:flex;justify-content:space-between;align-items:center;font-size:13.5px;color:#94a3b8;flex-wrap:wrap;gap:10px;">
          <div>Giao đến: <strong style="color:#fff;">${esc(o.recipient || '')} - ${esc(o.phone || '')}</strong> (${esc(o.address || '')})</div>
          <div>Tổng tiền: <strong style="color:#e60012;font-size:17px;">${money(o.total)}</strong></div>
        </div>
      </div>
    `;
  }).join('');

  // Gắn sự kiện hủy đơn hàng
  container.querySelectorAll('.btn-cancel-order').forEach(btn => {
    btn.onclick = async () => {
      const orderId = btn.dataset.id;
      if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Hệ thống sẽ tự động hoàn trả số lượng tồn kho.')) {
        try {
          await api(`/orders/${orderId}/cancel`, 'POST', { reason: 'Khách hàng hủy trên trang tra cứu' });
          toast('Đã hủy đơn hàng thành công và hoàn trả tồn kho!', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
          toast(err.message || 'Không thể hủy đơn hàng', 'error');
        }
      }
    };
  });
}

document.addEventListener('DOMContentLoaded', initOrdersPage);
