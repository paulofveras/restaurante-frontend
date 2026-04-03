import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import logoSolDoCerrado from '../assets/logo-sol-cerrado.png';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = authService.getUsuarioLogado();

  const menuItems = [
    { path: '/dashboard',     label: 'Dashboard',       icon: '📊' },
    { path: '/pedidos',       label: 'Pedidos',          icon: '📝' },
    { path: '/cardapio',      label: 'Cardápio',         icon: '🍽️' },
    { path: '/mesas',         label: 'Mesas',            icon: '🪑' },
    { path: '/relatorios',    label: 'Relatórios',       icon: '📈' },
    { path: '/sugestao-chef', label: 'Sugestão do Chef', icon: '⭐' },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {/* ── LOGO → redireciona para Landing Page ── */}
      <div className="sidebar-header">
        <div className="logo" onClick={() => navigate('/')} title="Ir para o site">
          <div className="logo-imagem">
            <img
              src={logoSolDoCerrado}
              alt="Sol do Cerrado"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FACC15" />
                    <stop offset="100%" stopColor="#FB923C" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="20" fill="url(#sunGradient)" />
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  return (
                    <line key={i}
                      x1={50 + Math.cos(angle) * 25} y1={50 + Math.sin(angle) * 25}
                      x2={50 + Math.cos(angle) * 38} y2={50 + Math.sin(angle) * 38}
                      stroke="url(#sunGradient)" strokeWidth="3" strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
          <div className="logo-text">
            <h2>Sol do Cerrado</h2>
            <p>← voltar ao site</p>
          </div>
        </div>
      </div>

      {/* ── NAVEGAÇÃO ── */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const ativo = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${ativo ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {ativo && (
                <motion.div
                  className="active-indicator"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── RODAPÉ: PERFIL + SAIR ── */}
      <div className="sidebar-footer">
        {/* Card do usuário → clica para ir ao dashboard */}
        <div className="user-profile" onClick={() => navigate('/dashboard')}
          title="Ir para o Dashboard" style={{ cursor: 'pointer' }}>
          <div className="user-avatar">
            <span>{usuario?.userName?.charAt(0).toUpperCase() ?? '👤'}</span>
          </div>
          <div className="user-info">
            <p className="user-name">{usuario?.userName ?? 'Usuário'}</p>
            <p className="user-role">
              {usuario?.perfil === 'Administrador' ? '⚙️ Administrador' : '🍽️ Cliente'}
            </p>
          </div>
        </div>

        {/* Botão Sair */}
        <button className="btn-sair-sidebar" onClick={handleLogout}>
          🚪 Sair do Sistema
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;