import React, { useState, useEffect } from 'react';
import { relatorioService } from '../services/relatorioService';
import { formatCurrency } from '../utils/formatters';
import './Relatorios.css';

const Relatorios = () => {
  const [faturamento, setFaturamento] = useState([]);
  const [itensMaisVendidos, setItensMaisVendidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      
      // Período: últimos 30 dias
      const dataFim = new Date();
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 30);

      const [dadosFaturamento, dadosItens] = await Promise.all([
        relatorioService.faturamento(
          dataInicio.toISOString().split('T')[0],
          dataFim.toISOString().split('T')[0]
        ),
        relatorioService.itensMaisVendidos(
          dataInicio.toISOString().split('T')[0],
          dataFim.toISOString().split('T')[0]
        )
      ]);

      setFaturamento(dadosFaturamento);
      setItensMaisVendidos(dadosItens.slice(0, 10)); // Top 10
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relatorios">
      <header className="page-header">
        <h1>Relatórios</h1>
        <p>Análise de desempenho do restaurante (últimos 30 dias)</p>
      </header>

      {loading ? (
        <p>Carregando relatórios...</p>
      ) : (
        <div className="relatorios-grid">
          {/* Faturamento por Tipo de Atendimento */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Faturamento por Tipo de Atendimento</h2>
            </div>
            <div className="card-body">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Total de Pedidos</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {faturamento.map((item, index) => (
                    <tr key={index}>
                      <td>{item.tipoAtendimento}</td>
                      <td>{item.totalPedidos}</td>
                      <td><strong>{formatCurrency(item.faturamento)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Itens Mais Vendidos */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Top 10 Itens Mais Vendidos</h2>
            </div>
            <div className="card-body">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Período</th>
                    <th>Total Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {itensMaisVendidos.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.nome}</td>
                      <td>
                        <span className={`periodo-badge ${item.periodo === 0 ? 'almoco' : 'jantar'}`}>
                          {item.periodo === 0 ? 'Almoço' : 'Jantar'}
                        </span>
                      </td>
                      <td><strong>{item.totalVendido}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
