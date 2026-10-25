import { authRequest, fetchCsrfToken, responseError } from './auth';

async function readJson(response, fallback) {
  if (!response.ok) {
    const error = new Error(await responseError(response, fallback));
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

export async function getMenus() {
  return readJson(await authRequest('/api/thuc-don'), 'Không thể tải danh sách thực đơn.');
}

export async function getMenu(id) {
  return readJson(await authRequest(`/api/thuc-don/${id}`), 'Không thể tải chi tiết thực đơn.');
}

export async function saveMenu(menu, id) {
  const token = await fetchCsrfToken();
  return readJson(await authRequest(id ? `/api/thuc-don/${id}` : '/api/thuc-don', {
    method: id ? 'PUT' : 'POST',
    headers: { 'X-XSRF-TOKEN': token },
    body: JSON.stringify(menu),
  }), 'Không thể lưu thực đơn.');
}

export async function deleteMenu(id) {
  const token = await fetchCsrfToken();
  return readJson(await authRequest(`/api/thuc-don/${id}`, {
    method: 'DELETE',
    headers: { 'X-XSRF-TOKEN': token },
  }), 'Không thể xóa thực đơn.');
}

export async function getFoods({ keyword = '', loaiMon = '', trangThai } = {}) {
  const params = new URLSearchParams();
  if (keyword.trim()) params.set('keyword', keyword.trim());
  if (loaiMon) params.set('loaiMon', loaiMon);
  if (trangThai !== undefined && trangThai !== '') params.set('trangThai', String(trangThai));
  const query = params.toString();
  return readJson(await authRequest(`/api/mon-an${query ? `?${query}` : ''}`), 'Không thể tải danh mục món ăn.');
}

export async function saveFood(food, id) {
  const token = await fetchCsrfToken();
  return readJson(await authRequest(id ? `/api/mon-an/${id}` : '/api/mon-an', {
    method: id ? 'PUT' : 'POST',
    headers: { 'X-XSRF-TOKEN': token },
    body: JSON.stringify(food),
  }), 'Không thể lưu món ăn.');
}

export async function setFoodStatus(id, trangThai) {
  const token = await fetchCsrfToken();
  return readJson(await authRequest(`/api/mon-an/${id}/trang-thai`, {
    method: 'PATCH',
    headers: { 'X-XSRF-TOKEN': token },
    body: JSON.stringify({ trangThai }),
  }), 'Không thể cập nhật trạng thái món ăn.');
}

export async function deleteFood(id) {
  const token = await fetchCsrfToken();
  return readJson(await authRequest(`/api/mon-an/${id}`, {
    method: 'DELETE',
    headers: { 'X-XSRF-TOKEN': token },
  }), 'Không thể xóa món ăn.');
}

export async function saveMenuItem(menuId, item, id) {
  const token = await fetchCsrfToken();
  return readJson(await authRequest(
    id ? `/api/thuc-don/${menuId}/chi-tiet/${id}` : `/api/thuc-don/${menuId}/chi-tiet`,
    {
      method: id ? 'PUT' : 'POST',
      headers: { 'X-XSRF-TOKEN': token },
      body: JSON.stringify(item),
    },
  ), 'Không thể lưu món trong thực đơn.');
}

export async function deleteMenuItem(menuId, id) {
  const token = await fetchCsrfToken();
  return readJson(await authRequest(`/api/thuc-don/${menuId}/chi-tiet/${id}`, {
    method: 'DELETE',
    headers: { 'X-XSRF-TOKEN': token },
  }), 'Không thể xóa món khỏi thực đơn.');
}
