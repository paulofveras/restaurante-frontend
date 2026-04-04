import { apiFetch } from '../api/api';

export const cardapioService = {
  // Público — só ativos
  listarTodos: async () => {
    const res = await apiFetch('/Cardapio');
    return res.json();
  },

  // Admin — todos (ativos + inativos)
  listarTodosAdmin: async () => {
    const res = await apiFetch('/Cardapio/admin/todos');
    return res.json();
  },

  buscarPorId: async (id) => {
    const res = await apiFetch(`/Cardapio/${id}`);
    return res.json();
  },

  criar: async (item) => {
    const res = await apiFetch('/Cardapio', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return res.json();
  },

  atualizar: async (id, item) => {
    const res = await apiFetch(`/Cardapio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return res.json();
  },

  alternarStatus: async (id) => {
    const res = await apiFetch(`/Cardapio/${id}/alternar-status`, {
      method: 'PUT',
    });
    return res.json();
  },

  alternarStatusTodos: async (ativo) => {
    const res = await apiFetch(`/Cardapio/alternar-status-todos?ativo=${ativo}`, {
      method: 'PUT',
    });
    return res.json();
  },

  deletar: async (id) => {
    const res = await apiFetch(`/Cardapio/${id}`, { method: 'DELETE' });
    return res.json();
  },
};