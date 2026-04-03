import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { pedidoService } from '../services/pedidoService';
import { formatCurrency } from '../utils/formatters';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    faturamentoHoje: 0,
    pedidosAtivos: 0,
    clientesAtendidos: 0,
    tempoMedio: 0
  });

  const [pedidosRecentes, setPedidosRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const pedidos = await pedidoService.listarTodos();
      
      const hoje = new Date().toDateString();
      const pedidosHoje = pedidos.filter(p => 
        new Date(p.dataHoraPedido).toDateString() === hoje
      );

      const faturamento = pedidosHoje
        .filter(p => p.status !== 4)
        .reduce((sum, p) => sum + p.totalFinal, 0);

      const ativos = pedidos.filter(p => 
        p.status === 0 || p.status === 1 || p.status === 2
      ).length;

      setStats({
        faturamentoHoje: faturamento,
        pedidosAtivos: ativos,
        clientesAtendidos: pedidosHoje.length,
        tempoMedio: 18
      });

      setPedidosRecentes(pedidos.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FACC15" />
                  <stop offset="50%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#spinnerGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="200"
                strokeDashoffset="50"
              />
            </svg>
          </motion.div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.header className="page-header" variants={itemVariants}>
        <h1>Dashboard</h1>
        <p>Visão geral do restaurante em tempo real</p>
      </motion.header>

      <motion.div className="stats-grid" variants={containerVariants}>
        <StatCard
          title="Faturamento Hoje"
          value={formatCurrency(stats.faturamentoHoje)}
          icon="💰"
          trend="positive"
          trendValue="+12,5% vs ontem"
          delay={0}
        />
        <StatCard
          title="Pedidos Ativos"
          value={stats.pedidosAtivos}
          icon="📝"
          trend="neutral"
          trendValue={`${stats.pedidosAtivos} em preparo`}
          delay={0.1}
        />
        <StatCard
          title="Clientes Atendidos"
          value={stats.clientesAtendidos}
          icon="👥"
          trend="positive"
          trendValue="+5 vs média"
          delay={0.2}
        />
        <StatCard
          title="Tempo Médio"
          value={`${stats.tempoMedio} min`}
          icon="⏱️"
          trend="negative"
          trendValue="+2 min vs meta"
          delay={0.3}
        />
      </motion.div>

      <motion.div className="content-area" variants={itemVariants}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pedidos Recentes</h2>
            <button className="btn-text">Ver todos →</button>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Data/Hora</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosRecentes.map((pedido, index) => (
                    <motion.tr
                      key={pedido.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ backgroundColor: 'rgba(251, 146, 60, 0.05)' }}
                    >
                      <td className="pedido-id">#{pedido.id}</td>
                      <td>{new Date(pedido.dataHoraPedido).toLocaleString('pt-BR')}</td>
                      <td>
                        <Badge status={pedido.status} />
                      </td>
                      <td className="pedido-total">{formatCurrency(pedido.totalFinal)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;