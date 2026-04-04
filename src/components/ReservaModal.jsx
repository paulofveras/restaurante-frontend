// src/components/ReservaModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { apiFetch } from '../api/api';
import './ReservaModal.css';

const ReservaModal = ({ visivel, onFechar }) => {
  const usuario = authService.getUsuarioLogado();

  const [data, setData] = useState('');
  const [pessoas, setPessoas] = useState(2);
  const [mesas, setMesas] = useState([]);
  const [mesaId, setMesaId] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(null); // { id, codigo }

  // Data mínima = amanhã
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dataMinima = amanha.toISOString().split('T')[0];

  useEffect(() => {
    if (visivel) carregarMesas();
  }, [visivel]);

  // Quando fecha, reseta
  useEffect(() => {
    if (!visivel) {
      setTimeout(() => {
        setData(''); setPessoas(2); setMesaId('');
        setErro(''); setSucesso(null); setEnviando(false);
      }, 300);
    }
  }, [visivel]);

  const carregarMesas = async () => {
    try {
      const res = await apiFetch('/Mesa');
      if (res.ok) {
        const dados = await res.json();
        setMesas(dados);
        if (dados.length > 0) setMesaId(dados[0].id);
      }
    } catch {
      setErro('Não foi possível carregar as mesas disponíveis.');
    }
  };

  const mesasDisponiveis = mesas.filter(m => m.capacidade >= pessoas);

  const handleReservar = async () => {
    if (!data) { setErro('Selecione uma data.'); return; }
    if (!mesaId) { setErro('Selecione uma mesa.'); return; }
    if (!usuario) { setErro('Você precisa estar logado.'); return; }

    setErro('');
    setEnviando(true);

    // Horário fixo: almoço às 12h00
    // Monta a string direto sem converter para UTC, evitando problema de fuso
    const dataHora = `${data}T12:00:00`;

    try {
      const res = await apiFetch('/Reserva', {
        method: 'POST',
        body: JSON.stringify({
          mesaId: Number(mesaId),
          usuarioId: usuario.id,
          dataHora: dataHora,   // já é string no formato correto
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Erro ao criar reserva.');
      }

      const reserva = await res.json();
      setSucesso(reserva);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!visivel) return null;

  return (
    <div className="rv-overlay" onClick={onFechar}>
      <motion.div
        className="rv-modal"
        onClick={e => e.stopPropagation()}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="rv-header">
          <div>
            <h2>🪑 Reservar Mesa</h2>
            <p>Almoço — horário fixo: 12h00</p>
          </div>
          <button className="rv-fechar" onClick={onFechar}>✕</button>
        </div>

        {!sucesso ? (
          <>
            {/* Data */}
            <div className="rv-campo">
              <label>📅 Data da Reserva <small>(mínimo D+1)</small></label>
              <input
                type="date"
                min={dataMinima}
                value={data}
                onChange={e => setData(e.target.value)}
              />
            </div>

            {/* Número de pessoas */}
            <div className="rv-campo">
              <label>👥 Número de Pessoas</label>
              <div className="rv-contador">
                <button onClick={() => setPessoas(p => Math.max(1, p - 1))}>−</button>
                <span>{pessoas}</span>
                <button onClick={() => setPessoas(p => Math.min(20, p + 1))}>+</button>
              </div>
            </div>

            {/* Seleção de mesa */}
            <div className="rv-campo">
              <label>🪑 Mesa</label>
              {mesasDisponiveis.length === 0 ? (
                <p className="rv-aviso">
                  Nenhuma mesa com capacidade para {pessoas} {pessoas === 1 ? 'pessoa' : 'pessoas'}.
                  Reduza o número de pessoas.
                </p>
              ) : (
                <div className="rv-mesas-grid">
                  {mesasDisponiveis.map(m => (
                    <button
                      key={m.id}
                      className={`rv-mesa-btn ${mesaId === m.id ? 'selecionada' : ''}`}
                      onClick={() => setMesaId(m.id)}
                    >
                      <span className="rv-mesa-num">Mesa {m.numero}</span>
                      <span className="rv-mesa-cap">👥 até {m.capacidade}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info horário */}
            <div className="rv-info-horario">
              <span>☀️</span>
              <div>
                <strong>Almoço — 11h às 14h</strong>
                <p>Reservas com mínimo de 1 dia de antecedência</p>
              </div>
            </div>

            {erro && <div className="rv-erro">⚠️ {erro}</div>}

            <button
              className="rv-btn-confirmar"
              onClick={handleReservar}
              disabled={enviando || mesasDisponiveis.length === 0}
            >
              {enviando ? '⏳ Reservando...' : '✔ Confirmar Reserva'}
            </button>
          </>
        ) : (
          /* Sucesso */
          <motion.div
            className="rv-sucesso"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="rv-sucesso-icone">🎉</div>
            <h3>Reserva Confirmada!</h3>
            <div className="rv-sucesso-detalhes">
              <div className="rv-detalhe-linha">
                <span>Código</span>
                <strong className="rv-codigo">{sucesso.codigoConfirmacao}</strong>
              </div>
              <div className="rv-detalhe-linha">
                <span>Data</span>
                <strong>{new Date(sucesso.dataHora).toLocaleDateString('pt-BR')}</strong>
              </div>
              <div className="rv-detalhe-linha">
                <span>Horário</span>
                <strong>12h00 (Almoço)</strong>
              </div>
            </div>
            <p className="rv-sucesso-msg">
              Apresente o código de confirmação ao chegar. Até logo! 🌟
            </p>
            <button className="rv-btn-confirmar" onClick={onFechar}>Fechar</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ReservaModal;