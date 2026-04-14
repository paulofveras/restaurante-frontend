import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cardapioService } from "../services/cardapioService";
import { authService } from "../services/authService";
import { formatCurrency } from "../utils/formatters";
import { uploadService } from "../services/uploadService";
import SkeletonImage from "../components/SkeletonImage";
import "./Cardapio.css";

// ─── Valores padrão do formulário ──────────────────────────
const FORM_VAZIO = {
  nome: "",
  descricao: "",
  preco: "",
  periodo: "Almoco",
  imagemUrl: "",
};
const ITENS_POR_PAGINA = 8;

// ─── Modal Criar / Editar ───────────────────────────────────
const ModalFormulario = ({ item, onFechar, onSalvar }) => {
  const [form, setForm] = useState(
    item
      ? {
          nome: item.nome,
          descricao: item.descricao,
          preco: item.preco,
          periodo: item.periodo,
          imagemUrl: item.imagemUrl || "",
        }
      : FORM_VAZIO,
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [previewLocal, setPreviewLocal] = useState(item?.imagemUrl || null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [fazendoUpload, setFazendoUpload] = useState(false);
  const inputFileRef = React.useRef(null);
  const isEdicao = !!item;

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Quando o usuário seleciona um arquivo
  const handleSelecionarArquivo = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    // Valida no frontend também
    const extensoesPermitidas = ["image/jpeg", "image/png", "image/webp"];
    if (!extensoesPermitidas.includes(arquivo.type)) {
      setErro("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setErro("");
    setArquivoSelecionado(arquivo);
    // Preview instantâneo sem precisar fazer upload ainda
    setPreviewLocal(URL.createObjectURL(arquivo));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) return setErro("O nome do prato é obrigatório.");
    if (!form.preco || Number(form.preco) <= 0)
      return setErro("Informe um preço válido.");

    try {
      setSalvando(true);
      let urlFinal = form.imagemUrl;

      // Se tem arquivo novo selecionado, faz upload primeiro
      if (arquivoSelecionado) {
        setFazendoUpload(true);
        const resultado =
          await uploadService.uploadImagemPrato(arquivoSelecionado);
        urlFinal = resultado.url;
        setFazendoUpload(false);
      }

      const payload = {
        ...form,
        preco: parseFloat(form.preco),
        imagemUrl: urlFinal,
      };

      if (isEdicao) await cardapioService.atualizar(item.id, payload);
      else await cardapioService.criar(payload);

      onSalvar();
    } catch (err) {
      setErro(err.message || "Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
      setFazendoUpload(false);
    }
  };

  const textoBotao = () => {
    if (fazendoUpload) return "📤 Enviando imagem...";
    if (salvando) return "Salvando...";
    return isEdicao ? "Salvar Alterações" : "Adicionar Prato";
  };

  return (
    <div className="ac-overlay" onClick={onFechar}>
      <motion.div
        className="ac-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: -24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        <div className="ac-modal-header">
          <h2>{isEdicao ? "✏️ Editar Prato" : "➕ Novo Prato"}</h2>
          <button className="ac-modal-close" onClick={onFechar}>
            ×
          </button>
        </div>

        <form className="ac-modal-form" onSubmit={handleSubmit}>
          {erro && <p className="ac-form-erro">⚠️ {erro}</p>}

          <div className="ac-form-grupo">
            <label>Nome do Prato *</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Arroz com Pequi"
              required
            />
          </div>

          <div className="ac-form-grupo">
            <label>Descrição</label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva os ingredientes..."
            />
          </div>

          <div className="ac-form-dupla">
            <div className="ac-form-grupo">
              <label>Preço (R$) *</label>
              <input
                name="preco"
                type="number"
                step="0.01"
                min="0.01"
                value={form.preco}
                onChange={handleChange}
                placeholder="0,00"
                required
              />
            </div>
            <div className="ac-form-grupo">
              <label>Período *</label>
              <select
                name="periodo"
                value={form.periodo}
                onChange={handleChange}
              >
                <option value="Almoco">☀️ Almoço</option>
                <option value="Jantar">🌙 Jantar</option>
              </select>
            </div>
          </div>

          {/* ── Área de upload de imagem ── */}
          <div className="ac-form-grupo">
            <label>Imagem do Prato</label>

            {/* Preview */}
            {previewLocal ? (
              <div className="ac-upload-preview-wrapper">
                <img
                  src={previewLocal}
                  alt="Preview"
                  className="ac-upload-preview"
                />
                <button
                  type="button"
                  className="ac-upload-remover"
                  onClick={() => {
                    setPreviewLocal(null);
                    setArquivoSelecionado(null);
                    setForm((p) => ({ ...p, imagemUrl: "" }));
                    if (inputFileRef.current) inputFileRef.current.value = "";
                  }}
                >
                  × Remover
                </button>
              </div>
            ) : (
              /* Zona de clique para selecionar */
              <div
                className="ac-upload-zona"
                onClick={() => inputFileRef.current?.click()}
              >
                <span className="ac-upload-icone">🖼️</span>
                <p className="ac-upload-texto">
                  Clique para selecionar uma imagem
                </p>
                <p className="ac-upload-sub">JPG, PNG ou WEBP · máximo 5MB</p>
              </div>
            )}

            {/* Input file escondido */}
            <input
              ref={inputFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleSelecionarArquivo}
              style={{ display: "none" }}
            />
          </div>

          <div className="ac-modal-footer">
            <button
              type="button"
              className="ac-btn-cancelar"
              onClick={onFechar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ac-btn-salvar"
              disabled={salvando || fazendoUpload}
            >
              {textoBotao()}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Modal Confirmação de Exclusão ─────────────────────────
const ModalConfirmacao = ({ item, onConfirmar, onCancelar }) => (
  <div className="ac-overlay" onClick={onCancelar}>
    <motion.div
      className="ac-modal ac-modal--confirmacao"
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, y: -24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <div className="ac-modal-header">
        <h2>🗑️ Excluir Prato</h2>
        <button className="ac-modal-close" onClick={onCancelar}>
          ×
        </button>
      </div>

      <div style={{ padding: "1.5rem", textAlign: "center" }}>
        <p style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>
          Tem certeza que deseja excluir permanentemente:
        </p>
        <p
          style={{
            fontWeight: 600,
            fontSize: "1.1rem",
            marginBottom: "1.5rem",
          }}
        >
          "{item.nome}"?
        </p>
        <p
          style={{
            color: "#e53e3e",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          ⚠️ Esta ação não pode ser desfeita.
        </p>
      </div>

      <div className="ac-modal-footer">
        <button className="ac-btn-cancelar" onClick={onCancelar}>
          Cancelar
        </button>
        <button
          className="ac-btn-deletar"
          onClick={onConfirmar}
          style={{ padding: "0.5rem 1.5rem", borderRadius: "6px" }}
        >
          🗑️ Excluir Permanentemente
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Card individual do prato ──────────────────────────────
const PratoCard = ({ item, isAdmin, onEditar, onExcluir, onAlternar }) => (
  <motion.div
    className={`ac-card ${!item.ativo ? "ac-card--inativo" : ""}`}
    layout
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {/* Imagem */}
    <div className="ac-card-img-wrapper">
      <SkeletonImage
        src={item.imagemUrl || "/img/prato-padrao.webp"}
        alt={item.nome}
        className="ac-card-img"
        onError={(e) => {
          e.target.src = "/img/prato-padrao.webp";
        }}
      />
      {/* Badge período */}
      <span
        className={`ac-badge-periodo ${item.periodo === "Almoco" ? "ac-badge--almoco" : "ac-badge--jantar"}`}
      >
        {item.periodo === "Almoco" ? "☀️ Almoço" : "🌙 Jantar"}
      </span>
      {/* Badge inativo */}
      {!item.ativo && <span className="ac-badge-inativo">● Inativo</span>}
    </div>

    {/* Conteúdo */}
    <div className="ac-card-body">
      <h3 className="ac-card-nome">{item.nome}</h3>
      <p className="ac-card-desc">{item.descricao}</p>
      <p className="ac-card-preco">{formatCurrency(item.preco)}</p>
    </div>

    {/* Ações — só admin */}
    {isAdmin && (
      <div className="ac-card-acoes">
        <button
          className="ac-btn-editar"
          onClick={() => onEditar(item)}
          title="Editar"
        >
          ✏️ Editar
        </button>
        <button
          className={`ac-btn-toggle ${item.ativo ? "ac-btn-toggle--ativo" : "ac-btn-toggle--inativo"}`}
          onClick={() => onAlternar(item)}
          title={item.ativo ? "Desativar prato" : "Ativar prato"}
        >
          {item.ativo ? "🔴 Desativar" : "🟢 Ativar"}
        </button>
        <button
          className="ac-btn-deletar"
          onClick={() => onExcluir(item)}
          title="Excluir permanentemente"
        >
          🗑️
        </button>
      </div>
    )}
  </motion.div>
);

// ─── Paginação ─────────────────────────────────────────────
const Paginacao = ({ paginaAtual, totalPaginas, onMudar }) => {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <div className="ac-paginacao">
      <button
        className="ac-pag-btn"
        onClick={() => onMudar(paginaAtual - 1)}
        disabled={paginaAtual === 1}
      >
        ← Anterior
      </button>

      <div className="ac-pag-numeros">
        {paginas.map((p) => (
          <button
            key={p}
            className={`ac-pag-num ${p === paginaAtual ? "active" : ""}`}
            onClick={() => onMudar(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        className="ac-pag-btn"
        onClick={() => onMudar(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
      >
        Próxima →
      </button>
    </div>
  );
};

// ─── Componente Principal ──────────────────────────────────
const Cardapio = () => {
  const [itens, setItens] = useState([]);
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [filtro, setFiltro] = useState(null);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalForm, setModalForm] = useState(null);

  // CORREÇÃO: O estado está aqui agora!
  const [modalExcluir, setModalExcluir] = useState(null);
  const [processandoTodos, setProcessandoTodos] = useState(false);

  const isAdmin = authService.isAdmin();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    carregarItens();
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    aplicarFiltros();
    setPaginaAtual(1);
  }, [filtro, busca, itens]);

  const carregarItens = async () => {
    try {
      setLoading(true);
      // Admin vê todos; cliente vê só ativos
      const dados = isAdmin
        ? await cardapioService.listarTodosAdmin()
        : await cardapioService.listarTodos();
      setItens(dados);
    } catch (err) {
      console.error("Erro ao carregar cardápio:", err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let r = [...itens];
    if (filtro !== null) r = r.filter((i) => i.periodo === filtro);
    if (busca.trim()) {
      const t = busca.toLowerCase();
      r = r.filter(
        (i) =>
          i.nome.toLowerCase().includes(t) ||
          i.descricao?.toLowerCase().includes(t),
      );
    }
    setItensFiltrados(r);
  };

  const handleSalvar = async () => {
    setModalForm(null);
    await carregarItens();
  };

  const handleExcluir = async () => {
    try {
      await cardapioService.deletar(modalExcluir.id);
    } catch (err) {
      console.error(err);
    } finally {
      setModalExcluir(null);
      await carregarItens();
    }
  };

  const handleAlternar = async (item) => {
    try {
      await cardapioService.alternarStatus(item.id);
      await carregarItens();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAlternarTodos = async (ativo) => {
    try {
      setProcessandoTodos(true);
      await cardapioService.alternarStatusTodos(ativo);
      await carregarItens();
    } catch (err) {
      console.error("Erro ao alternar status em massa:", err);
    } finally {
      setProcessandoTodos(false);
    }
  };

  // Paginação
  const totalPaginas = Math.ceil(itensFiltrados.length / ITENS_POR_PAGINA);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const itensPagina = itensFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  const almoco = itens.filter((i) => i.periodo === "Almoco").length;
  const jantar = itens.filter((i) => i.periodo === "Jantar").length;
  const inativos = itens.filter((i) => !i.ativo).length;

  if (loading)
    return (
      <div className="ac-page">
        <div className="ac-loading">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 64, height: 64 }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#C97458" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#sg2)"
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

  return (
    <>
      <div className="ac-page">
        {/* Cabeçalho */}
        <div className="ac-header">
          <div>
            <h1 className="ac-titulo">Cardápio</h1>
            <p className="ac-subtitulo">
              {almoco} almoço · {jantar} jantar · {itens.length} total
              {isAdmin && inativos > 0 && (
                <span className="ac-badge-count-inativo">
                  {" "}
                  · {inativos} inativos
                </span>
              )}
            </p>
          </div>
          {isAdmin && (
            <div className="ac-header-acoes">
              <button
                className="ac-btn-ativar-todos"
                onClick={() => handleAlternarTodos(true)}
                disabled={processandoTodos}
                title="Ativar todos os pratos"
              >
                {processandoTodos ? "..." : "🟢 Ativar Todos"}
              </button>
              <button
                className="ac-btn-desativar-todos"
                onClick={() => handleAlternarTodos(false)}
                disabled={processandoTodos}
                title="Desativar todos os pratos"
              >
                {processandoTodos ? "..." : "🔴 Desativar Todos"}
              </button>
              <button
                className="ac-btn-novo"
                onClick={() => setModalForm("novo")}
              >
                + Adicionar Prato
              </button>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="ac-toolbar">
          <div className="ac-filtros">
            {[
              { label: `🍽️ Todos (${itens.length})`, valor: null },
              { label: `☀️ Almoço (${almoco})`, valor: "Almoco" },
              { label: `🌙 Jantar (${jantar})`, valor: "Jantar" },
            ].map((f) => (
              <button
                key={String(f.valor)}
                className={`ac-filtro-btn ${filtro === f.valor ? "active" : ""}`}
                onClick={() => setFiltro(f.valor)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ac-busca-wrapper">
            <span className="ac-busca-icone">🔍</span>
            <input
              className="ac-busca"
              type="text"
              placeholder="Buscar prato..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button className="ac-busca-limpar" onClick={() => setBusca("")}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Grid de cards */}
        {itensPagina.length === 0 ? (
          <div className="ac-vazio">
            <p>Nenhum prato encontrado para esta busca.</p>
          </div>
        ) : (
          <motion.div className="ac-grid" layout>
            <AnimatePresence>
              {itensPagina.map((item) => (
                <PratoCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onEditar={setModalForm}
                  onExcluir={setModalExcluir}
                  onAlternar={handleAlternar}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Paginação */}
        <Paginacao
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          onMudar={(p) => {
            setPaginaAtual(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      {/* Modais */}
      <AnimatePresence>
        {modalForm && (
          <ModalFormulario
            item={modalForm === "novo" ? null : modalForm}
            onFechar={() => setModalForm(null)}
            onSalvar={handleSalvar}
          />
        )}
        {modalExcluir && (
          <ModalConfirmacao
            item={modalExcluir}
            onConfirmar={handleExcluir}
            onCancelar={() => setModalExcluir(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Cardapio;
