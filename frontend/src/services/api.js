export const API_BASE_URL = `http://${window.location.hostname}:8000/api`;

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || errorData.message || 'Error en la petición');
    error.data = errorData; // Attach the full error data (e.g., field-specific errors)
    throw error;
  }
  // Handle 204 No Content response
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const getDiscos = (url) => {
  return request(url);
};

export const getDisco = (id) => {
  return request(`${API_BASE_URL}/discos/${id}/`);
};

export const addDisco = (disco) => {
  return request(`${API_BASE_URL}/discos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(disco),
  });
};

export const updateDisco = (id, disco) => {
  return request(`${API_BASE_URL}/discos/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(disco),
  });
};

export const deleteDisco = (id) => {
  return request(`${API_BASE_URL}/discos/${id}/`, {
    method: 'DELETE',
  });
};

export const scanDisco = (path) => {
  const url = new URL(`${API_BASE_URL}/discos/scan/`);
  url.searchParams.append('path', path);
  return request(url.toString(), {
    method: 'GET',
  });
};

export const migrateContent = (contenidoId, discoDestinoId) => {
  return request(`${API_BASE_URL}/discos/contenidos/${contenidoId}/migrate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contenido_id: contenidoId,
      disco_destino_id: discoDestinoId
    }),
  });
};

// --- Inventario Services ---

export const getDispositivos = (url) => {
  return request(url);
};

export const getCategorias = () => {
  return request(`${API_BASE_URL}/inventario/categorias/`);
};

export const createDispositivo = (data) => {
  return request(`${API_BASE_URL}/inventario/dispositivos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const updateDispositivo = (id, data) => {
  return request(`${API_BASE_URL}/inventario/dispositivos/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const getMovimientos = (url) => {
  return request(url);
};

export const getHistorial = (id) => {
  return request(`${API_BASE_URL}/inventario/dispositivos/${id}/historial/`);
};

export const createMovimiento = (data) => {
  return request(`${API_BASE_URL}/inventario/movimientos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// --- Mantenimiento Services ---

export const getMantenimientos = (url) => {
  return request(url);
};

export const createMantenimiento = (data) => {
  return request(`${API_BASE_URL}/mantenimiento/mantenimientos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const updateMantenimiento = (id, data) => {
  return request(`${API_BASE_URL}/mantenimiento/mantenimientos/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const getDashboardStats = () => {
  return request(`${API_BASE_URL}/dashboard/stats/`);
};

// --- Reportes Services ---

export const getReportes = (url) => {
  return request(url || `${API_BASE_URL}/reportes/gestion/`);
};

export const createReportePublico = (data) => {
  // data must be FormData if sending files
  return request(`${API_BASE_URL}/reportes/public/create/`, {
    method: 'POST',
    // Do NOT set Content-Type header when sending FormData; browser sets it with boundary
    body: data,
  });
};

export const updateReporte = (id, data) => {
  return request(`${API_BASE_URL}/reportes/gestion/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const getReporteStats = () => {
  return request(`${API_BASE_URL}/reportes/stats/general/`);
};
