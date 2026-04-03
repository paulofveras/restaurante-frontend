import { apiFetch } from '../api/api';

export const mesaService = {
  listarTodas: async () => {
    const res = await apiFetch('/Mesa');
    return res.json();
  },

  buscarPorId: async (id) => {
    const res = await apiFetch(`/Mesa/${id}`);
    return res.json();
  },

  listarDisponiveis: async (data) => {
    const res = await apiFetch(`/Mesa/disponiveis?data=${data}`);
    return res.json();
  },

  criar: async (mesa) => {
    const res = await apiFetch('/Mesa', {
      method: 'POST',
      body: JSON.stringify(mesa),
    });
    return res.json();
  },

  deletar: async (id) => {
    const res = await apiFetch(`/Mesa/${id}`, { method: 'DELETE' });
    return res.json();
  },
};