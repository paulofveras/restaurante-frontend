import api from '../api/api';

export const mesaService = {
  listarTodas: async () => {
    const response = await api.get('/Mesa');
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/Mesa/${id}`);
    return response.data;
  },

  criar: async (mesa) => {
    const response = await api.post('/Mesa', mesa);
    return response.data;
  },

  atualizar: async (id, mesa) => {
    const response = await api.put(`/Mesa/${id}`, mesa);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/Mesa/${id}`);
    return response.data;
  }
};