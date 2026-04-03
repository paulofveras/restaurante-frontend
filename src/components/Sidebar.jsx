import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoSolDoCerrado from '../assets/logo-sol-cerrado.png'; // Você vai colocar a logo aqui
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/pedidos', label: 'Pedidos', icon: '📝' },
    { path: '/cardapio', label: 'Cardápio', icon: '🍽️' },
    { path: '/mesas', label: 'Mesas', icon: '🪑' },
    { path: '/relatorios', label: 'Relatórios', icon: '📈' }
  ];

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {/* Header com Logo */}
      <div className="sidebar-header">
        <motion.div
          className="logo"
          whileHover={{ scale: 1.03 }}
        >
          {/* LOGO DO USUÁRIO - Coloque sua imagem em src/assets/logo-sol-cerrado.png */}
          <div className="logo-imagem">
            <img 
              src={logoSolDoCerrado} 
              alt="Sol do Cerrado" 
              onError={(e) => {
                // Fallback: Se a imagem não carregar, mostra um ícone
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback SVG caso a imagem não carregue */}
            <div className="logo-fallback" style={{ display: 'none' }}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FACC15" />
                    <stop offset="50%" stopColor="#FB923C" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="20" fill="url(#sunGradient)" />
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  const x1 = 50 + Math.cos(angle) * 25;
                  const y1 = 50 + Math.sin(angle) * 25;
                  const x2 = 50 + Math.cos(angle) * 35;
                  const y2 = 50 + Math.sin(angle) * 35;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="url(#sunGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
          
          <div className="logo-text">
            <h2>Sol do Cerrado</h2>
            <p>Gastronomia Regional</p>
          </div>
        </motion.div>
      </div>

      {/* Navegação */}
      <nav className="sidebar-nav">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <motion.span
                  className="nav-icon"
                  whileHover={{ scale: 1.2 }}
                >
                  {item.icon}
                </motion.span>
                <span className="nav-label">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="active-indicator"
                    layoutId="activeIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <motion.div
          className="user-profile"
          whileHover={{ scale: 1.02 }}
        >
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <div className="user-info">
            <p className="user-name">Usuário</p>
            <p className="user-role">Gerente</p>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;