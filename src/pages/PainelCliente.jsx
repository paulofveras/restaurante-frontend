import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../services/authService";
import { apiFetch } from "../api/api";
import { formatCurrency } from "../utils/formatters";
import "./PainelCliente.css";
import Badge from "../components/Badge";

const PainelCliente = () => {
  const navigate = useNavigate();
  const usuario = authService.getUsuarioLogado();

  const [abaAtiva, setAbaAtiva] = useState("pedidos");
  const [pedidos, setPedidos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  // Estados para endereços
  const [enderecos, setEnderecos] = useState([]);
  const [mostrarFormEndereco, setMostrarFormEndereco] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [formEndereco, setFormEndereco] = useState({
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  // 2️⃣ NO STATE, adicione:
  const [carregandoCep, setCarregandoCep] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    setErro("");
    try {
      // Pedidos
      const resPedidos = await apiFetch(`/Pedido/usuario/${usuario.id}`);
      if (resPedidos.ok) {
        const todos = await resPedidos.json();
        setPedidos(todos);
      }

      // Reservas
      const resReservas = await apiFetch(`/Reserva/usuario/${usuario.id}`);
      if (resReservas.ok) {
        const dados = await resReservas.json();
        setReservas(dados);
      }

      // Endereços
      const resEnderecos = await apiFetch(`/Endereco/usuario/${usuario.id}`);
      if (resEnderecos.ok) {
        const dadosEnderecos = await resEnderecos.json();
        setEnderecos(dadosEnderecos);
      }
    } catch {
      setErro("Não foi possível carregar seus dados. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // 1️⃣ ADICIONAR a função buscarCep (logo depois da função carregarDados):
  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    setCarregandoCep(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const data = await response.json();

      if (!data.erro) {
        setFormEndereco((prev) => ({
          ...prev,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
          cep: cep,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setCarregandoCep(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const abrirFormEndereco = (endereco = null) => {
    if (endereco) {
      setEnderecoEditando(endereco);
      setFormEndereco({
        rua: endereco.rua || "",
        numero: endereco.numero || "",
        complemento: endereco.complemento || "",
        bairro: endereco.bairro || "",
        cidade: endereco.cidade || "",
        estado: endereco.estado || "",
        cep: endereco.cep || "",
      });
    } else {
      setEnderecoEditando(null);
      setFormEndereco({
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
      });
    }
    setMostrarFormEndereco(true);
  };

  const salvarEndereco = async () => {
    setErro("");

    if (
      !formEndereco.rua ||
      !formEndereco.numero ||
      !formEndereco.bairro ||
      !formEndereco.cidade ||
      !formEndereco.estado ||
      !formEndereco.cep
    ) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const metodo = enderecoEditando ? "PUT" : "POST";
      const url = enderecoEditando
        ? `/Endereco/${enderecoEditando.id}`
        : "/Endereco";

      const payload = {
        ...formEndereco,
        usuarioId: usuario.id,
      };

      const res = await apiFetch(url, {
        method: metodo,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar endereço");

      await carregarDados();
      setMostrarFormEndereco(false);
      setEnderecoEditando(null);
    } catch (e) {
      setErro("Não foi possível salvar o endereço. Tente novamente.");
    }
  };

  const excluirEndereco = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este endereço?"))
      return;

    try {
      const res = await apiFetch(`/Endereco/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      await carregarDados();
    } catch {
      setErro("Não foi possível excluir o endereço.");
    }
  };

  const badgeStatus = (status) => {
    const mapa = {
      Pendente: { cor: "#f59e0b", bg: "rgba(245,158,11,0.12)", icone: "⏳" },
      Preparando: { cor: "#3b82f6", bg: "rgba(59,130,246,0.12)", icone: "👨‍🍳" },
      Pronto: { cor: "#10b981", bg: "rgba(16,185,129,0.12)", icone: "✅" },
      Entregue: { cor: "#6b7280", bg: "rgba(107,114,128,0.12)", icone: "📦" },
      Cancelado: { cor: "#ef4444", bg: "rgba(239,68,68,0.12)", icone: "❌" },
    };
    const s = mapa[status] ?? {
      cor: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
      icone: "❓",
    };
    return (
      <span
        style={{
          background: s.bg,
          color: s.cor,
          border: `1px solid ${s.cor}`,
          borderRadius: "999px",
          padding: "0.2rem 0.75rem",
          fontSize: "0.8rem",
          fontWeight: 700,
        }}
      >
        {s.icone} {status}
      </span>
    );
  };

  const gerarPagamentoMock = (pedidoId) => {
    const seed = pedidoId * 9301 + 49297;
    const metodos = ["CartaoCredito", "CartaoDebito", "Pix", "PagarEntrega"];
    const metodo = metodos[seed % metodos.length];
    const prefixos = ["4532", "5412", "3714", "6011"];
    const prefixo = prefixos[seed % prefixos.length];
    const txId = `E${String(seed * 137).padStart(11, "0")}${pedidoId}BR`;

    return { metodo, prefixo, txId };
  };

  const renderDetalhesPagamento = (pedido) => {
    const { metodo, prefixo, txId } = gerarPagamentoMock(pedido.id);

    if (metodo === "CartaoCredito" || metodo === "CartaoDebito") {
      return (
        <div className="pd-pagamento">
          <span className="pd-pagamento-icone">💳</span>
          <div>
            <p className="pd-pagamento-tipo">
              {metodo === "CartaoCredito"
                ? "Cartão de Crédito"
                : "Cartão de Débito"}
            </p>
            <p className="pd-pagamento-detalhe">{prefixo} **** **** ****</p>
          </div>
        </div>
      );
    }
    if (metodo === "Pix") {
      return (
        <div className="pd-pagamento">
          <span className="pd-pagamento-icone">⚡</span>
          <div>
            <p className="pd-pagamento-tipo">PIX</p>
            <p className="pd-pagamento-detalhe">ID: {txId}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="pd-pagamento">
        <span className="pd-pagamento-icone">🤝</span>
        <div>
          <p className="pd-pagamento-tipo">Pago na Entrega</p>
          <p className="pd-pagamento-detalhe">Pago ao entregador/garçom</p>
        </div>
      </div>
    );
  };

  return (
    <div className="painel-cliente">
      {/* ── HEADER ── */}
      <motion.header
        className="pc-header"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="pc-header-esquerda">
          <button className="pc-btn-voltar" onClick={() => navigate("/")}>
            ← Voltar ao site
          </button>
          <div className="pc-titulo">
            <h1>Minha Conta</h1>
            <p>
              Olá, <strong>{usuario?.userName}</strong> 👋
            </p>
          </div>
        </div>
        <button className="pc-btn-sair" onClick={handleLogout}>
          Sair
        </button>
      </motion.header>

      {/* ── ABAS ── */}
      <div className="pc-abas">
        <button
          className={`pc-aba ${abaAtiva === "pedidos" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("pedidos")}
        >
          📝 Meus Pedidos
          {pedidos.length > 0 && (
            <span className="pc-aba-badge">{pedidos.length}</span>
          )}
        </button>
        <button
          className={`pc-aba ${abaAtiva === "reservas" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("reservas")}
        >
          🪑 Minhas Reservas
          {reservas.length > 0 && (
            <span className="pc-aba-badge">{reservas.length}</span>
          )}
        </button>
        <button
          className={`pc-aba ${abaAtiva === "enderecos" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("enderecos")}
        >
          📍 Meus Endereços
          {enderecos.length > 0 && (
            <span className="pc-aba-badge">{enderecos.length}</span>
          )}
        </button>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="pc-conteudo">
        {carregando && (
          <div className="pc-loading">
            <div className="pc-spinner">☀️</div>
            <p>Carregando seus dados...</p>
          </div>
        )}

        {erro && !carregando && (
          <div className="pc-erro">
            <span>⚠️</span> {erro}
            <button onClick={carregarDados}>Tentar novamente</button>
          </div>
        )}

        {/* PEDIDOS */}
        {!carregando && !erro && abaAtiva === "pedidos" && (
          <motion.div
            key="pedidos"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {pedidos.length === 0 ? (
              <div className="pc-vazio">
                <span>🍽️</span>
                <h3>Nenhum pedido ainda</h3>
                <p>Que tal dar uma olhada no nosso cardápio?</p>
                <button className="pc-btn-acao" onClick={() => navigate("/")}>
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <div className="pc-lista">
                {pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="pc-card pc-card-clicavel"
                    onClick={() => setPedidoSelecionado(pedido)}
                    title="Clique para ver detalhes"
                  >
                    <div className="pc-card-topo">
                      <span className="pc-card-id">Pedido #{pedido.id}</span>
                      <Badge status={pedido.status} />
                    </div>
                    <div className="pc-card-info">
                      <span>📅 {formatarData(pedido.dataHoraPedido)}</span>
                      <span>
                        {pedido.periodo === "Almoco"
                          ? "☀️ Almoço"
                          : "🌙 Jantar"}
                      </span>
                    </div>
                    <div className="pc-card-rodape">
                      <span className="pc-card-total">
                        Total:{" "}
                        <strong>{formatCurrency(pedido.totalFinal)}</strong>
                      </span>
                      <span className="pc-ver-detalhes">Ver detalhes →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* RESERVAS */}
        {!carregando && !erro && abaAtiva === "reservas" && (
          <motion.div
            key="reservas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {reservas.length === 0 ? (
              <div className="pc-vazio">
                <span>🪑</span>
                <h3>Nenhuma reserva ainda</h3>
                <p>Reserve uma mesa para uma experiência especial.</p>
                <button
                  className="pc-btn-acao"
                  onClick={() => navigate("/reservas")}
                >
                  Fazer Reserva
                </button>
              </div>
            ) : (
              <div className="pc-lista">
                {reservas.map((reserva) => (
                  <div key={reserva.id} className="pc-card">
                    <div className="pc-card-topo">
                      <span className="pc-card-id">Reserva #{reserva.id}</span>
                      <span className="pc-badge-reserva">✅ Confirmada</span>
                    </div>
                    <div className="pc-card-info">
                      <span>📅 {formatarData(reserva.dataHora)}</span>
                      <span>🪑 Mesa {reserva.mesaId}</span>
                    </div>
                    <div className="pc-card-rodape">
                      <span className="pc-codigo">
                        Código: <strong>{reserva.codigoConfirmacao}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ENDEREÇOS */}
        {!carregando && !erro && abaAtiva === "enderecos" && (
          <motion.div
            key="enderecos"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pc-acoes-topo">
              <h3>📍 Meus Endereços de Entrega</h3>
              <button
                className="pc-btn-acao"
                onClick={() => abrirFormEndereco()}
              >
                + Adicionar Endereço
              </button>
            </div>

            {enderecos.length === 0 ? (
              <div className="pc-vazio">
                <span>📍</span>
                <h3>Nenhum endereço cadastrado</h3>
                <p>
                  Adicione um endereço para facilitar seus pedidos de delivery
                </p>
                <button
                  className="pc-btn-acao"
                  onClick={() => abrirFormEndereco()}
                >
                  Cadastrar Endereço
                </button>
              </div>
            ) : (
              <div className="pc-lista">
                {enderecos.map((end) => (
                  <div key={end.id} className="pc-card">
                    <div className="pc-card-topo">
                      <span className="pc-card-id">📍 Endereço #{end.id}</span>
                      <div className="pc-card-acoes">
                        <button
                          className="pc-btn-editar"
                          onClick={() => abrirFormEndereco(end)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="pc-btn-excluir"
                          onClick={() => excluirEndereco(end.id)}
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="pc-endereco-info">
                      <p>
                        <strong>
                          {end.rua}, {end.numero}
                        </strong>
                      </p>
                      {end.complemento && (
                        <p className="complemento">{end.complemento}</p>
                      )}
                      <p>
                        {end.bairro} — {end.cidade}/{end.estado}
                      </p>
                      <p className="cep">CEP: {end.cep}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal de Formulário de Endereço */}
            {mostrarFormEndereco && (
              <div
                className="pc-modal-overlay"
                onClick={() => setMostrarFormEndereco(false)}
              >
                <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="pc-modal-header">
                    <h3>
                      {enderecoEditando ? "Editar Endereço" : "Novo Endereço"}
                    </h3>
                    <button onClick={() => setMostrarFormEndereco(false)}>
                      ✕
                    </button>
                  </div>

                  <div className="pc-modal-body">
                    {/* 3️⃣ NO INPUT DO CEP (dentro do modal de endereço), SUBSTITUA: */}
                    <div className="pc-form-campo">
                      <label>CEP *</label>
                      <input
                        type="text"
                        value={formEndereco.cep}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormEndereco({ ...formEndereco, cep: valor });
                          if (valor.replace(/\D/g, "").length === 8) {
                            buscarCep(valor);
                          }
                        }}
                        placeholder="00000-000"
                        maxLength={9}
                        disabled={carregandoCep}
                      />
                      {carregandoCep && <small>Buscando CEP...</small>}
                    </div>

                    <div className="pc-form-row">
                      <div className="pc-form-campo">
                        <label>Rua/Avenida *</label>
                        <input
                          type="text"
                          value={formEndereco.rua}
                          onChange={(e) =>
                            setFormEndereco({
                              ...formEndereco,
                              rua: e.target.value,
                            })
                          }
                          placeholder="Ex: Av. Paulista"
                        />
                      </div>
                      <div className="pc-form-campo pc-form-campo-pequeno">
                        <label>Número *</label>
                        <input
                          type="text"
                          value={formEndereco.numero}
                          onChange={(e) =>
                            setFormEndereco({
                              ...formEndereco,
                              numero: e.target.value,
                            })
                          }
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div className="pc-form-campo">
                      <label>Complemento</label>
                      <input
                        type="text"
                        value={formEndereco.complemento}
                        onChange={(e) =>
                          setFormEndereco({
                            ...formEndereco,
                            complemento: e.target.value,
                          })
                        }
                        placeholder="Apto 45, Bloco B"
                      />
                    </div>

                    <div className="pc-form-row">
                      <div className="pc-form-campo">
                        <label>Bairro *</label>
                        <input
                          type="text"
                          value={formEndereco.bairro}
                          onChange={(e) =>
                            setFormEndereco({
                              ...formEndereco,
                              bairro: e.target.value,
                            })
                          }
                          placeholder="Centro"
                        />
                      </div>
                      <div className="pc-form-campo">
                        <label>Cidade *</label>
                        <input
                          type="text"
                          value={formEndereco.cidade}
                          onChange={(e) =>
                            setFormEndereco({
                              ...formEndereco,
                              cidade: e.target.value,
                            })
                          }
                          placeholder="São Paulo"
                        />
                      </div>
                    </div>

                    <div className="pc-form-row">
                      <div className="pc-form-campo pc-form-campo-pequeno">
                        <label>Estado *</label>
                        <input
                          type="text"
                          value={formEndereco.estado}
                          onChange={(e) =>
                            setFormEndereco({
                              ...formEndereco,
                              estado: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="SP"
                          maxLength="2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pc-modal-footer">
                    <button
                      className="pc-btn-secundario"
                      onClick={() => setMostrarFormEndereco(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="pc-btn-primario"
                      onClick={salvarEndereco}
                    >
                      {enderecoEditando
                        ? "Salvar Alterações"
                        : "Adicionar Endereço"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── MODAL DE DETALHES DO PEDIDO ── */}
      {pedidoSelecionado && (
        <div className="pd-overlay" onClick={() => setPedidoSelecionado(null)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-header">
              <div>
                <h3>Pedido #{pedidoSelecionado.id}</h3>
                <p>{formatarData(pedidoSelecionado.dataHoraPedido)}</p>
              </div>
              <button
                className="pd-fechar"
                onClick={() => setPedidoSelecionado(null)}
              >
                ✕
              </button>
            </div>

            <div className="pd-status-row">
              <Badge status={pedidoSelecionado.status} />
              <span className="pd-periodo">
                {pedidoSelecionado.periodo === "Almoco"
                  ? "☀️ Almoço"
                  : "🌙 Jantar"}
              </span>
            </div>

            <div className="pd-secao">
              <p className="pd-secao-titulo">📋 Itens do Pedido</p>
              {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 ? (
                <div className="pd-itens">
                  {pedidoSelecionado.itens.map((item, i) => (
                    <div key={i} className="pd-item">
                      {item.imagemUrl && (
                        <img
                          src={item.imagemUrl}
                          alt={item.nome}
                          className="pd-item-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div className="pd-item-info">
                        <span className="pd-item-nome">
                          {item.nome || `Item #${item.itemCardapioId}`}
                        </span>
                        <span className="pd-item-qtd">× {item.quantidade}</span>
                      </div>
                      <span className="pd-item-preco">
                        {item.precoMomento
                          ? formatCurrency(item.precoMomento * item.quantidade)
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pd-sem-itens">
                  Detalhes dos itens não disponíveis.
                </p>
              )}
            </div>

            <div className="pd-secao">
              <p className="pd-secao-titulo">💰 Forma de Pagamento</p>
              {renderDetalhesPagamento(pedidoSelecionado)}
            </div>

            <div className="pd-total">
              <span>Total pago</span>
              <strong>{formatCurrency(pedidoSelecionado.totalFinal)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PainelCliente;
