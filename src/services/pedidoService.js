import api from '../api/api';

export const pedidoService = {
  listarTodos: async () => {
    const response = await api.get('/Pedido');
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/Pedido/${id}`);
    return response.data;
  },

  criar: async (pedido) => {
    const response = await api.post('/Pedido', pedido);
    return response.data;
  },

  atualizar: async (id, pedido) => {
    const response = await api.put(`/Pedido/${id}`, pedido);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/Pedido/${id}`);
    return response.data;
  }
};