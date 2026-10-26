// ====================================================================================
// [FRONTEND] api.js - Module kết nối và gọi RESTful API sang Backend
// Tự động nhận diện port 3000 hoặc hỗ trợ Live Server (port 5500) qua CORS
// ====================================================================================

// Xác định base URL của Backend: Nếu đang chạy chung server port 3000 thì dùng '/api', nếu dùng Live Server port 5500 thì dùng 'http://localhost:3000/api'
export const API_BASE = (window.location.port === '3000' || window.location.port === '')
  ? '/api'
  : 'http://localhost:3000/api';

export const SERVER_BASE = (window.location.port === '3000' || window.location.port === '')
  ? ''
  : 'http://localhost:3000';

/**
 * Hàm định dạng tiền tệ Việt Nam (VNĐ)
 * @param {number} n 
 * @returns {string} ví dụ: "1.150.000 đ"
 */
export function money(n) {
  return (Number(n) || 0).toLocaleString('vi-VN') + ' đ';
}

/**
 * Hàm escape chuỗi HTML chống tấn công XSS
 */
export function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Hiển thị thông báo Toast nhanh góc màn hình
 */
export function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  const bg = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : '#0284c7');
  el.style.cssText = `background:${bg};color:#fff;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,0.3);transition:all 0.3s;pointer-events:auto;`;
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/**
 * Hàm gọi API tổng quát hỗ trợ Token Bearer JWT và CORS
 */
export async function api(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const options = {
    method,
    headers,
    credentials: 'include'
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Lỗi yêu cầu: Mã ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${method} ${url}:`, err);
    throw err;
  }
}

/**
 * Upload file ảnh sang Backend Multer
 */
export async function uploadImage(file) {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData
  });

  const data = await res.json();
  if (!res.ok || data.status === 0) {
    throw new Error(data.message || 'Lỗi tải ảnh');
  }
  return data;
}
