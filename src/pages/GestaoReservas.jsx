// src/pages/GestaoReservas.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/api';
import './GestaoReservas.css';

const GestaoReservas = () => {
  const [reservas, setReservas]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState('');
  const [filtro, setFiltro]       = useState('futuras'); // 'futuras' | 'todas'

  useEffect(() => { carregarReservas(); }, []);

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/Reserva');
      if (res.ok) {
        const dados = await res.json();
        setReservas(dados);
      } else throw new Error();
    } catch {
      setErro('Erro ao carregar reservas.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const agora = new Date();
  const reservasFiltradas = reservas.filter(r =>
    filtro === 'todas' ? true : new Date(r.dataHora) >= agora
  ).sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

  return (
    <div className="gr-pagina">
      <header className="page-header">
        <h1>🪑 Gestão de Reservas</h1>
        <p>Acompanhe e gerencie as reservas de mesas</p>
      </header>

      {/* Filtro */}
      <div className="gr-filtros">
        <button
          className={`gr-filtro-btn ${filtro === 'futuras' ? 'ativo' : ''}`}
          onClick={() => setFiltro('futuras')}
        >
          📅 Próximas
        </button>
        <button
          className={`gr-filtro-btn ${filtro === 'todas' ? 'ativo' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          📋 Todas
        </button>
        <button className="gr-btn-atualizar" onClick={carregarReservas}>
          🔄 Atualizar
        </button>
      </div>

      {loading && <p className="gr-loading">Carregando reservas...</p>}
      {erro && <div className="gr-erro">⚠️ {erro}</div>}

      {!loading && !erro && (
        <>
          <p className="gr-contagem">
            {reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? 's' : ''}
            {filtro === 'futuras' ? ' futuras' : ' no total'}
          </p>

          {reservasFiltradas.length === 0 ? (
            <div className="gr-vazio">
              <span>🪑</span>
              <p>Nenhuma reserva {filtro === 'futuras' ? 'futura ' : ''}encontrada.</p>
            </div>
          ) : (
            <div className="gr-tabela-wrapper">
              <table className="gr-tabela">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Data e Hora</th>
                    <th>Mesa</th>
                    <th>Código</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasFiltradas.map((r, i) => {
                    const isFutura = new Date(r.dataHora) >= agora;
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td className="gr-id">#{r.id}</td>
                        <td>{formatarData(r.dataHora)}</td>
                        <td>Mesa {r.mesaId}</td>
                        <td>
                          <code className="gr-codigo">{r.codigoConfirmacao}</code>
                        </td>
                        <td>
                          <span className={`gr-status ${isFutura ? 'futura' : 'passada'}`}>
                            {isFutura ? '✅ Confirmada' : '🕐 Encerrada'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GestaoReservas;