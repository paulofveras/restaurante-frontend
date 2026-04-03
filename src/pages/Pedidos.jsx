import React, { useState, useEffect } from 'react';
import { pedidoService } from '../services/pedidoService';
import Badge from '../components/Badge';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import './Pedidos.css';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const dados = await pedidoService.listarTodos();
      setPedidos(dados);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pedidos">
      <header className="page-header">
        <h1>Pedidos</h1>
        <p>Gestão de pedidos do restaurante</p>
      </header>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data/Hora</th>
                  <th>Status</th>
                  <th>Total Itens</th>
                  <th>Taxa</th>
                  <th>Total Final</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>{formatDateTime(pedido.dataHoraPedido)}</td>
                    <td><Badge status={pedido.status} /></td>
                    <td>{formatCurrency(pedido.totalItens)}</td>
                    <td>{formatCurrency(pedido.taxaAtendimento)}</td>
                    <td><strong>{formatCurrency(pedido.totalFinal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;