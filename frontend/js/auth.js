// ====================================================================================
// [FRONTEND] auth.js - Quản lý Trạng thái Đăng nhập, Đăng ký và Token JWT
// ====================================================================================

import { api, toast } from './api.js';

export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setUser(user, access_token = null, refresh_token = null) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
  if (access_token) localStorage.setItem('access_token', access_token);
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
  if (!user && !access_token) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
  updateNavUser();
}

export async function login(email, password) {
  try {
    const res = await api('/auth/login', 'POST', { email, password });
    setUser(res.user, res.access_token, res.refresh_token);
    toast('Đăng nhập thành công!', 'success');
    return res;
  } catch (err) {
    toast(err.message || 'Sai email hoặc mật khẩu', 'error');
    throw err;
  }
}

export async function register(name, email, password, confirm_password) {
  try {
    const res = await api('/auth/register', 'POST', { name, email, password, confirm_password });
    toast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'success');
    return res;
  } catch (err) {
    toast(err.message || 'Đăng ký thất bại', 'error');
    throw err;
  }
}

export async function logout() {
  try {
    await api('/auth/logout', 'POST').catch(() => {});
  } finally {
    setUser(null);
    toast('Đã đăng xuất', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }
}

export function updateNavUser() {
  const user = getUser();
  const userArea = document.getElementById('nav-user-area');
  if (!userArea) return;

  if (user) {
    userArea.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <span style="color:#38bdf8;font-weight:700;font-size:13.5px;">👤 ${user.name || user.email}</span>
        ${user.role === 'admin' ? '<a href="admin.html" style="background:#7f1d1d;color:#fca5a5;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:700;text-decoration:none;">Admin</a>' : ''}
        <button id="btn-logout" style="background:#334155;color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:12.5px;cursor:pointer;">Thoát</button>
      </div>
    `;
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.onclick = logout;
  } else {
    userArea.innerHTML = `
      <a href="login.html" class="button secondary small" style="text-decoration:none;display:inline-block;padding:6px 14px;border-radius:6px;background:#1e293b;color:#fff;border:1px solid #334155;font-weight:600;font-size:13px;">Đăng nhập</a>
    `;
  }
}

// Khởi chạy cập nhật Navbar khi trang web load
document.addEventListener('DOMContentLoaded', updateNavUser);
