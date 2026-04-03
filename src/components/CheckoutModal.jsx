import React, { useState, useEffect } from 'react';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { authService } from '../services/authService';
import { apiFetch } from '../api/api';
import { formatCurrency } from '../utils/formatters';
import './CheckoutModal.css';

// ── Espelha a lógica do backend (AtendimentoDeliveryApp.CalcularTaxa) ──
const calcularTaxaLocal = (tipoAtendimento, subtotal) => {
  switch (tipoAtendimento) {
    case 'Presencial':    return 0;
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
    descricao: `Entregue via parceiro (iFood, etc.). Taxa: ${
      new Date().getHours() < 18 ? '4% (diurno)' : '6% (noturno)'
    } sobre o subtotal.`,
  },
];

const METODOS_PAGAMENTO = [
  { valor: 'Dinheiro',       label: 'Dinheiro',        icone: '💵' },
  { valor: 'CartaoDebito',   label: 'Cartão de Débito', icone: '💳' },
  { valor: 'CartaoCredito',  label: 'Cartão de Crédito',icone: '💳' },
  { valor: 'Pix',            label: 'Pix',              icone: '⚡' },
];

const CheckoutModal = ({ visivel, onFechar }) => {
  const { itens, subtotal, periodoAtual, limparCarrinho } = useCarrinho();
  const usuario = authService.getUsuarioLogado();

  const [tipoAtendimento, setTipoAtendimento]   = useState('Presencial');
  const [metodoPagamento, setMetodoPagamento]   = useState('Pix');
  const [etapa, setEtapa]                       = useState(1); // 1=atendimento, 2=pagamento, 3=confirmado
  const [enviando, setEnviando]                 = useState(false);
  const [erro, setErro]                         = useState('');
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);

  // Recalcula taxa ao vivo quando o tipo muda
  const taxa       = calcularTaxaLocal(tipoAtendimento, subtotal);
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
        setMetodoPagamento('Pix');
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
      usuarioId:       usuario.id,
      periodo:         periodoAtual,          // 'Almoco' ou 'Jantar'
      tipoAtendimento: tipoAtendimento,        // 'Presencial' | 'DeliveryProprio' | 'DeliveryApp'
      metodoPagamento: metodoPagamento,        // 'Pix' | 'Dinheiro' | etc
      itens: itens.map(i => ({
        itemCardapioId: i.id,
        quantidade:     i.quantidade,
        observacao:     i.observacao || '',
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
                  </div>
                  <span className="opcao-check">
                    {metodoPagamento === mp.valor ? '✔' : ''}
                  </span>
                </button>
              ))}
            </div>

            {/* Resumo compacto */}
            <div className="checkout-resumo">
              <div className="checkout-linha">
                <span>Subtotal dos itens</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="checkout-linha taxa">
                <span>
                  {tipoAtendimento === 'Presencial'    && '🏪 Presencial'}
                  {tipoAtendimento === 'DeliveryProprio' && '🛵 Taxa de entrega'}
                  {tipoAtendimento === 'DeliveryApp'   && `📱 Taxa app (${new Date().getHours() < 18 ? '4%' : '6%'})`}
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