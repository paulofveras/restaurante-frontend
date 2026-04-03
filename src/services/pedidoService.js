import { apiFetch } from '../api/api';

export const pedidoService = {
  listarTodos: async () => {
    const res = await apiFetch('/Pedido');
    return res.json();
  },

  buscarPorId: async (id) => {
    const res = await apiFetch(`/Pedido/${id}`);
    return res.json();
  },

  criar: async (pedido) => {
    const res = await apiFetch('/Pedido', {
      method: 'POST',
      body: JSON.stringify(pedido),
    });
    return res.json();
  },

  atualizar: async (id, pedido) => {
    const res = await apiFetch(`/Pedido/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pedido),
    });
    return res.json();
  },

  deletar: async (id) => {
    const res = await apiFetch(`/Pedido/${id}`, { method: 'DELETE' });
    return res.json();
  },
};