import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cardapioService } from '../services/cardapioService';
import { formatCurrency } from '../utils/formatters';
import './SugestaoChef.css';

const SugestaoChef = () => {
  const [itensAlmoco, setItensAlmoco] = useState([]);
  const [itensJantar, setItensJantar] = useState([]);
  const [sugestaoAlmoco, setSugestaoAlmoco] = useState(null);
  const [sugestaoJantar, setSugestaoJantar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarItens();
  }, []);

  const carregarItens = async () => {
    try {
      setLoading(true);
      const todosItens = await cardapioService.listarTodos();
      
      const almoco = todosItens.filter(item => item.periodo === 'Almoco');
      const jantar = todosItens.filter(item => item.periodo === 'Jantar');
      
      setItensAlmoco(almoco);
      setItensJantar(jantar);

      // Simular sugestões aleatórias (em produção, viria da API)
      if (almoco.length > 0) {
        const randomAlmoco = almoco[Math.floor(Math.random() * almoco.length)];
        setSugestaoAlmoco(randomAlmoco);
      }
      
      if (jantar.length > 0) {
        const randomJantar = jantar[Math.floor(Math.random() * jantar.length)];
        setSugestaoJantar(randomJantar);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularPrecoComDesconto = (preco) => {
    return preco * 0.8; // 20% de desconto
  };

  if (loading) {
    return (
      <div className="sugestao-chef">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#C97458" />
                  <stop offset="100%" stopColor="#6B4E3D" />
                </linearGradient>
              </defs>
              <circle
                cx="50" cy="50" r="40"
                stroke="url(#spinnerGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="200"
                strokeDashoffset="50"
              />
            </svg>
          </motion.div>
          <p>Carregando sugestões...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="sugestao-chef"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-badge">
          <span className="estrela-grande">⭐</span>
          <span>Sugestão do Chefe</span>
        </div>
        <h1>Pratos Especiais de Hoje</h1>
        <p>Seleção exclusiva com 20% de desconto - Válido apenas hoje</p>
      </motion.header>

      {/* Sugestões do Dia */}
      <div className="sugestoes-grid">
        {/* Sugestão de Almoço */}
        {sugestaoAlmoco && (
          <motion.div
            className="sugestao-card almoco"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="sugestao-header">
              <div className="periodo-badge">
                <span className="periodo-icon">☀️</span>
                <span>Almoço</span>
              </div>
              <div className="desconto-badge">
                <span>-20%</span>
              </div>
            </div>

            <div className="sugestao-content">
              <h2>{sugestaoAlmoco.nome}</h2>
              <p className="descricao">{sugestaoAlmoco.descricao}</p>

              <div className="preco-container">
                <div className="preco-original">
                  De: <span>{formatCurrency(sugestaoAlmoco.preco)}</span>
                </div>
                <div className="preco-desconto">
                  Por: <span>{formatCurrency(calcularPrecoComDesconto(sugestaoAlmoco.preco))}</span>
                </div>
              </div>

              <div className="economia">
                💰 Você economiza {formatCurrency(sugestaoAlmoco.preco * 0.2)}
              </div>

              <button className="btn-pedir">
                Fazer Pedido
              </button>
            </div>

            <div className="ribbon">
              <span>PROMOÇÃO</span>
            </div>
          </motion.div>
        )}

        {/* Sugestão de Jantar */}
        {sugestaoJantar && (
          <motion.div
            className="sugestao-card jantar"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="sugestao-header">
              <div className="periodo-badge">
                <span className="periodo-icon">🌙</span>
                <span>Jantar</span>
              </div>
              <div className="desconto-badge">
                <span>-20%</span>
              </div>
            </div>

            <div className="sugestao-content">
              <h2>{sugestaoJantar.nome}</h2>
              <p className="descricao">{sugestaoJantar.descricao}</p>

              <div className="preco-container">
                <div className="preco-original">
                  De: <span>{formatCurrency(sugestaoJantar.preco)}</span>
                </div>
                <div className="preco-desconto">
                  Por: <span>{formatCurrency(calcularPrecoComDesconto(sugestaoJantar.preco))}</span>
                </div>
              </div>

              <div className="economia">
                💰 Você economiza {formatCurrency(sugestaoJantar.preco * 0.2)}
              </div>

              <button className="btn-pedir">
                Fazer Pedido
              </button>
            </div>

            <div className="ribbon">
              <span>PROMOÇÃO</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Informações Importantes */}
      <motion.div
        className="info-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3>Como Funciona?</h3>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h4>Seleção Diária</h4>
            <p>Nosso chef seleciona 1 prato de almoço e 1 de jantar todos os dias</p>
          </div>

          <div className="info-card">
            <div className="info-icon">💰</div>
            <h4>20% de Desconto</h4>
            <p>Desconto automático aplicado no pedido do dia</p>
          </div>

          <div className="info-card">
            <div className="info-icon">⏰</div>
            <h4>Válido Hoje</h4>
            <p>A promoção é válida apenas no dia em que o prato está em destaque</p>
          </div>

          <div className="info-card">
            <div className="info-icon">🍽️</div>
            <h4>Todos os Pedidos</h4>
            <p>Válido para presencial, delivery próprio e apps</p>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="cta-section"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3>Aproveite Enquanto é Tempo!</h3>
        <p>Os pratos em destaque mudam todos os dias às 00h</p>
        <div className="cta-buttons">
          <button className="btn-primary" onClick={() => window.location.href = '/cardapio'}>
            Ver Cardápio Completo
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '/pedidos'}>
            Meus Pedidos
          </button>
        </div>
      </motion.div>

      {/* Histórico de Sugestões (Opcional - para admin) */}
      <motion.div
        className="historico-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h3>✨ Fique de Olho nas Próximas Sugestões</h3>
        <p className="historico-subtitle">
          Nosso chef está sempre criando experiências gastronômicas únicas. 
          Acompanhe diariamente para não perder nenhuma promoção!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SugestaoChef;