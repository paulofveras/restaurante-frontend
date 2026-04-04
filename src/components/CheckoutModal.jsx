import React, { useState, useEffect } from 'react';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { authService } from '../services/authService';
import { apiFetch } from '../api/api';
import { formatCurrency } from '../utils/formatters';
import './CheckoutModal.css';

// ── Espelha a lógica do backend (AtendimentoDeliveryApp.CalcularTaxa) ──
const calcularTaxaLocal = (tipoAtendimento, subtotal) => {
  switch (tipoAtendimento) {
    case 'Presencial': return 0;
    case 'DeliveryProprio': return 5.00;           // TaxaFixa do seed
    case 'DeliveryApp':
      const hora = new Date().getHours();
      return subtotal * (hora < 18 ? 0.04 : 0.06); // 4% dia / 6% noite
    default: return 0;
  }
};

const TIPOS_ATENDIMENTO = [
  {
    valor: 'Presencial',
    label: 'Presencial',
    icone: '🏪',
    descricao: 'Retire no balcão ou consuma no local. Sem taxa adicional.',
  },
  {
    valor: 'DeliveryProprio',
    label: 'Delivery Próprio',
    icone: '🛵',
    descricao: 'Entrega feita pelo restaurante. Taxa fixa de R$ 5,00.',
  },
  {
    valor: 'DeliveryApp',
    label: 'Delivery por App',
    icone: '📱',
    descricao: `Entregue via parceiro (iFood, etc.). Taxa: ${new Date().getHours() < 18 ? '4% (diurno)' : '6% (noturno)'
      } sobre o subtotal.`,
  },
];

const METODOS_PAGAMENTO = [
  { valor: 'CartaoCredito',  label: 'Cartão de Crédito', icone: '💳', descricao: 'Crédito à vista ou parcelado' },
  { valor: 'CartaoDebito',   label: 'Cartão de Débito',  icone: '💳', descricao: 'Débito em conta corrente'      },
  { valor: 'Pix',            label: 'PIX',               icone: '⚡', descricao: 'Aprovação instantânea'         },
  { valor: 'PagarEntrega',   label: 'Pagar na Entrega',  icone: '🤝', descricao: 'Pague ao garçom ou entregador' },
];

// ─────────────────────────────────────────────────────────
// Modal de Checkout

const CheckoutModal = ({ visivel, onFechar }) => {
  const { itens, subtotal, periodoAtual, limparCarrinho } = useCarrinho();
  const usuario = authService.getUsuarioLogado();

  const [tipoAtendimento, setTipoAtendimento]   = useState('Presencial');
  const [metodoPagamento, setMetodoPagamento]   = useState('CartaoCredito');

  // Campos do cartão (fictícios)
  const [numCartao, setNumCartao]   = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validade, setValidade]     = useState('');
  const [cvv, setCvv]               = useState('');
  const [copiado, setCopiado]       = useState(false);

  // Código PIX simulado (fixo para demonstração)
  const CODIGO_PIX = '00020126580014BR.GOV.BCB.PIX0136sol-do-cerrado@restaurante.com.br5204000053039865802BR5925Sol do Cerrado Restaurante6009SAO PAULO62140510pagamento63041D3E';

  const [etapa, setEtapa] = useState(1); // 1=atendimento, 2=pagamento, 3=confirmado
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);

  // Recalcula taxa ao vivo quando o tipo muda
  const taxa = calcularTaxaLocal(tipoAtendimento, subtotal);
  const totalFinal = subtotal + taxa;

  // Escuta o evento disparado pelo botão "Finalizar Pedido" do CarrinhoDrawer
  useEffect(() => {
    const handler = () => onFechar && null; // o App.jsx controla a visibilidade
    window.addEventListener('abrirCheckout', handler);
    return () => window.removeEventListener('abrirCheckout', handler);
  }, []);

  // Reseta o modal ao fechar
  useEffect(() => {
    if (!visivel) {
      setTimeout(() => {
        setEtapa(1);
        setErro('');
        setPedidoFinalizado(null);
        setTipoAtendimento('Presencial');
        setMetodoPagamento('CartaoCredito');
        setNumCartao('');
        setNomeCartao('');
        setValidade('');
        setCvv('');
      }, 300);
    }
  }, [visivel]);

  if (!visivel) return null;

  // ── Validações de negócio ──────────────────────────────────────
  if (!usuario) {
    return (
      <div className="checkout-overlay" onClick={onFechar}>
        <div className="checkout-modal" onClick={e => e.stopPropagation()}>
          <div className="checkout-aviso-login">
            <span>🔒</span>
            <h3>Faça login para continuar</h3>
            <p>Você precisa estar logado para finalizar o pedido.</p>
            <button className="checkout-btn-primario" onClick={onFechar}>Entendido</button>
          </div>
        </div>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="checkout-overlay" onClick={onFechar}>
        <div className="checkout-modal" onClick={e => e.stopPropagation()}>
          <div className="checkout-aviso-login">
            <span>🛒</span>
            <h3>Carrinho vazio</h3>
            <p>Adicione itens ao carrinho antes de finalizar.</p>
            <button className="checkout-btn-primario" onClick={onFechar}>Voltar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Envio do pedido ────────────────────────────────────────────
  const handleConfirmar = async () => {
    setErro('');
    setEnviando(true);

    // Monta o body exatamente como o PedidoRequestDTO espera
    const body = {
      usuarioId: usuario.id,
      periodo: periodoAtual,          // 'Almoco' ou 'Jantar'
      tipoAtendimento: tipoAtendimento,        // 'Presencial' | 'DeliveryProprio' | 'DeliveryApp'
      metodoPagamento: metodoPagamento,        // 'Pix' | 'CartaoCredito' | 'CartaoDebito' | 'PagarEntrega'
      itens: itens.map(i => ({
        itemCardapioId: i.id,
        quantidade: i.quantidade,
        observacao: i.observacao || '',
      })),
    };

    try {
      const resposta = await apiFetch('/Pedido', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!resposta.ok) {
        const msg = await resposta.text();
        throw new Error(msg || 'Erro ao criar pedido.');
      }

      const pedido = await resposta.json();
      setPedidoFinalizado(pedido);
      limparCarrinho();
      setEtapa(3);

    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  // Formata número do cartão com espaços a cada 4 dígitos
  const formatarCartao = (valor) =>
    valor.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  // Formata validade MM/AA
  const formatarValidade = (valor) =>
    valor.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

  const copiarPix = () => {
    navigator.clipboard.writeText(CODIGO_PIX);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Renderização condicional do painel de pagamento
  const renderPainelPagamento = () => {
    if (metodoPagamento === 'CartaoCredito' || metodoPagamento === 'CartaoDebito') {
      return (
        <div className="checkout-painel-pagamento">
          <p className="painel-titulo">
            💳 Dados do {metodoPagamento === 'CartaoCredito' ? 'Crédito' : 'Débito'}
          </p>
          <div className="checkout-campo">
            <label>Número do Cartão</label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={numCartao}
              onChange={e => setNumCartao(formatarCartao(e.target.value))}
              maxLength={19}
            />
          </div>
          <div className="checkout-campo">
            <label>Nome no Cartão</label>
            <input
              type="text"
              placeholder="Como impresso no cartão"
              value={nomeCartao}
              onChange={e => setNomeCartao(e.target.value.toUpperCase())}
              maxLength={26}
            />
          </div>
          <div className="checkout-campo-linha">
            <div className="checkout-campo">
              <label>Validade</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={validade}
                onChange={e => setValidade(formatarValidade(e.target.value))}
                maxLength={5}
              />
            </div>
            <div className="checkout-campo">
              <label>CVV</label>
              <input
                type="text"
                placeholder="•••"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
              />
            </div>
          </div>
        </div>
      );
    }

    if (metodoPagamento === 'Pix') {
      return (
        <div className="checkout-painel-pagamento painel-pix">
          <p className="painel-titulo">⚡ Pague via PIX</p>
          {/* QR Code simulado com SVG */}
          <div className="pix-qrcode">
            <svg viewBox="0 0 100 100" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white"/>
              {/* Bordas dos cantos */}
              <rect x="5" y="5" width="25" height="25" rx="3" fill="none" stroke="#1a2332" strokeWidth="4"/>
              <rect x="10" y="10" width="15" height="15" rx="1" fill="#1a2332"/>
              <rect x="70" y="5" width="25" height="25" rx="3" fill="none" stroke="#1a2332" strokeWidth="4"/>
              <rect x="75" y="10" width="15" height="15" rx="1" fill="#1a2332"/>
              <rect x="5" y="70" width="25" height="25" rx="3" fill="none" stroke="#1a2332" strokeWidth="4"/>
              <rect x="10" y="75" width="15" height="15" rx="1" fill="#1a2332"/>
              {/* Padrão interno */}
              {[20,25,30,35,40,45,50,55,60,65,70,75,80].map((x, i) =>
                [20,30,40,50,60,70,80].map((y, j) =>
                  (i + j) % 2 === 0 && !(x < 35 && y < 35) && !(x > 65 && y < 35) && !(x < 35 && y > 65)
                    ? <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill="#1a2332"/>
                    : null
                )
              )}
              {/* Logo PIX no centro */}
              <circle cx="50" cy="50" r="10" fill="#32BCAD"/>
              <text x="50" y="54" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PIX</text>
            </svg>
          </div>
          <p className="pix-instrucao">Escaneie o QR Code ou copie o código abaixo:</p>
          <div className="pix-copia-cola">
            <input type="text" readOnly value={CODIGO_PIX} className="pix-input" />
            <button className="pix-btn-copiar" onClick={copiarPix}>
              {copiado ? '✔ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <p className="pix-validade">⏱️ Código válido por <strong>15 minutos</strong></p>
        </div>
      );
    }

    if (metodoPagamento === 'PagarEntrega') {
      return (
        <div className="checkout-painel-pagamento painel-entrega">
          <div className="entrega-icone">🤝</div>
          <p className="painel-titulo">Pagar na Entrega</p>
          <p className="entrega-msg">
            Você pagará <strong>{formatCurrency(totalFinal)}</strong> diretamente ao
            {tipoAtendimento === 'Presencial' ? ' garçom' : ' entregador'} no momento do
            {tipoAtendimento === 'Presencial' ? ' atendimento' : ' recebimento'}.
          </p>
          <p className="entrega-aviso">
            💡 Tenha o troco se for pagar em dinheiro.
          </p>
        </div>
      );
    }

    return null;
  };

  // ── Renderização por etapa ─────────────────────────────────────
  return (
    <div className="checkout-overlay" onClick={onFechar}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>

        {/* Cabeçalho */}
        {etapa < 3 && (
          <div className="checkout-header">
            <div className="checkout-steps">
              <span className={etapa === 1 ? 'step ativo' : 'step concluido'}>1 Entrega</span>
              <span className="step-divider">›</span>
              <span className={etapa === 2 ? 'step ativo' : etapa > 2 ? 'step concluido' : 'step'}>
                2 Pagamento
              </span>
              <span className="step-divider">›</span>
              <span className="step">3 Confirmar</span>
            </div>
            <button className="checkout-fechar" onClick={onFechar}>✕</button>
          </div>
        )}

        {/* ══ ETAPA 1: Tipo de Atendimento ══════════════════════ */}
        {etapa === 1 && (
          <div className="checkout-corpo">
            <h2>Como deseja receber?</h2>
            <p className="checkout-subtitulo">
              Período do pedido: <strong>
                {periodoAtual === 'Almoco' ? '☀️ Almoço' : '🌙 Jantar'}
              </strong>
            </p>

            <div className="checkout-opcoes">
              {TIPOS_ATENDIMENTO.map(tipo => (
                <button
                  key={tipo.valor}
                  className={`checkout-opcao ${tipoAtendimento === tipo.valor ? 'selecionado' : ''}`}
                  onClick={() => setTipoAtendimento(tipo.valor)}
                >
                  <span className="opcao-icone">{tipo.icone}</span>
                  <div className="opcao-texto">
                    <strong>{tipo.label}</strong>
                    <small>{tipo.descricao}</small>
                  </div>
                  <span className="opcao-check">
                    {tipoAtendimento === tipo.valor ? '✔' : ''}
                  </span>
                </button>
              ))}
            </div>

            {/* Resumo de valores */}
            <div className="checkout-resumo">
              <div className="checkout-linha">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="checkout-linha taxa">
                <span>Taxa de entrega</span>
                <span>{taxa === 0 ? 'Grátis' : formatCurrency(taxa)}</span>
              </div>
              <div className="checkout-linha total">
                <span>Total</span>
                <strong>{formatCurrency(totalFinal)}</strong>
              </div>
            </div>

            <button
              className="checkout-btn-primario"
              onClick={() => setEtapa(2)}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ══ ETAPA 2: Método de Pagamento ══════════════════════ */}
        {etapa === 2 && (
          <div className="checkout-corpo">
            <h2>Como vai pagar?</h2>

            <div className="checkout-opcoes">
              {METODOS_PAGAMENTO.map(mp => (
                <button
                  key={mp.valor}
                  className={`checkout-opcao ${metodoPagamento === mp.valor ? 'selecionado' : ''}`}
                  onClick={() => setMetodoPagamento(mp.valor)}
                >
                  <span className="opcao-icone">{mp.icone}</span>
                  <div className="opcao-texto">
                    <strong>{mp.label}</strong>
                    <small>{mp.descricao}</small>
                  </div>
                  <span className="opcao-check">
                    {metodoPagamento === mp.valor ? '✔' : ''}
                  </span>
                </button>
              ))}
            </div>

            {/* Painel dinâmico de acordo com o método selecionado */}
            {renderPainelPagamento()}

            {/* Resumo compacto */}
            <div className="checkout-resumo">
              <div className="checkout-linha">
                <span>Subtotal dos itens</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="checkout-linha taxa">
                <span>
                  {tipoAtendimento === 'Presencial'      && '🏪 Presencial'}
                  {tipoAtendimento === 'DeliveryProprio' && '🛵 Taxa de entrega'}
                  {tipoAtendimento === 'DeliveryApp'     && `📱 Taxa app (${new Date().getHours() < 18 ? '4%' : '6%'})`}
                </span>
                <span>{taxa === 0 ? 'Grátis' : formatCurrency(taxa)}</span>
              </div>
              <div className="checkout-linha total">
                <span>Total a pagar</span>
                <strong>{formatCurrency(totalFinal)}</strong>
              </div>
            </div>

            {erro && <div className="checkout-erro">⚠️ {erro}</div>}

            <div className="checkout-acoes">
              <button className="checkout-btn-voltar" onClick={() => setEtapa(1)}>
                ← Voltar
              </button>
              <button
                className="checkout-btn-primario"
                onClick={handleConfirmar}
                disabled={enviando}
              >
                {enviando ? '⏳ Enviando...' : '✔ Confirmar Pedido'}
              </button>
            </div>
          </div>
        )}

        {/* ══ ETAPA 3: Pedido Confirmado ════════════════════════ */}
        {etapa === 3 && pedidoFinalizado && (
          <div className="checkout-sucesso">
            <div className="sucesso-icone">🎉</div>
            <h2>Pedido Confirmado!</h2>
            <p>Seu pedido foi recebido e já está sendo preparado.</p>

            <div className="sucesso-detalhes">
              <div className="sucesso-linha">
                <span>Nº do Pedido</span>
                <strong>#{pedidoFinalizado.id}</strong>
              </div>
              <div className="sucesso-linha">
                <span>Total pago</span>
                <strong>{formatCurrency(pedidoFinalizado.totalFinal)}</strong>
              </div>
              <div className="sucesso-linha">
                <span>Status</span>
                <span className="sucesso-status">📋 Recebido</span>
              </div>
            </div>

            <button className="checkout-btn-primario" onClick={onFechar}>
              Fechar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutModal;