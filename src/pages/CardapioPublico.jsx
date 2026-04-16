// ═══════════════════════════════════════════════════════════════
// CARDÁPIO PÚBLICO - REVISTA GASTRONÔMICA
// ═══════════════════════════════════════════════════════════════
// Layout: Grid de cards premium com categorias elegantes
// Estilo: Sol do Cerrado - Alta gastronomia contemporânea

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCarrinho } from "../contexts/CarrinhoContext";
import { cardapioService } from "../services/cardapioService";
import SkeletonImage from "../components/SkeletonImage";
import logoNavbar from "../assets/logo-navbar.png";
import "./CardapioPublico.css";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORIAS GASTRONÔMICAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORIAS_ALMOCO = [
  { id: "despertar", nome: "Para Despertar", pratos: [1, 5, 10, 16] },
  { id: "aguas", nome: "Das Águas Doces", pratos: [2, 13] },
  { id: "terra", nome: "Da Terra Fértil", pratos: [4, 6, 7, 9, 11, 15, 18] },
  { id: "raizes", nome: "Raízes e Grãos", pratos: [3, 8, 12, 14, 17] },
  { id: "partilha", nome: "Partilha", pratos: [19, 20] },
];

const CATEGORIAS_JANTAR = [
  { id: "preludio", nome: "Prelúdio Noturno", pratos: [21, 38] },
  {
    id: "mar",
    nome: "Tesouros do Mar",
    pratos: [22, 24, 26, 28, 29, 30, 32, 36, 39],
  },
  { id: "caca", nome: "Caça e Criação", pratos: [23, 25, 27, 31, 34, 35, 37] },
  { id: "jardins", nome: "Jardins Noturnos", pratos: [33] },
  { id: "celebracao", nome: "Celebração", pratos: [40] },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CardapioPublico() {
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();

  const [pratos, setPratos] = useState([]);
  const [periodo, setPeriodo] = useState("Almoco");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // ── Carregar pratos ────────────────────────────────────────
  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro(null);
        const dados = await cardapioService.listarTodos();
        setPratos(dados);
      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
        setErro("Não foi possível carregar o cardápio");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  // ── Filtrar pratos por período ────────────────────────────
  const categorias = useMemo(() => {
    const categoriasAtivas =
      periodo === "Almoco" ? CATEGORIAS_ALMOCO : CATEGORIAS_JANTAR;

    return categoriasAtivas
      .map((cat) => ({
        ...cat,
        itens: cat.pratos
          .map((id) => pratos.find((p) => p.id === id))
          .filter(Boolean),
      }))
      .filter((cat) => cat.itens.length > 0);
  }, [pratos, periodo]);

  // ── Formatação de preço ────────────────────────────────────
  const formatarPreco = (valor) => {
    return Number.isInteger(valor)
      ? Math.floor(valor)
      : valor.toFixed(2).replace(".", ",");
  };

  // ── Handler de adicionar ao carrinho ───────────────────────
  const handleAdicionarCarrinho = (prato, e) => {
    e.stopPropagation();
    adicionarItem(prato, false);
  };

  // ── Render: Loading ────────────────────────────────────────
  if (carregando) {
    return (
      <div className="cardapio-revista">
        <div className="cardapio-loading">
          <div className="loading-logo">
            <img src={logoNavbar} alt="Sol do Cerrado" />
          </div>
          <p>Preparando a experiência gastronômica...</p>
        </div>
      </div>
    );
  }

  // ── Render: Erro ───────────────────────────────────────────
  if (erro) {
    return (
      <div className="cardapio-revista">
        <div className="cardapio-erro">
          <h2>Desculpe</h2>
          <p>{erro}</p>
          <button className="btn-voltar-erro" onClick={() => navigate("/")}>
            ← Retornar à Página Inicial
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Conteúdo ───────────────────────────────────────
  return (
    <div
      className={`cardapio-revista ${periodo === "Jantar" ? "periodo-noturno" : "periodo-diurno"}`}
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER STICKY
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="cardapio-header">
        <button
          className="btn-voltar"
          onClick={() => navigate("/")}
          aria-label="Voltar para página inicial"
        >
          ← Voltar
        </button>

        <div className="header-centro">
          <img src={logoNavbar} alt="Sol do Cerrado" className="logo-header" />
          <div className="header-texto">
            <h1>Sol do Cerrado</h1>
            <p>Gastronomia Contemporânea</p>
          </div>
        </div>

        <div className="header-spacer" />
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          INTRO
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="cardapio-intro">
        <h2>Cardápio do Cerrado</h2>
        <p>Tradição ancestral, técnica contemporânea</p>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SWITCH ALMOÇO/JANTAR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="periodo-switch">
        <button
          className={`periodo-btn ${periodo === "Almoco" ? "ativo" : ""}`}
          onClick={() => setPeriodo("Almoco")}
        >
          <span className="periodo-icone">☀️</span>
          <span className="periodo-label">Almoço</span>
        </button>
        <button
          className={`periodo-btn ${periodo === "Jantar" ? "ativo" : ""}`}
          onClick={() => setPeriodo("Jantar")}
        >
          <span className="periodo-icone">🌙</span>
          <span className="periodo-label">Jantar</span>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GRID DE PRATOS POR CATEGORIA
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="cardapio-conteudo">
        {categorias.map((categoria, catIndex) => (
          <section key={categoria.id} className="categoria-section">
            {/* Título da categoria */}
            <motion.div
              className="categoria-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3>{categoria.nome}</h3>
              <div className="categoria-divisor" />
            </motion.div>

            {/* Grid de cards */}
            <div className="pratos-grid">
              {categoria.itens.map((prato, index) => (
                <motion.div
                  key={prato.id}
                  className="prato-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {/* Imagem */}
                  <div className="card-imagem-wrapper">
                    <SkeletonImage
                      src={prato.imagemUrl || "/img/prato-padrao.webp"}
                      alt={prato.nome}
                      className="card-imagem"
                      onError={(e) => {
                        e.target.src = "/img/prato-padrao.webp";
                      }}
                    />
                    {/* Badge período (só aparece no hover) */}
                    <div
                      className={`card-badge ${prato.periodo === "Jantar" ? "badge-jantar" : "badge-almoco"}`}
                    >
                      {prato.periodo === "Jantar" ? "🌙" : "☀️"}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="card-conteudo">
                    <h4>{prato.nome}</h4>
                    <p>{prato.descricao}</p>

                    <div className="card-footer">
                      <span className="card-preco">
                        {formatarPreco(prato.preco)}
                      </span>
                      <button
                        className="btn-adicionar"
                        onClick={(e) => handleAdicionarCarrinho(prato, e)}
                        aria-label={`Adicionar ${prato.nome} ao carrinho`}
                      >
                        <span className="btn-icone">+</span>
                        <span className="btn-texto">Adicionar</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default CardapioPublico;
