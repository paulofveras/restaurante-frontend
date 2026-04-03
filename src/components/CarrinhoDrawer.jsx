import React from 'react';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { formatCurrency } from '../utils/formatters';
import './CarrinhoDrawer.css';

const CarrinhoDrawer = () => {
  const {
    itens, aberto, setAberto,
    removerItem, alterarQuantidade, alterarObservacao,
    subtotal, totalItens, limparCarrinho,
  } = useCarrinho();

  if (!aberto) return null;

  return (
    <>
      {/* Overlay escuro atrás do drawer */}
      <div className="carrinho-overlay" onClick={() => setAberto(false)} />

      {/* Painel lateral */}
      <div className="carrinho-drawer">

        {/* Cabeçalho */}
        <div className="carrinho-header">
          <h2>🛒 Meu Pedido</h2>
          <button className="carrinho-fechar" onClick={() => setAberto(false)}>✕</button>
        </div>

        {/* Lista de itens */}
        <div className="carrinho-lista">
          {itens.length === 0 ? (
            <div className="carrinho-vazio">
              <span>🍽️</span>
              <p>Seu carrinho está vazio.</p>
              <small>Adicione itens do cardápio!</small>
            </div>
          ) : (
            itens.map(item => (
              <div key={item.id} className="carrinho-item">

                {/* Imagem */}
                <img
                  src={item.imagemUrl || '/img/prato-padrao.jpg'}
                  alt={item.nome}
                  className="carrinho-item-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/img/prato-padrao.jpg'; }}
                />

                {/* Informações */}
                <div className="carrinho-item-info">
                  <div className="carrinho-item-topo">
                    <span className="carrinho-item-nome">{item.nome}</span>
                    <button className="carrinho-item-remover" onClick={() => removerItem(item.id)}>
                      🗑️
                    </button>
                  </div>

                  {/* Badge de sugestão */}
                  {item.eSugestao && (
                    <span className="carrinho-badge-sugestao">⭐ Sugestão -20%</span>
                  )}

                  {/* Controle de quantidade */}
                  <div className="carrinho-item-rodape">
                    <div className="carrinho-quantidade">
                      <button onClick={() => alterarQuantidade(item.id, -1)}>−</button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => alterarQuantidade(item.id, +1)}>+</button>
                    </div>
                    <div className="carrinho-item-preco">
                      {item.eSugestao && (
                        <span className="carrinho-preco-riscado">
                          {formatCurrency(item.preco * item.quantidade)}
                        </span>
                      )}
                      <span className="carrinho-preco-final">
                        {formatCurrency(item.precoComDesconto * item.quantidade)}
                      </span>
                    </div>
                  </div>

                  {/* Observação */}
                  <input
                    className="carrinho-obs"
                    placeholder="Observação (ex: sem cebola)"
                    value={item.observacao}
                    onChange={e => alterarObservacao(item.id, e.target.value)}
                    maxLength={100}
                  />
                </div>

              </div>
            ))
          )}
        </div>

        {/* Rodapé com subtotal e botão */}
        {itens.length > 0 && (
          <div className="carrinho-rodape">
            <div className="carrinho-subtotal">
              <span>Subtotal ({totalItens} {totalItens === 1 ? 'item' : 'itens'})</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <small className="carrinho-aviso">
              * Taxas de entrega calculadas no próximo passo
            </small>

            {/* Este botão dispara o Checkout — implementado no Passo 3 */}
            <button
              className="carrinho-btn-checkout"
              onClick={() => {
                setAberto(false);
                // No Passo 3 vamos disparar o modal de checkout aqui
                window.dispatchEvent(new CustomEvent('abrirCheckout'));
              }}
            >
              Finalizar Pedido →
            </button>

            <button className="carrinho-btn-limpar" onClick={limparCarrinho}>
              Esvaziar carrinho
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default CarrinhoDrawer;