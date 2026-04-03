import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import Cardapio from './pages/Cardapio';
import Mesas from './pages/Mesas';
import Relatorios from './pages/Relatorios';
import LandingPage from './pages/LandingPage';
import SugestaoChef from './pages/SugestaoChef';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page (Pública - sem sidebar) */}
        <Route path="/" element={<LandingPage />} />

        {/* Rotas do Sistema (com sidebar) */}
        <Route path="/*" element={
          <div className="app">
            <Sidebar />
            <div className="main-content">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pedidos" element={<Pedidos />} />
                <Route path="/cardapio" element={<Cardapio />} />
                <Route path="/mesas" element={<Mesas />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/sugestao-chef" element={<SugestaoChef />} />
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
