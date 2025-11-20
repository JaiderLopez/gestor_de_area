const API_BASE_URL = 'http://localhost:8000/api';

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error en la petición');
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
