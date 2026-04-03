import React from 'react';
import { motion } from 'framer-motion';
import './StatCard.css';

const StatCard = ({ title, value, icon, trend, trendValue, delay = 0 }) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: delay,
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        delay: delay + 0.2,
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    }
  };

  const getTrendColor = () => {
    if (trend === 'positive') return 'trend-positive';
    if (trend === 'negative') return 'trend-negative';
    return 'trend-neutral';
  };

  return (
    <motion.div
      className="stat-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -8,
        boxShadow: '0 12px 32px rgba(251, 146, 60, 0.2)',
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className="stat-icon-wrapper"
        variants={iconVariants}
      >
        <div className="stat-icon">
          {icon}
        </div>
      </motion.div>

      <div className="stat-content">
        <motion.p 
          className="stat-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {title}
        </motion.p>

        <motion.h3 
          className="stat-value"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.4, type: 'spring' }}
        >
          {value}
        </motion.h3>

        {trendValue && (
          <motion.div 
            className={`stat-trend ${getTrendColor()}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.5 }}
          >
            <span className="trend-icon">
              {trend === 'positive' ? '↑' : trend === 'negative' ? '↓' : '→'}
            </span>
            {trendValue}
          </motion.div>
        )}
      </div>

      {/* Efeito de brilho no hover */}
      <div className="stat-shine"></div>
    </motion.div>
  );
};

export default StatCard;