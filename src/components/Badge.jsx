import React from 'react';
import { motion } from 'framer-motion';
import './Badge.css';

const Badge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      // Por número (admin — painel de pedidos)
      0: { label: 'Recebido', classe: 'badge-recebido', icon: '🔔', cor: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      1: { label: 'Em Preparo', classe: 'badge-preparo', icon: '👨‍🍳', cor: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      2: { label: 'Pronto', classe: 'badge-pronto', icon: '✅', cor: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      3: { label: 'Saiu p/ Entrega', classe: 'badge-saiu', icon: '🛵', cor: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
      4: { label: 'Entregue', classe: 'badge-entregue', icon: '🎉', cor: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
      5: { label: 'Cancelado', classe: 'badge-cancelado', icon: '❌', cor: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      // Por string (cliente — PainelCliente)
      'Recebido': { label: 'Recebido', classe: 'badge-recebido', icon: '🔔', cor: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'Confirmado': { label: 'Confirmado', classe: 'badge-pronto', icon: '✅', cor: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      'EmPreparo': { label: 'Em Preparo', classe: 'badge-preparo', icon: '👨‍🍳', cor: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      'SaiuParaEntrega': { label: 'Saiu p/ Entrega', classe: 'badge-saiu', icon: '🛵', cor: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
      'Entregue': { label: 'Entregue', classe: 'badge-entregue', icon: '🎉', cor: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
      'Cancelado': { label: 'Cancelado', classe: 'badge-cancelado', icon: '❌', cor: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'Pendente': { label: 'Pendente', classe: 'badge-recebido', icon: '⏳', cor: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'Pronto': { label: 'Pronto', classe: 'badge-pronto', icon: '✅', cor: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    };
    return configs[status] ?? { label: String(status || 'Pendente'), classe: 'badge-recebido', icon: '⏳', cor: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  };

  const config = getStatusConfig(status);
  return (
    <motion.span
      className={`badge ${config.classe}`}
      style={{ background: config.bg, color: config.cor, border: `1px solid ${config.cor}` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="badge-icon">{config.icon}</span>
      <span className="badge-label">{config.label}</span>
    </motion.span>
  );
};

export default Badge;