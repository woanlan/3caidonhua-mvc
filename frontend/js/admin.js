// ====================================================================================
// [FRONTEND] admin.js - Bảng điều khiển Quản trị (CRUD Sản phẩm, Duyệt Đơn hàng)
// ====================================================================================

import { api, money, esc, toast, uploadImage } from './api.js';
import { getUser } from './auth.js';

export async function initAdminPage() {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    const main = document.getElementById('admin-main');
    if (main) {
      main.innerHTML = `
        <div style="text-align:center;padding:80px 20px;background:#1e293b;border-radius:16px;max-width:500px;margin:40px auto;border:1px solid #7f1d1d;">
          <div style="font-size:48px;margin-bottom:12px;">🔒</div>
          <h2 style="color:#ef4444;margin-bottom:8px;">Yêu cầu quyền Quản trị viên (Admin)</h2>
          <p style="color:#94a3b8;margin-bottom:20px;">Vui lòng đăng nhập bằng tài khoản Admin để truy cập trang này.</p>
          <a href="login.html" style="padding:10px 20px;background:#e60012;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Đến trang Đăng nhập &rarr;</a>
        </div>
      `;
    }
    return;
  }

  loadAdminStats();
  loadAdminProducts();
  loadAdminOrders();
  setupAddProductForm();
}

async function loadAdminStats() {
  try {
    const products = await api('/products');
    const orders = await api('/orders');
    const users = await api('/users').catch(() => []);

    const elProdCount = document.getElementById('stat-products');
    const elOrderCount = document.getElementById('stat-orders');
    const elRevenue = document.getElementById('stat-revenue');
    const elUserCount = document.getElementById('stat-users');

    if (elProdCount) elProdCount.textContent = products.length;
    if (elOrderCount) elOrderCount.textContent = orders.length;

    const totalRev = orders.filter(o => o.status === 'completed' || o.paymentStatus === 'paid')
      .reduce((s, o) => s + (o.total || 0), 0);
    if (elRevenue) elRevenue.textContent = money(totalRev);
    if (elUserCount) elUserCount.textContent = users.length;
  } catch (e) {
    console.error('Lỗi tải thống kê admin:', e);
  }
}

async function loadAdminProducts() {
  const tbody = document.getElementById('admin-products-table');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8;">Đang tải danh sách sản phẩm...</td></tr>';

  try {
    const products = await api('/products');
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8;">Chưa có sản phẩm nào.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr style="border-bottom:1px solid #28374d;">
        <td style="padding:12px;"><img src="${esc(p.image || 'assets/hero-poster.jpg')}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px;"></td>
        <td style="padding:12px;font-weight:700;color:#fff;">${esc(p.name)}</td>
        <td style="padding:12px;color:#94a3b8;font-size:12px;">${esc(p.sku || '')}</td>
        <td style="padding:12px;"><span style="background:#0284c7;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">${esc(p.grade || 'HG')}</span></td>
        <td style="padding:12px;color:#e60012;font-weight:700;">${money(p.price)}</td>
        <td style="padding:12px;color:#fff;font-weight:600;">${p.quantity !== undefined ? p.quantity : 15}</td>
        <td style="padding:12px;">
          <button class="btn-del-prod" data-id="${p.id || p._id}" style="background:#7f1d1d;color:#fca5a5;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-weight:700;font-size:12px;">Xóa</button>
        </td>
      </tr>
    `).join('');

    // Gắn sự kiện Xóa sản phẩm (DELETE /api/products/:id)
    tbody.querySelectorAll('.btn-del-prod').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (confirm('Bạn có chắc chắn muốn xóa/lưu trữ sản phẩm này?')) {
          try {
            const res = await api(`/products/${id}`, 'DELETE');
            toast(res.message || 'Đã xóa sản phẩm thành công', 'success');
            loadAdminProducts();
            loadAdminStats();
          } catch (err) {
            toast(err.message || 'Lỗi khi xóa sản phẩm', 'error');
          }
        }
      };
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#ef4444;">Lỗi tải sản phẩm: ${err.message}</td></tr>`;
  }
}

async function loadAdminOrders() {
  const tbody = document.getElementById('admin-orders-table');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8;">Đang tải đơn hàng...</td></tr>';

  try {
    const orders = await api('/orders');
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8;">Chưa có đơn hàng nào.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr style="border-bottom:1px solid #28374d;">
        <td style="padding:12px;font-weight:700;color:#38bdf8;">#${esc(o.code || o.id)}</td>
        <td style="padding:12px;color:#fff;">${esc(o.recipient || '')}<br><span style="font-size:12px;color:#64748b;">${esc(o.phone || '')}</span></td>
        <td style="padding:12px;color:#e60012;font-weight:700;">${money(o.total)}</td>
        <td style="padding:12px;color:#94a3b8;font-size:13px;">${esc(o.paymentMethod || 'COD')}</td>
        <td style="padding:12px;">
          <select class="select-order-status" data-id="${o.id || o._id}" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:5px 8px;border-radius:6px;font-size:13px;">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Đang chuẩn bị</option>
            <option value="shipping" ${o.status === 'shipping' ? 'selected' : ''}>Đang giao hàng</option>
            <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Đã hoàn thành</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
          </select>
        </td>
        <td style="padding:12px;font-size:12px;color:#64748b;">${new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
      </tr>
    `).join('');

    // Gắn sự kiện đổi trạng thái đơn hàng (PUT /api/bills/:id)
    tbody.querySelectorAll('.select-order-status').forEach(sel => {
      sel.onchange = async () => {
        const id = sel.dataset.id;
        const status = sel.value;
        try {
          await api(`/bills/${id}`, 'PUT', { status, actor: 'Admin' });
          toast(`Đã cập nhật trạng thái đơn #${id.slice(-6).toUpperCase()} sang "${status}"`, 'success');
          loadAdminStats();
        } catch (err) {
          toast(err.message || 'Lỗi cập nhật trạng thái', 'error');
        }
      };
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#ef4444;">Lỗi tải đơn hàng: ${err.message}</td></tr>`;
  }
}

function setupAddProductForm() {
  const form = document.getElementById('form-add-product');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Đang thêm...';

    try {
      const formData = new FormData(form);
      let imageUrl = formData.get('image_url') || '/assets/hero-poster.jpg';

      // Nếu có chọn file ảnh từ máy tính -> Gọi API Multer upload trước
      const fileInput = document.getElementById('product-file-upload');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        btn.textContent = 'Đang tải ảnh lên...';
        const uploadRes = await uploadImage(fileInput.files[0]);
        if (uploadRes && uploadRes.url) {
          imageUrl = uploadRes.url;
        }
      }

      const body = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        price: Number(formData.get('price')),
        stock: Number(formData.get('quantity')),
        quantity: Number(formData.get('quantity')),
        grade: formData.get('grade'),
        category: formData.get('category'),
        image: imageUrl,
        description: formData.get('description')
      };

      // Gọi API thêm sản phẩm mới: POST /api/products
      await api('/products', 'POST', body);
      toast('Thêm mô hình mới thành công!', 'success');
      form.reset();
      loadAdminProducts();
      loadAdminStats();
    } catch (err) {
      toast(err.message || 'Thêm sản phẩm thất bại', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '+ Thêm mô hình mới';
    }
  };
}

document.addEventListener('DOMContentLoaded', initAdminPage);
