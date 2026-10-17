export let user = null;

export function setUser(value) {
  user = value;
  if (value && value.access_token) {
    try { localStorage.setItem('access_token', value.access_token); } catch (e) {}
  }
  if (value && value.refresh_token) {
    try { localStorage.setItem('refresh_token', value.refresh_token); } catch (e) {}
  }
  if (!value) {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (e) {}
  }
}

export class ApiError extends Error {
  status;
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, method = 'GET', body) {
  let response;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(user ? { 'X-CSRF-Token': user.csrf } : {})
  };

  try {
    response = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được server. Kiểm tra terminal và thử lại.');
  }

  const data = await response.json().catch(() => ({ error: 'Server trả về dữ liệu không hợp lệ.' }));
  if (!response.ok) {
    throw new ApiError(response.status, data.message || data.error || 'Không thể thực hiện yêu cầu.');
  }
  return data;
}

// Upload file helper sử dụng Multer endpoint
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('image', file);
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const res = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'same-origin',
    headers,
    body: formData
  });
  const data = await res.json().catch(() => ({ error: 'Lỗi upload ảnh' }));
  if (!res.ok) {
    throw new ApiError(res.status, data.message || data.error || 'Upload ảnh thất bại');
  }
  return data;
}
