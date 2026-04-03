import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cardapioService } from '../services/cardapioService';
import { formatCurrency } from '../utils/formatters';
import logoSolDoCerrado from '../assets/logo-sol-cerrado.png';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [itensDestaque, setItensDestaque] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    carregarItensDestaque();
  }, []);

  const carregarItensDestaque = async () => {
    try {
      const todosItens = await cardapioService.listarTodos();
      // Pegar 6 itens aleatórios
      const embaralhados = todosItens.sort(() => Math.random() - 0.5);
      setItensDestaque(embaralhados.slice(0, 6));
    } catch (error) {
      console.error('Erro ao carregar destaques:', error);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* HEADER */}
      <motion.header
        className="landing-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="logo-container">
            <img src={logoSolDoCerrado} alt="Sol do Cerrado" className="logo" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="50%" stopColor="#C97458" />
                    <stop offset="100%" stopColor="#6B4E3D" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="25" fill="url(#logoGradient)" />
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  const x1 = 50 + Math.cos(angle) * 30;
                  const y1 = 50 + Math.sin(angle) * 30;
                  const x2 = 50 + Math.cos(angle) * 42;
                  const y2 = 50 + Math.sin(angle) * 42;
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="url(#logoGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="logo-text">
              <h2>Sol do Cerrado</h2>
              <p>Gastronomia Regional</p>
            </div>
          </div>

          <nav className="main-nav">
            <button onClick={() => scrollToSection('cardapio')}>Cardápio</button>
            <button onClick={() => scrollToSection('sobre')}>Sobre</button>
            <button onClick={() => scrollToSection('reservas')}>Reservas</button>
            <button onClick={() => scrollToSection('contato')}>Contato</button>
          </nav>

          <button className="btn-entrar" onClick={() => setShowLoginModal(true)}>
            Entrar / Cadastrar
          </button>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>Sabores Autênticos do Cerrado</h1>
          <p className="hero-subtitle">
            Uma experiência gastronômica única que celebra os ingredientes e tradições do Tocantins
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => scrollToSection('cardapio')}>
              Ver Cardápio Completo
            </button>
            <button className="btn-secondary" onClick={() => scrollToSection('reservas')}>
              Reservar Mesa
            </button>
          </div>
        </motion.div>

        <div className="hero-decoracao">
          <motion.div
            className="circulo-dourado"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </section>

      {/* CARDÁPIO DESTAQUE */}
      <section id="cardapio" className="cardapio-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2>Destaques do Cardápio</h2>
          <p>40 pratos exclusivos que celebram a culinária regional modernizada</p>
        </motion.div>

        <div className="itens-destaque">
          {itensDestaque.map((item, index) => (
            <motion.div
              key={item.id}
              className="item-destaque-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="item-badge">
                {item.periodo === 'Almoco' ? '☀️ Almoço' : '🌙 Jantar'}
              </div>
              <h3>{item.nome}</h3>
              <p>{item.descricao}</p>
              <div className="item-preco">{formatCurrency(item.preco)}</div>
            </motion.div>
          ))}
        </div>

        <button className="btn-ver-mais" onClick={() => navigate('/cardapio')}>
          Ver Cardápio Completo →
        </button>
      </section>

      {/* SUGESTÃO DO CHEFE */}
      <section className="sugestao-section">
        <motion.div
          className="sugestao-content"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="sugestao-badge">
            <span className="estrela">⭐</span>
            <span>Sugestão do Chefe</span>
          </div>
          <h2>Pratos Especiais com 20% de Desconto</h2>
          <p>Todos os dias, selecionamos um prato de almoço e um de jantar para receber desconto exclusivo</p>
          <button className="btn-primary" onClick={() => navigate('/sugestao-chef')}>
            Ver Sugestões de Hoje
          </button>
        </motion.div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="sobre-section">
        <div className="sobre-grid">
          <motion.div
            className="sobre-texto"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2>Nossa História</h2>
            <p>
              O <strong>Sol do Cerrado</strong> nasceu da paixão por valorizar os ingredientes e sabores únicos do Tocantins. 
              Nossa cozinha celebra a riqueza do cerrado brasileiro, combinando técnicas contemporâneas com tradições ancestrais.
            </p>
            <p>
              Cada prato é uma homenagem à biodiversidade do nosso bioma, criado com ingredientes locais, frescos e sustentáveis.
            </p>
          </motion.div>

          <motion.div
            className="sobre-stats"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="stat-card">
              <div className="stat-numero">40</div>
              <div className="stat-label">Pratos no Cardápio</div>
            </div>
            <div className="stat-card">
              <div className="stat-numero">100%</div>
              <div className="stat-label">Ingredientes Regionais</div>
            </div>
            <div className="stat-card">
              <div className="stat-numero">3</div>
              <div className="stat-label">Formas de Atendimento</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RESERVAS */}
      <section id="reservas" className="reservas-section">
        <motion.div
          className="reservas-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2>Reserve sua Mesa</h2>
          <p className="reservas-subtitle">Experiência exclusiva no jantar - Reserve com 1 dia de antecedência</p>
          
          <div className="reservas-info">
            <div className="info-item">
              <span className="info-icon">🌙</span>
              <div>
                <strong>Jantar</strong>
                <p>19h - 22h</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📅</span>
              <div>
                <strong>Antecedência</strong>
                <p>Mínimo 24h</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🪑</span>
              <div>
                <strong>Mesas</strong>
                <p>2 a 8 pessoas</p>
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={() => {
            setShowLoginModal(true);
            setIsLogin(false);
          }}>
            Fazer Reserva
          </button>
        </motion.div>
      </section>

      {/* FORMAS DE ATENDIMENTO */}
      <section className="atendimento-section">
        <h2>Como Você Prefere?</h2>
        <p className="section-subtitle">Escolha a melhor forma de aproveitar nossos pratos</p>

        <div className="atendimento-grid">
          <motion.div
            className="atendimento-card"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="atendimento-icon">🏪</div>
            <h3>Presencial</h3>
            <p>Venha nos visitar e desfrute de uma experiência completa em nosso ambiente aconchegante</p>
          </motion.div>

          <motion.div
            className="atendimento-card"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="atendimento-icon">🛵</div>
            <h3>Delivery Próprio</h3>
            <p>Entrega rápida e cuidadosa com taxa fixa em toda a região</p>
          </motion.div>

          <motion.div
            className="atendimento-card"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="atendimento-icon">📱</div>
            <h3>Apps de Delivery</h3>
            <p>Peça também pelos principais aplicativos de entrega</p>
          </motion.div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="contato-section">
        <h2>Fale Conosco</h2>
        <div className="contato-grid">
          <div className="contato-item">
            <span className="contato-icon">📍</span>
            <div>
              <strong>Endereço</strong>
              <p>Palmas, Tocantins</p>
            </div>
          </div>
          <div className="contato-item">
            <span className="contato-icon">📞</span>
            <div>
              <strong>Telefone</strong>
              <p>(63) 99999-9999</p>
            </div>
          </div>
          <div className="contato-item">
            <span className="contato-icon">✉️</span>
            <div>
              <strong>E-mail</strong>
              <p>contato@soldocerrado.com.br</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>&copy; 2026 Sol do Cerrado - Gastronomia Regional Modernizada</p>
        <p>Palmas, Tocantins</p>
      </footer>

      {/* MODAL LOGIN/CADASTRO */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            
            <div className="modal-tabs">
              <button
                className={isLogin ? 'active' : ''}
                onClick={() => setIsLogin(true)}
              >
                Entrar
              </button>
              <button
                className={!isLogin ? 'active' : ''}
                onClick={() => setIsLogin(false)}
              >
                Cadastrar
              </button>
            </div>

            {isLogin ? (
              <form className="auth-form">
                <h3>Bem-vindo de volta!</h3>
                <input type="email" placeholder="E-mail" required />
                <input type="password" placeholder="Senha" required />
                <button type="submit" className="btn-primary">Entrar</button>
                <a href="#" className="link-esqueci">Esqueci minha senha</a>
              </form>
            ) : (
              <form className="auth-form">
                <h3>Criar sua conta</h3>
                <input type="text" placeholder="Nome completo" required />
                <input type="email" placeholder="E-mail" required />
                <input type="password" placeholder="Senha" required />
                <input type="password" placeholder="Confirmar senha" required />
                <button type="submit" className="btn-primary">Cadastrar</button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;