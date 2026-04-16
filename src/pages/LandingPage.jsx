import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cardapioService } from "../services/cardapioService";
import { authService } from "../services/authService";
import { formatCurrency } from "../utils/formatters";
import logoSolDoCerrado from "../assets/logo-navbar.png";
import "./LandingPage.css";
import { useCarrinho } from "../contexts/CarrinhoContext";
import ReservaModal from "../components/ReservaModal";
import SkeletonImage from "../components/SkeletonImage";
import logoFooter from "../assets/logo-footer.png";

// ========== CARROSSEL ==========
const imagensCarrossel = [
  "/img/restaurante-1.jpg",
  "/img/restaurante-2.jpg",
  "/img/restaurante-3.jpg",
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();

  const [itensDestaque, setItensDestaque] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mostrarReservaModal, setMostrarReservaModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loginSucesso, setLoginSucesso] = useState("");
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setImagemAtual((anterior) => (anterior + 1) % imagensCarrossel.length);
    }, 3000);
    return () => clearInterval(intervalo);
  }, []);

  // Efeito de scroll no header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [usuarioLogado, setUsuarioLogado] = useState(() =>
    authService.getUsuarioLogado(),
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginErro, setLoginErro] = useState("");
  const [loginCarregando, setLoginCarregando] = useState(false);

  const [cadNome, setCadNome] = useState("");
  const [cadEmail, setCadEmail] = useState("");
  const [cadSenha, setCadSenha] = useState("");
  const [cadConfirmar, setCadConfirmar] = useState("");
  const [cadErro, setCadErro] = useState("");
  const [cadSucesso, setCadSucesso] = useState("");
  const [cadCarregando, setCadCarregando] = useState(false);

  const [sugestoesChef, setSugestoesChef] = useState([]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÍCONE 1: SOL ESTILIZADO (Período Almoço)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const IconeSol = () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0px 4px 12px rgba(212, 175, 55, 0.3))" }}
    >
      {/* Círculo central */}
      <circle
        cx="32"
        cy="32"
        r="12"
        stroke="#D4AF37"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Raios externos (8 linhas) */}
      <line
        x1="32"
        y1="4"
        x2="32"
        y2="14"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="50"
        x2="32"
        y2="60"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="32"
        x2="14"
        y2="32"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="32"
        x2="60"
        y2="32"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="11.7"
        y1="11.7"
        x2="18.8"
        y2="18.8"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="45.2"
        y1="45.2"
        x2="52.3"
        y2="52.3"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="52.3"
        y1="11.7"
        x2="45.2"
        y2="18.8"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="18.8"
        y1="45.2"
        x2="11.7"
        y2="52.3"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÍCONE 2: CALENDÁRIO MINIMALISTA (24h Antecedência)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const IconeCalendario = () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0px 4px 12px rgba(212, 175, 55, 0.3))" }}
    >
      {/* Retângulo principal */}
      <rect
        x="8"
        y="14"
        width="48"
        height="44"
        rx="4"
        stroke="#D4AF37"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Linha superior (header do calendário) */}
      <line x1="8" y1="24" x2="56" y2="24" stroke="#D4AF37" strokeWidth="2.5" />
      {/* Ganchos superiores */}
      <line
        x1="18"
        y1="8"
        x2="18"
        y2="18"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="8"
        x2="46"
        y2="18"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Pontinhos representando dias */}
      <circle cx="18" cy="34" r="2" fill="#D4AF37" />
      <circle cx="28" cy="34" r="2" fill="#D4AF37" />
      <circle cx="38" cy="34" r="2" fill="#D4AF37" />
      <circle cx="48" cy="34" r="2" fill="#D4AF37" />
      <circle cx="18" cy="44" r="2" fill="#D4AF37" />
      <circle cx="28" cy="44" r="2" fill="#D4AF37" />
      {/* Marcador especial (dia selecionado) */}
      <circle
        cx="38"
        cy="44"
        r="4"
        stroke="#D4AF37"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÍCONE 3: MESA + CADEIRAS (Escolha de Pessoas)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const IconeMesa = () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0px 4px 12px rgba(212, 175, 55, 0.3))" }}
    >
      {/* Mesa (retângulo arredondado horizontal) */}
      <rect
        x="12"
        y="26"
        width="40"
        height="12"
        rx="3"
        stroke="#D4AF37"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Pernas da mesa */}
      <line
        x1="16"
        y1="38"
        x2="16"
        y2="48"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="38"
        x2="48"
        y2="48"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Cadeira esquerda (encosto + assento) */}
      <line
        x1="8"
        y1="14"
        x2="8"
        y2="26"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="22"
        width="8"
        height="6"
        rx="2"
        stroke="#D4AF37"
        strokeWidth="2"
        fill="none"
      />

      {/* Cadeira direita (encosto + assento) */}
      <line
        x1="56"
        y1="14"
        x2="56"
        y2="26"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="52"
        y="22"
        width="8"
        height="6"
        rx="2"
        stroke="#D4AF37"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  useEffect(() => {
    carregarSugestoesChef();
  }, []);

  const carregarSugestoesChef = async () => {
    try {
      const resposta = await fetch(
        "http://localhost:5203/api/SugestaoDoChef/hoje",
      );

      if (resposta.ok) {
        const dados = await resposta.json();
        const pratos = await Promise.all(
          dados.map((s) => cardapioService.buscarPorId(s.itemCardapioId)),
        );
        setSugestoesChef(pratos.filter(Boolean));
      } else {
        const todos = await cardapioService.listarTodos();
        const embaralhados = todos.sort(() => Math.random() - 0.5);
        setSugestoesChef(embaralhados.slice(0, 2));
      }
    } catch {
      // Silencia o erro
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
      console.error("Erro ao carregar destaques:", error);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErro("");
    setLoginSucesso("");
    setLoginCarregando(true);

    try {
      const dados = await authService.login(loginEmail, loginSenha);
      const usuario = dados.usuario;
      setUsuarioLogado(usuario);

      if (usuario.perfil === "Administrador") {
        navigate("/dashboard");
      } else {
        setShowLoginModal(false);
        setLoginSucesso(`Bem-vindo, ${usuario.userName}! 🎉`);
        setLoginEmail("");
        setLoginSenha("");
        setTimeout(() => setLoginSucesso(""), 4000);
      }
    } catch (error) {
      setLoginErro(error.message || "Email ou senha incorretos.");
    } finally {
      setLoginCarregando(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUsuarioLogado(null);
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setCadErro("");
    setCadSucesso("");

    if (cadSenha !== cadConfirmar) {
      setCadErro("As senhas não coincidem.");
      return;
    }

    if (cadSenha.length < 6) {
      setCadErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCadCarregando(true);

    try {
      const resposta = await fetch(
        "http://localhost:5203/api/usuario/cadastrar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: cadNome,
            email: cadEmail,
            passwordHasher: cadSenha,
          }),
        },
      );

      if (!resposta.ok) {
        const msg = await resposta.text();
        throw new Error(msg);
      }

      setCadSucesso("Conta criada! Faça login para continuar.");
      setCadNome("");
      setCadEmail("");
      setCadSenha("");
      setCadConfirmar("");
      setTimeout(() => setIsLogin(true), 1500);
    } catch (error) {
      setCadErro(error.message || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setCadCarregando(false);
    }
  };

  return (
    <div className="landing-page">
      {loginSucesso && <div className="toast-sucesso">{loginSucesso}</div>}

      {/* HEADER */}
      <motion.header
        className={`landing-header ${scrolled ? "scrolled" : ""}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="logo-container">
            <img
              src={logoSolDoCerrado}
              alt="Sol do Cerrado"
              className="logo-navbar"
            />
          </div>

          <nav className="main-nav">
            <button onClick={() => scrollToSection("cardapio")}>
              Cardápio
            </button>
            <button onClick={() => scrollToSection("sobre")}>Sobre</button>
            <button onClick={() => scrollToSection("reservas")}>
              Reservas
            </button>
            <button onClick={() => scrollToSection("contato")}>Contato</button>
          </nav>

          {/* ── ÁREA DE AUTENTICAÇÃO DO HEADER ── */}
          {usuarioLogado ? (
            <div className="usuario-logado-area">
              <div
                className="usuario-card"
                style={{ cursor: "pointer" }}
                title="Ir para minha área"
                onClick={() => {
                  if (usuarioLogado.perfil === "Administrador") {
                    navigate("/dashboard");
                  } else {
                    navigate("/minha-conta");
                  }
                }}
              >
                <div className="usuario-avatar">
                  {usuarioLogado.userName.charAt(0).toUpperCase()}
                </div>
                <div className="usuario-info">
                  <span className="usuario-saudacao">
                    Olá, <strong>{usuarioLogado.userName.split(" ")[0]}</strong>
                  </span>
                  <span
                    className={`usuario-perfil-tag ${
                      usuarioLogado.perfil === "Administrador"
                        ? "tag-admin"
                        : "tag-cliente"
                    }`}
                  >
                    {usuarioLogado.perfil === "Administrador"
                      ? "⚙️ Gerente/Admin"
                      : "🍽️ Cliente"}
                  </span>
                </div>
              </div>
              <button className="btn-sair" onClick={handleLogout}>
                Sair
              </button>
            </div>
          ) : (
            <button
              className="btn-entrar"
              onClick={() => setShowLoginModal(true)}
            >
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${imagensCarrossel[imagemAtual]})` }}
      >
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>Sabores Autênticos do Cerrado</h1>
          <p className="hero-subtitle">
            Uma experiência gastronômica única que celebra os ingredientes e
            tradições do Tocantins
          </p>
          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => scrollToSection("cardapio")}
            >
              Ver Cardápio Completo
            </button>
            <button
              className="btn-secondary"
              onClick={() => scrollToSection("reservas")}
            >
              Reservar Mesa
            </button>
          </div>
        </motion.div>

        <div className="hero-decoracao">
          <motion.div
            className="circulo-dourado"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
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
          <p>
            40 pratos exclusivos que celebram a culinária regional modernizada
          </p>
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
              <div className="item-destaque-imagem-wrapper">
                <SkeletonImage
                  src={item.imagemUrl || "/img/prato-padrao.webp"}
                  alt={item.nome}
                  className="item-destaque-imagem"
                  onError={(e) => {
                    e.target.src = "/img/prato-padrao.webp";
                  }}
                />
              </div>

              <div className="item-destaque-corpo">
                <div
                  className={`item-badge ${
                    item.periodo === "Jantar" ? "badge-jantar" : ""
                  }`}
                >
                  {item.periodo === "Jantar" ? "🌙 Jantar" : "☀️ Almoço"}
                </div>
                <h3>{item.nome}</h3>
                <p>{item.descricao}</p>
                <span className="item-preco">{formatCurrency(item.preco)}</span>

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

        <button className="btn-ver-mais" onClick={() => navigate("/cardapio")}>
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
            <p>
              Seleção especial com{" "}
              <strong style={{ color: "#D4AF37" }}>20% de desconto</strong> —
              válido hoje
            </p>

            <div className="sugestao-cards-grid">
              {sugestoesChef.map((prato, index) => (
                <div key={prato.id ?? index} className="sugestao-mini-card">
                  <div className="sugestao-mini-imagem">
                    <img
                      src={prato.imagemUrl || "/img/prato-padrao.webp"}
                      alt={prato.nome}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/prato-padrao.webp";
                      }}
                    />
                  </div>
                  <div className="sugestao-mini-corpo">
                    <span className="sugestao-mini-periodo">
                      {prato.periodo === "Almoco" ? "☀️ Almoço" : "🌙 Jantar"}
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
                    <button
                      className="btn-adicionar-carrinho"
                      onClick={() => adicionarItem(prato, true)}
                    >
                      Adicionar com Desconto
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn-primary"
              onClick={() => navigate("/sugestao-chef")}
              style={{ marginTop: "2rem" }}
            >
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
              O <strong>Sol do Cerrado</strong> nasceu da paixão por valorizar
              os ingredientes e sabores únicos do Tocantins. Nossa cozinha
              celebra a riqueza do cerrado brasileiro, combinando técnicas
              contemporâneas com tradições ancestrais.
            </p>
            <p>
              Cada prato é uma homenagem à biodiversidade do nosso bioma, criado
              com ingredientes locais, frescos e sustentáveis.
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
      <section className="reserva-section">
        {/* Imagem de fundo com overlay */}
        <div className="reserva-bg-overlay"></div>

        <div className="reserva-container">
          {/* Título e subtítulo */}
          <div className="reserva-header">
            <h2>Reserve sua Mesa</h2>
            <p className="reserva-subtitle">
              Garanta seu lugar no Sol do Cerrado e desfrute de uma experiência
              gastronômica memorável
            </p>
          </div>

          {/* Cards informativos (3 colunas com glassmorphism) */}
          <div className="reserva-info-grid">
            {/* Card 1: Sol (Período) */}
            <div className="reserva-info-card">
              <div className="reserva-icon-wrapper">
                <IconeSol />
              </div>
              <h4>Almoço Exclusivo</h4>
              <p>
                Reservas disponíveis apenas para o período do almoço (11h às
                14h)
              </p>
            </div>

            {/* Card 2: Calendário (Antecedência) */}
            <div className="reserva-info-card">
              <div className="reserva-icon-wrapper">
                <IconeCalendario />
              </div>
              <h4>Antecedência de 24h</h4>
              <p>
                Agende com pelo menos um dia de antecedência para garantir sua
                mesa
              </p>
            </div>

            {/* Card 3: Mesa (Pessoas) */}
            <div className="reserva-info-card">
              <div className="reserva-icon-wrapper">
                <IconeMesa />
              </div>
              <h4>Para Você e Seus Convidados</h4>
              <p>
                Escolha o número de pessoas e organizamos tudo para sua
                experiência perfeita
              </p>
            </div>
          </div>

          {/* Botão de ação */}
          <div className="reserva-cta">
            <button
              className="btn-primary btn-reserva-destaque"
              onClick={() => setShowReservaModal(true)}
            >
              Fazer Reserva Agora
            </button>
          </div>
        </div>
      </section>

      {/* FORMAS DE ATENDIMENTO */}
      <section className="atendimento-section">
        <div className="section-header">
          <h2>Como Você Prefere?</h2>
          <p className="section-subtitle">
            Escolha a melhor forma de aproveitar nossos pratos
          </p>
        </div>

        <div className="atendimento-grid">
          {/* PRESENCIAL */}
          <motion.div
            className="atendimento-card"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="atendimento-imagem"
              style={{ backgroundImage: "url(/img/presencial.jpg)" }}
            >
              <div className="atendimento-overlay"></div>
              <div className="atendimento-conteudo">
                <svg
                  className="atendimento-icone"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <h3>Presencial</h3>
                <p>
                  Venha nos visitar e desfrute de uma experiência completa em
                  nosso ambiente aconchegante
                </p>
              </div>
            </div>
          </motion.div>

          {/* DELIVERY PRÓPRIO */}
          <motion.div
            className="atendimento-card"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div
              className="atendimento-imagem"
              style={{ backgroundImage: "url(/img/delivery-proprio.jpg)" }}
            >
              <div className="atendimento-overlay"></div>
              <div className="atendimento-conteudo">
                <svg
                  className="atendimento-icone"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <h3>Delivery Próprio</h3>
                <p>Entrega rápida e cuidadosa com taxa fixa em toda a região</p>
              </div>
            </div>
          </motion.div>

          {/* APPS DE DELIVERY */}
          <motion.div
            className="atendimento-card"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="atendimento-imagem"
              style={{ backgroundImage: "url(/img/apps-delivery.jpg)" }}
            >
              <div className="atendimento-overlay"></div>
              <div className="atendimento-conteudo">
                <svg
                  className="atendimento-icone"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <h3>Apps de Delivery</h3>
                <p>Peça também pelos principais aplicativos de entrega</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="contato-section">
        <div className="section-header">
          <h2>Fale Conosco</h2>
          <p className="section-subtitle">
            Estamos prontos para recebê-lo com o melhor da gastronomia do
            Cerrado
          </p>
        </div>

        <div className="contato-grid">
          {/* ENDEREÇO */}
          <div className="contato-item">
            <svg
              className="contato-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div className="contato-texto">
              <strong>Endereço</strong>
              <p>Quadra 104 Sul, Av. LO-17, Lote 12</p>
              <p>Plano Diretor Sul, Palmas-TO</p>
              <p className="contato-cep">CEP: 77020-010</p>
            </div>
          </div>

          {/* TELEFONE */}
          <div className="contato-item">
            <svg
              className="contato-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div className="contato-texto">
              <strong>Telefone & WhatsApp</strong>
              <p>(63) 3218-4500</p>
              <p className="contato-whatsapp">
                <a
                  href="https://wa.me/556332184500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar mensagem
                </a>
              </p>
            </div>
          </div>

          {/* E-MAIL */}
          <div className="contato-item">
            <svg
              className="contato-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <div className="contato-texto">
              <strong>E-mail</strong>
              <p>contato@soldocerrado.com.br</p>
              <p>reservas@soldocerrado.com.br</p>
            </div>
          </div>

          {/* HORÁRIO DE FUNCIONAMENTO */}
          <div className="contato-item">
            <svg
              className="contato-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="contato-texto">
              <strong>Horário de Funcionamento</strong>
              <p>Almoço: 11h às 15h</p>
              <p>Jantar: 19h às 23h</p>
              <p className="contato-dias">Segunda a Sábado</p>
            </div>
          </div>
        </div>

        {/* REDES SOCIAIS */}
        <div className="redes-sociais">
          <h3>Siga-nos nas redes sociais</h3>
          <div className="redes-links">
            <a
              href="https://instagram.com/soldocerrado"
              target="_blank"
              rel="noopener noreferrer"
              className="rede-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>

            <a
              href="https://wa.me/556332184500"
              target="_blank"
              rel="noopener noreferrer"
              className="rede-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            <a
              href="https://facebook.com/soldocerrado"
              target="_blank"
              rel="noopener noreferrer"
              className="rede-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          {/* COLUNA 1: Logo + Tagline */}
          <div className="footer-coluna footer-logo-col">
            <img
              src={logoFooter}
              alt="Sol do Cerrado"
              className="logo-footer"
            />
            <p className="footer-tagline">Gastronomia Regional Modernizada</p>
            <p className="footer-descricao">
              Celebrando os sabores autênticos do Cerrado com técnicas
              contemporâneas
            </p>
          </div>

          {/* COLUNA 2: Links Rápidos */}
          <div className="footer-coluna footer-links-col">
            <h3 className="footer-titulo">Links Rápidos</h3>
            <ul className="footer-links">
              <li>
                <button onClick={() => scrollToSection("cardapio")}>
                  Cardápio Completo
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("sobre")}>
                  Nossa História
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("reservas")}>
                  Reservas
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("contato")}>
                  Fale Conosco
                </button>
              </li>
              <li>
                <button onClick={() => setShowLoginModal(true)}>
                  Área do Cliente
                </button>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: Contato + Redes Sociais */}
          <div className="footer-coluna footer-contato-col">
            <h3 className="footer-titulo">Contato</h3>
            <ul className="footer-info">
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Quadra 104 Sul, Palmas-TO</span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>(63) 3218-4500</span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>contato@soldocerrado.com.br</span>
              </li>
            </ul>

            <div className="footer-redes">
              <a
                href="https://instagram.com/soldocerrado"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/556332184500"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/soldocerrado"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="footer-bottom">
          <p>&copy; 2026 Sol do Cerrado. Todos os direitos reservados.</p>
          <p className="footer-creditos">
            Feito com <span className="footer-coracao">❤️</span> no Tocantins
          </p>
        </div>
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
            <button
              className="modal-close"
              onClick={() => setShowLoginModal(false)}
            >
              ×
            </button>

            <div className="modal-tabs">
              <button
                className={isLogin ? "active" : ""}
                onClick={() => {
                  setIsLogin(true);
                  setLoginErro("");
                }}
              >
                Entrar
              </button>
              <button
                className={!isLogin ? "active" : ""}
                onClick={() => {
                  setIsLogin(false);
                  setCadErro("");
                  setCadSucesso("");
                }}
              >
                Cadastrar
              </button>
            </div>

            {isLogin ? (
              // ======= FORMULÁRIO DE LOGIN =======
              <form className="auth-form" onSubmit={handleLogin}>
                <h3>Bem-vindo de volta!</h3>

                {loginErro && (
                  <p
                    style={{
                      color: "#e53e3e",
                      background: "#fff5f5",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
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

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loginCarregando}
                >
                  {loginCarregando ? "Entrando..." : "Entrar"}
                </button>

                {/* Dica para teste */}
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#888",
                    textAlign: "center",
                  }}
                >
                  Admin: admin@restaurante.com / admin123
                </p>
              </form>
            ) : (
              // ======= FORMULÁRIO DE CADASTRO =======
              <form className="auth-form" onSubmit={handleCadastro}>
                <h3>Criar sua conta</h3>

                {cadErro && (
                  <p
                    style={{
                      color: "#e53e3e",
                      background: "#fff5f5",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
                    ⚠️ {cadErro}
                  </p>
                )}
                {cadSucesso && (
                  <p
                    style={{
                      color: "#2f855a",
                      background: "#f0fff4",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
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

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={cadCarregando}
                >
                  {cadCarregando ? "Cadastrando..." : "Cadastrar"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      <ReservaModal
        visivel={showReservaModal}
        onFechar={() => setShowReservaModal(false)}
      />
    </div>
  );
};

export default LandingPage;
