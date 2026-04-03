import React from 'react';
import { motion } from 'framer-motion';
import './Badge.css';

const Badge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      0: { label: 'Recebido', class: 'badge-recebido', icon: '🔔' },
      1: { label: 'Em Preparo', class: 'badge-preparo', icon: '👨‍🍳' },
      2: { label: 'Pronto', class: 'badge-pronto', icon: '✅' },
      3: { label: 'Entregue', class: 'badge-entregue', icon: '🎉' },
      4: { label: 'Cancelado', class: 'badge-cancelado', icon: '❌' }
    };
    return configs[status] || { label: 'Desconhecido', class: 'badge-default', icon: '❓' };
  };

  const config = getStatusConfig(status);

  return (
    <motion.span
      className={`badge ${config.class}`}
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