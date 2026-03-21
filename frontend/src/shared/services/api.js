const API_BASE_URL = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}

export const generoApi = {
  getAll: () => request('/generos'),
  create: (payload) => request('/generos', { method: 'POST', body: JSON.stringify(payload) }),
  updateByNombre: (nombre, payload) => request(`/generos/${encodeURIComponent(nombre)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteByNombre: (nombre) => request(`/generos/${encodeURIComponent(nombre)}`, { method: 'DELETE' })
};

export const directorApi = {
  getAll: () => request('/directores'),
  create: (payload) => request('/directores', { method: 'POST', body: JSON.stringify(payload) }),
  updateByNombre: (nombres, payload) => request(`/directores/${encodeURIComponent(nombres)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteByNombre: (nombres) => request(`/directores/${encodeURIComponent(nombres)}`, { method: 'DELETE' })
};

export const productoraApi = {
  getAll: () => request('/productoras'),
  create: (payload) => request('/productoras', { method: 'POST', body: JSON.stringify(payload) }),
  updateByNombre: (nombre, payload) => request(`/productoras/${encodeURIComponent(nombre)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteByNombre: (nombre) => request(`/productoras/${encodeURIComponent(nombre)}`, { method: 'DELETE' })
};

export const tipoApi = {
  getAll: () => request('/tipos'),
  create: (payload) => request('/tipos', { method: 'POST', body: JSON.stringify(payload) }),
  updateByNombre: (nombre, payload) => request(`/tipos/${encodeURIComponent(nombre)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteByNombre: (nombre) => request(`/tipos/${encodeURIComponent(nombre)}`, { method: 'DELETE' })
};

export const mediaApi = {
  getAll: () => request('/medias'),
  create: (payload) => request('/medias', { method: 'POST', body: JSON.stringify(payload) }),
  updateBySerial: (serial, payload) => request(`/medias/${encodeURIComponent(serial)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBySerial: (serial) => request(`/medias/${encodeURIComponent(serial)}`, { method: 'DELETE' })
};
