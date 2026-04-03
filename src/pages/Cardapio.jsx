import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cardapioService } from '../services/cardapioService';
import { formatCurrency } from '../utils/formatters';
import './Cardapio.css';

const Cardapio = () => {
  const [itens, setItens] = useState([]);
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [filtro, setFiltro] = useState(null); // null = todos, "Almoco", "Jantar"
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 12;

  useEffect(() => {
    carregarItens();
  }, []);

  useEffect(() => {
    filtrarItens();
  }, [filtro, itens]);

  const carregarItens = async () => {
    try {
      setLoading(true);
      const dados = await cardapioService.listarTodos();
      console.log('✅ Itens carregados:', dados.length);
      console.log('📊 Períodos:', {
        almoco: dados.filter(i => i.periodo === 'Almoco').length,
        jantar: dados.filter(i => i.periodo === 'Jantar').length
      });
      setItens(dados);
    } catch (error) {
      console.error('❌ Erro ao carregar cardápio:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarItens = () => {
    if (filtro === null) {
      setItensFiltrados(itens);
    } else {
      // ⭐ CORREÇÃO: Comparar com STRING, não número!
      const filtrados = itens.filter(item => item.periodo === filtro);
      console.log(`🔍 Filtro "${filtro}":`, filtrados.length, 'itens');
      setItensFiltrados(filtrados);
    }
    setPaginaAtual(1);
  };

  const handleFiltroClick = (novoFiltro) => {
    console.log('🎯 Filtro selecionado:', novoFiltro);
    setFiltro(novoFiltro);
  };

  // Paginação
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const itensAtuais = itensFiltrados.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);

  const mudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  if (loading) {
    return (
      <div className="cardapio">
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
          <p>Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="cardapio"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.header className="page-header" variants={itemVariants}>
        <h1>Cardápio</h1>
        <p>Sabores autênticos do Cerrado - {itensFiltrados.length} {itensFiltrados.length === 1 ? 'prato' : 'pratos'}</p>
      </motion.header>

      {/* Filtros */}
      <motion.div className="filters" variants={itemVariants}>
        <motion.button
          className={filtro === null ? 'active' : ''}
          onClick={() => handleFiltroClick(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="filtro-icon">🍽️</span>
          <span className="filtro-texto">
            Todos
            <span className="filtro-count">({itens.length})</span>
          </span>
        </motion.button>

        <motion.button
          className={filtro === 'Almoco' ? 'active' : ''}
          onClick={() => handleFiltroClick('Almoco')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="filtro-icon">☀️</span>
          <span className="filtro-texto">
            Almoço
            <span className="filtro-count">({itens.filter(i => i.periodo === 'Almoco').length})</span>
          </span>
        </motion.button>

        <motion.button
          className={filtro === 'Jantar' ? 'active' : ''}
          onClick={() => handleFiltroClick('Jantar')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="filtro-icon">🌙</span>
          <span className="filtro-texto">
            Jantar
            <span className="filtro-count">({itens.filter(i => i.periodo === 'Jantar').length})</span>
          </span>
        </motion.button>
      </motion.div>

      {/* Grid de Itens */}
      <AnimatePresence mode="wait">
        <motion.div
          className="itens-grid"
          key={filtro}
          variants={containerVariants}
        >
          {itensAtuais.map((item) => (
            <motion.div
              key={item.id}
              className="item-card"
              variants={itemVariants}
              whileHover={{ y: -6 }}
              layout
            >
              <div className="item-imagem-container">
                <img
                  src={item.imagemUrl || '/img/prato-padrao.jpg'}
                  alt={`Foto de ${item.nome}`}
                  className="item-imagem"
                  // Se a imagem der erro ou o link quebrar, ele mostra uma imagem padrão
                  onError={(e) => { e.target.src = '/img/prato-padrao.jpg'; }}
                />
              </div>
              <div className="item-content">
                <div className="item-header">
                  <h3>{item.nome}</h3>
                  <span className={`badge-periodo ${item.periodo.toLowerCase()}`}>
                    {item.periodo === 'Almoco' ? '☀️ Almoço' : '🌙 Jantar'}
                  </span>
                </div>

                <p className="item-descricao">{item.descricao}</p>

                <div className="item-footer">
                  <span className="item-preco">
                    {formatCurrency(item.preco)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <motion.div
          className="paginacao"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            className="btn-nav"
            onClick={() => mudarPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
          >
            ← Anterior
          </button>

          <div className="paginas-numeros">
            {[...Array(totalPaginas)].map((_, index) => {
              const numeroPagina = index + 1;
              return (
                <motion.button
                  key={numeroPagina}
                  className={`btn-numero ${paginaAtual === numeroPagina ? 'active' : ''}`}
                  onClick={() => mudarPagina(numeroPagina)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {numeroPagina}
                </motion.button>
              );
            })}
          </div>

          <button
            className="btn-nav"
            onClick={() => mudarPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
          >
            Próximo →
          </button>
        </motion.div>
      )}

      {/* Sem itens */}
      {itensFiltrados.length === 0 && !loading && (
        <motion.div
          className="sem-itens"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>😔 Nenhum prato encontrado nesta categoria.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Cardapio;