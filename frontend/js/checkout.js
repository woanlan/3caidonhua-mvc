// ====================================================================================
// [FRONTEND] checkout.js - Xử lý Thanh toán & Đặt hàng (COD, VietQR, VNPAY)
// ====================================================================================

import { api, money, esc, toast } from './api.js';
import { getCart, updateCartBadge } from './cart.js';
import { getUser } from './auth.js';

export async function initCheckoutPage() {
  const container = document.getElementById('checkout-container');
  if (!container) return;

  const cart = await getCart();
  if (!cart || cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;background:#1e293b;border-radius:16px;">
        <h2 style="color:#fff;margin-bottom:12px;">Giỏ hàng của bạn đang trống</h2>
        <p style="color:#94a3b8;margin-bottom:20px;">Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.</p>
        <a href="products.html" style="padding:10px 20px;background:#e60012;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Mua sắm ngay &rarr;</a>
      </div>
    `;
    return;
  }

  const user = getUser();
  const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 380px;gap:28px;align-items:start;">
      <!-- Form Thông tin giao hàng -->
      <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:28px;">
        <h2 style="font-size:18px;font-weight:800;color:#fff;margin-bottom:20px;border-bottom:1px solid #334155;padding-bottom:12px;">1. Thông tin người nhận hàng</h2>

        <form id="form-checkout" style="display:flex;flex-direction:column;gap:16px;">
          <div>
            <label style="display:block;font-size:13.5px;color:#94a3b8;margin-bottom:6px;font-weight:600;">Họ và tên người nhận *</label>
            <input type="text" name="recipient" required value="${esc(user?.name || '')}" placeholder="Ví dụ: Nguyễn Văn A" style="width:100%;padding:11px 14px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#fff;font-size:14px;">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:13.5px;color:#94a3b8;margin-bottom:6px;font-weight:600;">Số điện thoại liên hệ *</label>
              <input type="tel" name="phone" required value="${esc(user?.phone || '')}" placeholder="Ví dụ: 0907652267" style="width:100%;padding:11px 14px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#fff;font-size:14px;">
            </div>
            <div>
              <label style="display:block;font-size:13.5px;color:#94a3b8;margin-bottom:6px;font-weight:600;">Tỉnh / Thành phố *</label>
              <input type="text" name="city" required value="TP. Hồ Chí Minh" placeholder="Ví dụ: TP. Hồ Chí Minh" style="width:100%;padding:11px 14px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#fff;font-size:14px;">
            </div>
          </div>

          <div>
            <label style="display:block;font-size:13.5px;color:#94a3b8;margin-bottom:6px;font-weight:600;">Địa chỉ nhận hàng chi tiết *</label>
            <input type="text" name="address" required value="${esc(user?.address || '')}" placeholder="Số nhà, tên đường, phường/xã, quận/huyện" style="width:100%;padding:11px 14px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#fff;font-size:14px;">
          </div>

          <div>
            <label style="display:block;font-size:13.5px;color:#94a3b8;margin-bottom:6px;font-weight:600;">Ghi chú giao hàng (Tùy chọn)</label>
            <textarea name="note" rows="2" placeholder="Ví dụ: Giao hàng vào giờ hành chính, gọi trước khi đến" style="width:100%;padding:11px 14px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#fff;font-size:14px;resize:vertical;"></textarea>
          </div>

          <h2 style="font-size:18px;font-weight:800;color:#fff;margin:16px 0 10px;border-top:1px solid #334155;padding-top:20px;">2. Chọn phương thức thanh toán</h2>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <label style="display:flex;align-items:center;gap:12px;padding:14px;background:#0f172a;border:1px solid #334155;border-radius:10px;cursor:pointer;">
              <input type="radio" name="paymentMethod" value="COD" checked style="accent-color:#e60012;width:18px;height:18px;">
              <div>
                <strong style="color:#fff;display:block;">Thanh toán khi nhận hàng (COD)</strong>
                <span style="font-size:12.5px;color:#94a3b8;">Thanh toán tiền mặt cho nhân viên giao hàng khi nhận kiện hàng.</span>
              </div>
            </label>

            <label style="display:flex;align-items:center;gap:12px;padding:14px;background:#0f172a;border:1px solid #334155;border-radius:10px;cursor:pointer;">
              <input type="radio" name="paymentMethod" value="VIETQR" style="accent-color:#0284c7;width:18px;height:18px;">
              <div>
                <strong style="color:#38bdf8;display:block;">Chuyển khoản Ngân hàng qua VietQR (Tự động)</strong>
                <span style="font-size:12.5px;color:#94a3b8;">Quét mã QR Techcombank, hệ thống tự động xác nhận đơn hàng sau 10 giây.</span>
              </div>
            </label>

            <label style="display:flex;align-items:center;gap:12px;padding:14px;background:#0f172a;border:1px solid #334155;border-radius:10px;cursor:pointer;">
              <input type="radio" name="paymentMethod" value="VNPAY" style="accent-color:#10b981;width:18px;height:18px;">
              <div>
                <strong style="color:#34d399;display:block;">Cổng thanh toán trực tuyến VNPAY Sandbox</strong>
                <span style="font-size:12.5px;color:#94a3b8;">Hỗ trợ thẻ ATM nội địa (NCB), Internet Banking, Visa/Mastercard.</span>
              </div>
            </label>
          </div>

          <button type="submit" id="btn-submit-order" style="margin-top:16px;padding:14px;background:#e60012;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer;box-shadow:0 4px 16px rgba(230,0,18,0.4);">
            Xác nhận đặt hàng (${money(totalMoney)}) &rarr;
          </button>
        </form>
      </div>

      <!-- Tóm tắt đơn hàng bên phải -->
      <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:24px;position:sticky;top:100px;">
        <h3 style="font-size:17px;font-weight:800;color:#fff;margin-bottom:16px;border-bottom:1px solid #334155;padding-bottom:10px;">Đơn hàng của bạn</h3>
        <div style="display:flex;flex-direction:column;gap:12px;max-height:280px;overflow-y:auto;padding-right:4px;margin-bottom:16px;">
          ${cart.map(item => `
            <div style="display:flex;gap:12px;align-items:center;font-size:13.5px;">
              <img src="${esc(item.image || 'assets/hero-poster.jpg')}" alt="${esc(item.name)}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #334155;">
              <div style="flex:1;">
                <div style="color:#fff;font-weight:600;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">${esc(item.name)}</div>
                <div style="color:#94a3b8;font-size:12px;">${item.quantity} x ${money(item.price)}</div>
              </div>
              <div style="font-weight:700;color:#fff;">${money(item.price * item.quantity)}</div>
            </div>
          `).join('')}
        </div>

        <div style="border-top:1px dashed #334155;padding-top:14px;display:flex;justify-content:space-between;color:#94a3b8;font-size:14px;margin-bottom:8px;">
          <span>Phí vận chuyển:</span>
          <span style="color:#10b981;font-weight:600;">Miễn phí (GHN)</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #334155;padding-top:14px;margin-top:10px;">
          <strong style="color:#fff;font-size:16px;">Tổng thanh toán:</strong>
          <strong style="color:#e60012;font-size:22px;">${money(totalMoney)}</strong>
        </div>
      </div>
    </div>
  `;

  // Xử lý gửi Form Đặt Hàng
  const form = document.getElementById('form-checkout');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-order');
      btn.disabled = true;
      btn.textContent = 'Đang xử lý đặt hàng...';

      const formData = new FormData(form);
      const body = {
        recipient: formData.get('recipient'),
        phone: formData.get('phone'),
        address: `${formData.get('address')}, ${formData.get('city')}`,
        note: formData.get('note'),
        paymentMethod: formData.get('paymentMethod'),
        items: cart
      };

      try {
        // [GỌI API TẠO ĐƠN HÀNG]: POST /api/orders
        const orderRes = await api('/orders', 'POST', body);
        const orderId = orderRes.id || orderRes._id || (orderRes.bill ? orderRes.bill._id : '');
        const orderCode = orderRes.code || ('HD' + orderId.slice(-6).toUpperCase());

        // Nếu khách chọn VNPAY -> Gọi tiếp API tạo Payment URL rồi redirect
        if (body.paymentMethod === 'VNPAY') {
          toast('Đang chuyển hướng sang cổng VNPAY...', 'info');
          try {
            const payRes = await api('/payment/create_payment_url', 'POST', {
              orderId: orderId,
              amount: totalMoney,
              orderInfo: `Thanh toan don hang ${orderCode}`
            });
            if (payRes && payRes.paymentUrl) {
              window.location.href = payRes.paymentUrl;
              return;
            }
          } catch (payErr) {
            console.error('Lỗi khởi tạo VNPAY:', payErr);
          }
        }

        // Cập nhật lại giỏ hàng và badge
        await updateCartBadge([]);

        // Render màn hình thành công
        renderSuccessView(container, orderRes, body, totalMoney, orderCode);
      } catch (err) {
        toast(err.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại.', 'error');
        btn.disabled = false;
        btn.textContent = `Xác nhận đặt hàng (${money(totalMoney)}) →`;
      }
    };
  }
}

function renderSuccessView(container, orderRes, body, totalMoney, orderCode) {
  const isVietQr = (body.paymentMethod === 'VIETQR');
  const tcbQrUrl = `https://img.vietqr.io/image/TCB-8888868650-compact2.png?amount=${totalMoney}&addInfo=${encodeURIComponent(orderCode)}&accountName=NGUYEN%20HOANG%20LAN`;

  container.innerHTML = `
    <div style="max-width:640px;margin:0 auto;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:36px;text-align:center;">
      <div style="font-size:56px;color:#10b981;margin-bottom:12px;">✓</div>
      <h1 style="font-size:22px;color:#fff;font-weight:800;margin-bottom:8px;">ĐẶT HÀNG THÀNH CÔNG!</h1>
      <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">Cảm ơn bạn đã ủng hộ 3caidonhua Gunpla Studio. Đơn hàng của bạn đã được ghi nhận vào hệ thống.</p>

      <div style="background:#0f172a;border-radius:10px;padding:16px;text-align:left;font-size:13.5px;line-height:2;border:1px solid #334155;margin-bottom:24px;">
        <div><span style="color:#64748b;">Mã đơn hàng:</span> <strong style="color:#38bdf8;font-size:15px;">#${esc(orderCode)}</strong></div>
        <div><span style="color:#64748b;">Người nhận:</span> <strong style="color:#fff;">${esc(body.recipient)} - ${esc(body.phone)}</strong></div>
        <div><span style="color:#64748b;">Địa chỉ giao:</span> <strong style="color:#fff;">${esc(body.address)}</strong></div>
        <div><span style="color:#64748b;">Phương thức:</span> <strong style="color:#fff;">${esc(body.paymentMethod)}</strong></div>
        <div><span style="color:#64748b;">Tổng số tiền:</span> <strong style="color:#e60012;font-size:16px;">${money(totalMoney)}</strong></div>
      </div>

      ${isVietQr ? `
        <!-- Khung quét mã VietQR Techcombank -->
        <div style="background:#ffffff;border-radius:12px;padding:20px;margin-bottom:24px;border:2px solid #0284c7;">
          <h3 style="color:#0369a1;font-size:15px;font-weight:800;margin-bottom:8px;">QUÉT MÃ VIETQR ĐỂ HOÀN TẤT THANH TOÁN</h3>
          <p style="color:#64748b;font-size:13px;margin-bottom:14px;">Mở ứng dụng ngân hàng bất kỳ (Techcombank, Vietcombank, MoMo...) để quét mã:</p>
          <img src="${tcbQrUrl}" alt="VietQR" style="width:240px;height:240px;display:block;margin:0 auto 14px;border-radius:8px;">
          <div style="font-size:13px;color:#334155;line-height:1.8;text-align:left;background:#f8fafc;padding:12px;border-radius:8px;">
            <div>STK: <strong>8888868650</strong> (Techcombank)</div>
            <div>Chủ TK: <strong>NGUYEN HOANG LAN</strong></div>
            <div>Số tiền: <strong style="color:#e60012;">${money(totalMoney)}</strong></div>
            <div>Nội dung CK: <strong style="color:#0284c7;">${esc(orderCode)}</strong></div>
          </div>
        </div>
      ` : ''}

      <div style="display:flex;gap:12px;justify-content:center;">
        <a href="orders.html" style="padding:12px 22px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Tra cứu tiến trình đơn hàng &rarr;</a>
        <a href="products.html" style="padding:12px 22px;background:#334155;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Tiếp tục mua sắm</a>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout-container')) {
    initCheckoutPage();
  }
});
