import React from 'react';
import { useCarrinho } from '../contexts/CarrinhoContext';
import './CarrinhoBotao.css';

const CarrinhoBotao = () => {
  const { totalItens, setAberto, subtotal } = useCarrinho();
  const { formatCurrency } = require('../utils/formatters');

  // Só aparece se houver itens
  if (totalItens === 0) return null;

  return (
    <button className="carrinho-fab" onClick={() => setAberto(true)}>
      <span className="carrinho-fab-icone">🛒</span>
      <div className="carrinho-fab-info">
        <span className="carrinho-fab-count">
          {totalItens} {totalItens === 1 ? 'item' : 'itens'}
        </span>
        <span className="carrinho-fab-total">{formatCurrency(subtotal)}</span>
      </div>
    </button>
  );
};

export default CarrinhoBotao;