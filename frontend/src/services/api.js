import axios from 'axios';

const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1';
const API_BASE_URL = `http://${hostname}:8000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coffee_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    const replaceHost = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/g, `http://${currentHost}:8000`);
    };

    const processData = (data) => {
      if (!data) return data;
      if (Array.isArray(data)) {
        return data.map(item => processData(item));
      }
      if (typeof data === 'object') {
        const copy = { ...data };
        if (copy.image) copy.image = replaceHost(copy.image);
        if (copy.hot_image) copy.hot_image = replaceHost(copy.hot_image);
        if (copy.ice_image) copy.ice_image = replaceHost(copy.ice_image);
        return copy;
      }
      return data;
    };

    if (response.data && response.data.data) {
      response.data.data = processData(response.data.data);
    }
  }
  return response;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
};

export const productService = {
  getAll: () => api.get('/products'),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/products', data);
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/products/${id}`, data);
  },
  delete: (id) => api.delete(`/products/${id}`)
};


export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export const tableService = {
  getAll: () => api.get('/tables'),
  create: (data) => api.post('/tables', data),
  updateStatus: (id, status) => api.put(`/tables/${id}/status`, { status }),
  delete: (id) => api.delete(`/tables/${id}`)
};

export const orderService = {
  getAll: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

export default api;
