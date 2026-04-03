import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';

// Contexto e Componentes do Carrinho
import { CarrinhoProvider } from './contexts/CarrinhoContext';
import CarrinhoDrawer from './components/CarrinhoDrawer';
import CarrinhoBotao from './components/CarrinhoBotao';
import CheckoutModal from './components/CheckoutModal'; // ← NOVO IMPORT

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import Cardapio from './pages/Cardapio';
import Mesas from './pages/Mesas';
import Relatorios from './pages/Relatorios';
import LandingPage from './pages/LandingPage';
import SugestaoChef from './pages/SugestaoChef';
import './App.css';

// ─────────────────────────────────────────────────────────
// Componente de proteção de rota
// Se o usuário não estiver logado OU não for admin,
// redireciona para a raiz (/)
// ─────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const logado = authService.isLogado();
  const admin  = authService.isAdmin();

  if (!logado || !admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────────────────
// Layout do painel administrativo (com Sidebar)
// ─────────────────────────────────────────────────────────
const AdminLayout = ({ children }) => (
  <div className="app">
    <Sidebar />
    <div className="main-content">
      {children}
    </div>
  </div>
);

function App() {
  // ← NOVO: Estado para controlar a abertura do Checkout
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  // ← NOVO: Escuta o evento disparado pelo botão "Finalizar Pedido" do CarrinhoDrawer
  useEffect(() => {
    const handler = () => setCheckoutAberto(true);
    window.addEventListener('abrirCheckout', handler);
    return () => window.removeEventListener('abrirCheckout', handler);
  }, []);

  return (
    <CarrinhoProvider>
      <Router>
        <Routes>
          {/* ── Rotas públicas e de Cliente ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/sugestao-chef" element={<SugestaoChef />} />

          {/* ── Rotas administrativas protegidas (Apenas Perfil 1 - Admin) ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/pedidos" element={
            <ProtectedRoute>
              <AdminLayout><Pedidos /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/cardapio" element={
            <ProtectedRoute>
              <AdminLayout><Cardapio /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/mesas" element={
            <ProtectedRoute>
              <AdminLayout><Mesas /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/relatorios" element={
            <ProtectedRoute>
              <AdminLayout><Relatorios /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Qualquer rota desconhecida volta para a raiz */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Drawer e botão flutuante aparecem em qualquer lugar para o cliente */}
        <CarrinhoDrawer />
        <CarrinhoBotao />

        {/* ← NOVO: Modal de checkout */}
        <CheckoutModal
          visivel={checkoutAberto}
          onFechar={() => setCheckoutAberto(false)}
        />
      </Router>
    </CarrinhoProvider>
  );
}

export default App;
