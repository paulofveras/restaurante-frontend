import { apiFetch } from '../api/api';

export const relatorioService = {
  faturamento: async (dataInicio, dataFim) => {
    const res = await apiFetch(`/Relatorio/faturamento?dataInicio=${dataInicio}&dataFim=${dataFim}`);
    return res.json();
  },

  itensMaisVendidos: async (dataInicio = null, dataFim = null) => {
    let url = '/Relatorio/itens-mais-vendidos';
    if (dataInicio && dataFim) {
      url += `?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    }
    const res = await apiFetch(url);
    return res.json();
  },
};