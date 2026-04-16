// src/components/ReservaModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authService } from "../services/authService";
import { apiFetch } from "../api/api";
import "./ReservaModal.css";

const ReservaModal = ({ visivel, onFechar }) => {
  const usuario = authService.getUsuarioLogado();

  const [data, setData] = useState("");
  const [pessoas, setPessoas] = useState(2);
  const [mesas, setMesas] = useState([]);
  const [mesaId, setMesaId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(null);

  // Data mínima = amanhã
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dataMinima = amanha.toISOString().split("T")[0];

  useEffect(() => {
    if (visivel) carregarMesas();
  }, [visivel]);

  useEffect(() => {
    if (!visivel) {
      setTimeout(() => {
        setData("");
        setPessoas(2);
        setMesaId("");
        setErro("");
        setSucesso(null);
        setEnviando(false);
      }, 300);
    }
  }, [visivel]);

  const carregarMesas = async () => {
    try {
      const res = await apiFetch("/Mesa");
      if (res.ok) {
        const dados = await res.json();
        setMesas(dados);
        if (dados.length > 0) setMesaId(dados[0].id);
      }
    } catch {
      setErro("Não foi possível carregar as mesas disponíveis.");
    }
  };

  const mesasDisponiveis = mesas.filter((m) => m.capacidade >= pessoas);

  const handleReservar = async () => {
    if (!data) {
      setErro("Selecione uma data.");
      return;
    }
    if (!mesaId) {
      setErro("Selecione uma mesa.");
      return;
    }
    if (!usuario) {
      setErro("Você precisa estar logado.");
      return;
    }

    setErro("");
    setEnviando(true);

    const dataHora = `${data}T12:00:00`;

    try {
      const res = await apiFetch("/Reserva", {
        method: "POST",
        body: JSON.stringify({
          mesaId: Number(mesaId),
          usuarioId: usuario.id,
          dataHora: dataHora,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Erro ao criar reserva.");
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
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="rv-header">
          <div>
            <h2 className="rv-titulo">
              <svg
                className="rv-icone-titulo"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 2v4M15 2v4M9 14l2 2 4-4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              </svg>
              Reservar Mesa
            </h2>
            <p>Almoço — horário fixo: 12h00</p>
          </div>
          <button className="rv-fechar" onClick={onFechar}>
            ✕
          </button>
        </div>

        {!sucesso ? (
          <>
            {/* Data */}
            <div className="rv-campo">
              <label>
                <svg
                  className="rv-icone-label"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Data da Reserva <small>(mínimo D+1)</small>
              </label>
              <input
                type="date"
                min={dataMinima}
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>

            {/* Número de pessoas */}
            <div className="rv-campo">
              <label>
                <svg
                  className="rv-icone-label"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Número de Pessoas
              </label>
              <div className="rv-contador">
                <button onClick={() => setPessoas((p) => Math.max(1, p - 1))}>
                  −
                </button>
                <span>{pessoas}</span>
                <button onClick={() => setPessoas((p) => Math.min(20, p + 1))}>
                  +
                </button>
              </div>
            </div>

            {/* Seleção de mesa */}
            <div className="rv-campo">
              <label>
                <svg
                  className="rv-icone-label"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
                Mesa
              </label>
              {mesasDisponiveis.length === 0 ? (
                <p className="rv-aviso">
                  Nenhuma mesa com capacidade para {pessoas}{" "}
                  {pessoas === 1 ? "pessoa" : "pessoas"}. Reduza o número de
                  pessoas.
                </p>
              ) : (
                <div className="rv-mesas-grid">
                  {mesasDisponiveis.map((m) => (
                    <button
                      key={m.id}
                      className={`rv-mesa-btn ${mesaId === m.id ? "selecionada" : ""}`}
                      onClick={() => setMesaId(m.id)}
                    >
                      <span className="rv-mesa-num">Mesa {m.numero}</span>
                      <span className="rv-mesa-cap">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        até {m.capacidade}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info horário */}
            <div className="rv-info-horario">
              <svg
                className="rv-icone-sol"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
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
              {enviando ? (
                <>
                  <svg className="rv-loading" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.25"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                  </svg>
                  Reservando...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Confirmar Reserva
                </>
              )}
            </button>
          </>
        ) : (
          /* Sucesso */
          <motion.div
            className="rv-sucesso"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="rv-sucesso-icone">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Reserva Confirmada!</h3>
            <div className="rv-sucesso-detalhes">
              <div className="rv-detalhe-linha">
                <span>Código</span>
                <strong className="rv-codigo">
                  {sucesso.codigoConfirmacao}
                </strong>
              </div>
              <div className="rv-detalhe-linha">
                <span>Data</span>
                <strong>
                  {new Date(sucesso.dataHora).toLocaleDateString("pt-BR")}
                </strong>
              </div>
              <div className="rv-detalhe-linha">
                <span>Horário</span>
                <strong>12h00 (Almoço)</strong>
              </div>
            </div>
            <p className="rv-sucesso-msg">
              Apresente o código de confirmação ao chegar. Até logo!
            </p>
            <button className="rv-btn-confirmar" onClick={onFechar}>
              Fechar
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ReservaModal;
