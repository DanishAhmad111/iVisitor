import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const visitorService = {
  submitRequest: async (data) => {
    const response = await api.post('/visitor-request', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/visitors');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/visitor/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/visitor-status/${id}`, { status });
    return response.data;
  },

  verifyVisitor: async (visitorId, code) => {
    const response = await api.post('/guard-verify', { visitorId, code });
    return response.data;
  },

  markExit: async (id) => {
    const response = await api.put(`/visitor-exit/${id}`);
    return response.data;
  },
};

export default api;
