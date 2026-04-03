import api from '../api/api';

export const relatorioService = {
  faturamento: async (dataInicio, dataFim) => {
    const response = await api.get('/Relatorio/faturamento', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  itensMaisVendidos: async (dataInicio = null, dataFim = null) => {
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    
    const response = await api.get('/Relatorio/itens-mais-vendidos', { params });
    return response.data;
  }
};