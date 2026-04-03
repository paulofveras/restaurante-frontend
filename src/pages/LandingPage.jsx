import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cardapioService } from '../services/cardapioService';
import { authService } from '../services/authService'; // ← NOVO
import { formatCurrency } from '../utils/formatters';
import logoSolDoCerrado from '../assets/logo-sol-cerrado.png';
import './LandingPage.css';
import { useCarrinho } from '../contexts/CarrinhoContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho(); // ← NOVO: Adicionado aqui
  const [itensDestaque, setItensDestaque] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loginSucesso, setLoginSucesso] = useState(''); // ← NOVO

  // Adicione estas duas linhas junto aos outros estados
  const [usuarioLogado, setUsuarioLogado] = useState(() => authService.getUsuarioLogado()); // ← NOVO

  // ← NOVO: estados do formulário de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginErro, setLoginErro] = useState('');
  const [loginCarregando, setLoginCarregando] = useState(false);

  // ← NOVO: estados do formulário de cadastro
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadConfirmar, setCadConfirmar] = useState('');
  const [cadErro, setCadErro] = useState('');
  const [cadSucesso, setCadSucesso] = useState('');
  const [cadCarregando, setCadCarregando] = useState(false);

  const [sugestoesChef, setSugestoesChef] = useState([]);

  useEffect(() => {
    carregarSugestoesChef();
  }, []);

  const carregarSugestoesChef = async () => {
    try {
      // Tenta buscar as sugestões do dia
      const resposta = await fetch('http://localhost:5203/api/SugestaoDoChef/hoje');
      if (resposta.ok) {
        const dados = await resposta.json();
        // Para cada sugestão, busca o prato completo
        const pratos = await Promise.all(
          dados.map(s => cardapioService.buscarPorId(s.itemCardapioId))
        );
        setSugestoesChef(pratos.filter(Boolean));
      } else {
        // 404 = sem sugestão hoje → mostra 2 pratos aleatórios como vitrine
        const todos = await cardapioService.listarTodos();
        const embaralhados = todos.sort(() => Math.random() - 0.5);
        setSugestoesChef(embaralhados.slice(0, 2));
      }
    } catch {
      // Silencia o erro — a seção simplesmente não aparece
    }
  };

  useEffect(() => {
    carregarItensDestaque();
  }, []);

  const carregarItensDestaque = async () => {
    try {
      const todosItens = await cardapioService.listarTodos();
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

  // ← NOVO: função de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErro('');
    setLoginSucesso('');
    setLoginCarregando(true);

    try {
      const dados = await authService.login(loginEmail, loginSenha);
      const usuario = dados.usuario;

      // Atualiza o estado do usuário logado na navbar imediatamente
      setUsuarioLogado(usuario);

      if (usuario.perfil === 'Administrador') {
        // Admin vai para o painel de gestão
        navigate('/dashboard');
      } else {
        // Cliente permanece na Landing Page
        // Fecha o modal e exibe mensagem de boas-vindas
        setShowLoginModal(false);
        setLoginSucesso(`Bem-vindo, ${usuario.userName}! 🎉`);

        // Limpa o formulário
        setLoginEmail('');
        setLoginSenha('');

        // Remove a mensagem após 4 segundos
        setTimeout(() => setLoginSucesso(''), 4000);
      }
    } catch (error) {
      setLoginErro(error.message || 'Email ou senha incorretos.');
    } finally {
      setLoginCarregando(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUsuarioLogado(null);
  };

  // ← NOVO: função de cadastro
  const handleCadastro = async (e) => {
    e.preventDefault();
    setCadErro('');
    setCadSucesso('');

    if (cadSenha !== cadConfirmar) {
      setCadErro('As senhas não coincidem.');
      return;
    }

    if (cadSenha.length < 6) {
      setCadErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCadCarregando(true);

    try {
      const resposta = await fetch('http://localhost:5203/api/usuario/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: cadNome,
          email: cadEmail,
          passwordHasher: cadSenha,
        }),
      });

      if (!resposta.ok) {
        const msg = await resposta.text();
        throw new Error(msg);
      }

      setCadSucesso('Conta criada! Faça login para continuar.');
      setCadNome(''); setCadEmail(''); setCadSenha(''); setCadConfirmar('');
      setTimeout(() => setIsLogin(true), 1500); // vai para aba de login
    } catch (error) {
      setCadErro(error.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setCadCarregando(false);
    }
  };



  return (
    <div className="landing-page">

      {/* Toast de boas-vindas para cliente recém-logado */}
      {loginSucesso && (
        <div className="toast-sucesso">
          {loginSucesso}
        </div>
      )}

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

          {/* ── ÁREA DE AUTENTICAÇÃO DO HEADER ── */}
          {usuarioLogado ? (
            <div className="usuario-logado-area">
              {/* Bolinha + nome → clica para ir ao dashboard */}
              <div className="usuario-card" onClick={() => navigate('/dashboard')}
                style={{ cursor: 'pointer' }} title="Ir para o dashboard">
                <div className="usuario-avatar">
                  {usuarioLogado.userName.charAt(0).toUpperCase()}
                </div>
                <div className="usuario-info">
                  <span className="usuario-saudacao">
                    Olá, <strong>{usuarioLogado.userName.split(' ')[0]}</strong>
                  </span>
                  <span className={`usuario-perfil-tag ${usuarioLogado.perfil === 'Administrador' ? 'tag-admin' : 'tag-cliente'}`}>
                    {usuarioLogado.perfil === 'Administrador' ? '⚙️ Gerente/Admin' : '🍽️ Cliente'}
                  </span>
                </div>
              </div>
              {/* Botão Sair — separado do card para não conflitar o clique */}
              <button className="btn-sair" onClick={handleLogout}>
                Sair
              </button>
            </div>
          ) : (
            <button className="btn-entrar" onClick={() => setShowLoginModal(true)}>
              Entrar / Cadastrar
            </button>
          )}
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
              transition={{ delay: 0.05, duration: 0.3 }}
            >
              {/* ── IMAGEM DO PRATO ── */}
              <div className="item-destaque-imagem-wrapper">
                <img
                  src={item.imagemUrl || '/img/prato-padrao.jpg'}
                  alt={item.nome}
                  className="item-destaque-imagem"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/prato-padrao.jpg';
                  }}
                />
              </div>

              {/* ── CONTEÚDO DO CARD ── */}
              <div className="item-destaque-corpo">
                <div className="item-badge">
                  {item.periodo === 'Almoco' ? '☀️ Almoço' : '🌙 Jantar'}
                </div>
                <h3>{item.nome}</h3>
                <p>{item.descricao}</p>
                <span className="item-preco">{formatCurrency(item.preco)}</span>
                
                {/* ← NOVO: Botão Adicionar ao Carrinho */}
                <button
                  className="btn-adicionar-carrinho"
                  onClick={() => adicionarItem(item, false)}
                >
                  + Adicionar
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="btn-ver-mais" onClick={() => navigate('/cardapio')}>
          Ver Cardápio Completo →
        </button>
      </section>

      {/* SUGESTÃO DO CHEF */}
      {sugestoesChef.length > 0 && (
        <section className="sugestao-section">
          <div className="sugestao-content">
            <div className="sugestao-badge">
              <span className="estrela">⭐</span>
              <span>Sugestão do Chef</span>
            </div>
            <h2>Pratos em Destaque</h2>
            <p>Seleção especial com <strong style={{ color: '#D4AF37' }}>20% de desconto</strong> — válido hoje</p>

            <div className="sugestao-cards-grid">
              {sugestoesChef.map((prato, index) => (
                <div key={prato.id ?? index} className="sugestao-mini-card">
                  <div className="sugestao-mini-imagem">
                    <img
                      src={prato.imagemUrl || '/img/prato-padrao.jpg'}
                      alt={prato.nome}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/img/prato-padrao.jpg'; }}
                    />
                  </div>
                  <div className="sugestao-mini-corpo">
                    <span className="sugestao-mini-periodo">
                      {prato.periodo === 'Almoco' ? '☀️ Almoço' : '🌙 Jantar'}
                    </span>
                    <h4>{prato.nome}</h4>
                    <div className="sugestao-mini-precos">
                      <span className="sugestao-preco-riscado">
                        {formatCurrency(prato.preco)}
                      </span>
                      <span className="sugestao-preco-final">
                        {formatCurrency(prato.preco * 0.8)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={() => navigate('/sugestao-chef')}
              style={{ marginTop: '2rem' }}>
              Ver Sugestão Completa ✨
            </button>
          </div>
        </section>
      )}

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
                onClick={() => { setIsLogin(true); setLoginErro(''); }}
              >
                Entrar
              </button>
              <button
                className={!isLogin ? 'active' : ''}
                onClick={() => { setIsLogin(false); setCadErro(''); setCadSucesso(''); }}
              >
                Cadastrar
              </button>
            </div>

            {isLogin ? (
              // ======= FORMULÁRIO DE LOGIN =======
              <form className="auth-form" onSubmit={handleLogin}>
                <h3>Bem-vindo de volta!</h3>

                {loginErro && (
                  <p style={{ color: '#e53e3e', background: '#fff5f5', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>
                    ⚠️ {loginErro}
                  </p>
                )}

                <input
                  type="email"
                  placeholder="E-mail"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Senha"
                  required
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  autoComplete="current-password"
                />

                <button type="submit" className="btn-primary" disabled={loginCarregando}>
                  {loginCarregando ? 'Entrando...' : 'Entrar'}
                </button>

                {/* Dica para teste */}
                <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>
                  Admin: admin@restaurante.com / admin123
                </p>
              </form>
            ) : (
              // ======= FORMULÁRIO DE CADASTRO =======
              <form className="auth-form" onSubmit={handleCadastro}>
                <h3>Criar sua conta</h3>

                {cadErro && (
                  <p style={{ color: '#e53e3e', background: '#fff5f5', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>
                    ⚠️ {cadErro}
                  </p>
                )}
                {cadSucesso && (
                  <p style={{ color: '#2f855a', background: '#f0fff4', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>
                    ✅ {cadSucesso}
                  </p>
                )}

                <input
                  type="text"
                  placeholder="Nome de usuário"
                  required
                  value={cadNome}
                  onChange={(e) => setCadNome(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  required
                  value={cadEmail}
                  onChange={(e) => setCadEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  required
                  value={cadSenha}
                  onChange={(e) => setCadSenha(e.target.value)}
                  autoComplete="current-password"
                />
                <input
                  type="password"
                  placeholder="Confirmar senha"
                  required
                  value={cadConfirmar}
                  onChange={(e) => setCadConfirmar(e.target.value)}
                  autoComplete="current-password"
                />

                <button type="submit" className="btn-primary" disabled={cadCarregando}>
                  {cadCarregando ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;