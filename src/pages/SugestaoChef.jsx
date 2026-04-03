import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api';
import { cardapioService } from '../services/cardapioService';
import { formatCurrency } from '../utils/formatters';
import './SugestaoChef.css';

const SugestaoChef = () => {
  const navigate = useNavigate();
  const [sugestoes, setSugestoes] = useState([]);   // [{prato, periodo}]
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarSugestoes();
  }, []);

  const carregarSugestoes = async () => {
    try {
      setLoading(true);
      setErro(null);

      // 1️⃣ Busca as sugestões do dia (retorna array com itemCardapioId)
      const resposta = await apiFetch('/SugestaoDoChef/hoje');

      // Se não houver sugestões hoje, o backend retorna 404
      if (resposta.status === 404) {
        setSugestoes([]);
        return;
      }

      if (!resposta.ok) throw new Error('Erro ao buscar sugestões.');

      const dadosSugestoes = await resposta.json();

      // 2️⃣ Para cada sugestão, busca os dados completos do prato
      const pratosCompletos = await Promise.all(
        dadosSugestoes.map(async (sugestao) => {
          const prato = await cardapioService.buscarPorId(sugestao.itemCardapioId);
          return {
            sugestaoId: sugestao.id,
            periodo: sugestao.periodo,
            prato,
          };
        })
      );

      setSugestoes(pratosCompletos);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      setErro('Não foi possível carregar as sugestões de hoje.');
    } finally {
      setLoading(false);
    }
  };

  // Calcula o preço com 20% de desconto
  const calcularDesconto = (preco) => preco * 0.8;

  // ── LOADING ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sc-pagina">
        <div className="sc-loading">
          <div className="sc-loading-spinner">☀️</div>
          <p>Consultando o chef...</p>
        </div>
      </div>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="sc-pagina">

      {/* BOTÃO VOLTAR */}
      <button className="sc-btn-voltar" onClick={() => navigate('/')}>
        ← Voltar para o Início
      </button>

      {/* HEADER */}
      <motion.div
        className="sc-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sc-header-badge">⭐ Sugestão do Chef</div>
        <h1>Pratos Especiais de Hoje</h1>
        <p>Seleção exclusiva com <strong>20% de desconto</strong> — válido apenas hoje</p>
      </motion.div>

      {/* ERRO */}
      {erro && (
        <div className="sc-erro">
          <span>⚠️</span> {erro}
        </div>
      )}

      {/* SEM SUGESTÕES */}
      {!erro && sugestoes.length === 0 && (
        <motion.div
          className="sc-vazio"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="sc-vazio-icone">🍽️</div>
          <h2>Nenhuma sugestão para hoje</h2>
          <p>O chef ainda não definiu os pratos em destaque. Volte mais tarde!</p>
          <button className="sc-btn-cardapio" onClick={() => navigate('/cardapio')}>
            Ver Cardápio Completo
          </button>
        </motion.div>
      )}

      {/* CARDS DAS SUGESTÕES */}
      {sugestoes.length > 0 && (
        <div className="sc-grid">
          {sugestoes.map(({ sugestaoId, periodo, prato }, index) => (
            <motion.div
              key={sugestaoId}
              className={`sc-card ${periodo === 'Almoco' ? 'sc-card-almoco' : 'sc-card-jantar'}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              {/* Imagem */}
              <div className="sc-card-imagem-wrapper">
                <img
                  src={prato.imagemUrl || '/img/prato-padrao.jpg'}
                  alt={prato.nome}
                  className="sc-card-imagem"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/prato-padrao.jpg';
                  }}
                />
                {/* Badge de período sobre a imagem */}
                <div className="sc-periodo-badge">
                  {periodo === 'Almoco' ? '☀️ Almoço' : '🌙 Jantar'}
                </div>
                {/* Badge de desconto sobre a imagem */}
                <div className="sc-desconto-badge">-20%</div>
              </div>

              {/* Corpo do card */}
              <div className="sc-card-corpo">
                <h2>{prato.nome}</h2>
                <p className="sc-descricao">{prato.descricao}</p>

                {/* Preços */}
                <div className="sc-precos">
                  <span className="sc-preco-original">
                    De: {formatCurrency(prato.preco)}
                  </span>
                  <div className="sc-preco-final">
                    <span className="sc-preco-label">Por apenas</span>
                    <span className="sc-preco-valor">
                      {formatCurrency(calcularDesconto(prato.preco))}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* INFORMAÇÕES SOBRE A PROMOÇÃO */}
      {sugestoes.length > 0 && (
        <motion.div
          className="sc-info-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icone: '🎯', titulo: 'Seleção Diária', texto: 'Nosso chef escolhe 1 prato de almoço e 1 de jantar todo dia' },
            { icone: '💰', titulo: '20% de Desconto', texto: 'Aplicado automaticamente no pedido' },
            { icone: '⏰', titulo: 'Só Hoje', texto: 'A promoção muda à meia-noite' },
            { icone: '🍽️', titulo: 'Todos os Canais', texto: 'Presencial, delivery próprio e apps' },
          ].map((info) => (
            <div key={info.titulo} className="sc-info-card">
              <div className="sc-info-icone">{info.icone}</div>
              <h4>{info.titulo}</h4>
              <p>{info.texto}</p>
            </div>
          ))}
        </motion.div>
      )}

    </div>
  );
};

export default SugestaoChef;