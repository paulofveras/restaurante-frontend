import { apiFetch } from '../api/api';

export const cardapioService = {
  listarTodos: async () => {
    const res = await apiFetch('/Cardapio');
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

  deletar: async (id) => {
    const res = await apiFetch(`/Cardapio/${id}`, { method: 'DELETE' });
    return res.json();
  },
};