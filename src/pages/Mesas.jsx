import React, { useState, useEffect } from 'react';
import { mesaService } from '../services/mesaService';
import './Mesas.css';

const Mesas = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarMesas();
  }, []);

  const carregarMesas = async () => {
    try {
      setLoading(true);
      const dados = await mesaService.listarTodas();
      setMesas(dados);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesas">
      <header className="page-header">
        <h1>Mesas</h1>
        <p>Gestão de mesas do restaurante</p>
      </header>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="mesas-grid">
          {mesas.map(mesa => (
            <div key={mesa.id} className="mesa-card">
              <div className="mesa-numero">Mesa {mesa.numero}</div>
              <div className="mesa-info">
                <span className="mesa-capacidade">
                  👥 {mesa.capacidade} {mesa.capacidade === 1 ? 'pessoa' : 'pessoas'}
                </span>
              </div>
              <div className="mesa-status disponivel">
                ✓ Disponível
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mesas;
