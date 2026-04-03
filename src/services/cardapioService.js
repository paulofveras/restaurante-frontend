import api from '../api/api';

export const cardapioService = {
  listarTodos: async (periodo = null) => {
    const url = periodo !== null ? `/ItemCardapio?periodo=${periodo}` : '/ItemCardapio';
    const response = await api.get(url);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/ItemCardapio/${id}`);
    return response.data;
  },

  criar: async (item) => {
    const response = await api.post('/ItemCardapio', item);
    return response.data;
  },

  atualizar: async (id, item) => {
    const response = await api.put(`/ItemCardapio/${id}`, item);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/ItemCardapio/${id}`);
    return response.data;
  }
};