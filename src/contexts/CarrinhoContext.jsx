import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify"; // ✅ Adicione este import

// ─────────────────────────────────────────────────────────
// O Context em si — exportamos o hook useCarrinho para
// qualquer componente usar sem precisar importar o context
// ─────────────────────────────────────────────────────────
const CarrinhoContext = createContext(null);

export const useCarrinho = () => {
  const ctx = useContext(CarrinhoContext);
  if (!ctx)
    throw new Error("useCarrinho deve ser usado dentro de <CarrinhoProvider>");
  return ctx;
};

// ─────────────────────────────────────────────────────────
// Estrutura de um item no carrinho:
// {
//   id: number,           ← id do ItemCardapio
//   nome: string,
//   preco: number,        ← preço base
//   precoComDesconto: number, ← preço aplicando 20% se for sugestão
//   eSugestao: boolean,
//   imagemUrl: string,
//   periodo: 'Almoco' | 'Jantar',
//   quantidade: number,
//   observacao: string,
// }
// ─────────────────────────────────────────────────────────

export const CarrinhoProvider = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [aberto, setAberto] = useState(false); // controla o drawer lateral

  // ── Adicionar ou incrementar item ──────────────────────
  const adicionarItem = useCallback((prato, eSugestao = false) => {
    setItens((prev) => {
      // ✅ VALIDAÇÃO: Verificar se está misturando períodos
      if (prev.length > 0) {
        const periodoCarrinho = prev[0].periodo;
        const periodoNovo = prato.periodo;

        if (periodoCarrinho !== periodoNovo) {
          const periodoTexto =
            periodoCarrinho === "Almoco" ? "almoço" : "jantar";
          const periodoNovoTexto =
            periodoNovo === "Almoco" ? "almoço" : "jantar";

          toast.error(
            `Seu carrinho contém pratos de ${periodoTexto}. Não é possível adicionar pratos de ${periodoNovoTexto}!`,
            {
              position: "top-center",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
            },
          );

          return prev; // ⚠️ Retorna o carrinho sem modificar
        }
      }

      // ✅ Código original: verificar se já existe
      const existe = prev.find((i) => i.id === prato.id);
      if (existe) {
        // Já está no carrinho: apenas incrementa
        return prev.map((i) =>
          i.id === prato.id ? { ...i, quantidade: i.quantidade + 1 } : i,
        );
      }

      // Item novo: adiciona com quantidade 1
      return [
        ...prev,
        {
          id: prato.id,
          nome: prato.nome,
          preco: prato.preco,
          precoComDesconto: eSugestao ? prato.preco * 0.8 : prato.preco,
          eSugestao,
          imagemUrl: prato.imagemUrl,
          periodo: prato.periodo,
          quantidade: 1,
          observacao: "",
        },
      ];
    });
  }, []);

  // ── Remover completamente um item ──────────────────────
  const removerItem = useCallback((id) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // ── Alterar quantidade (mínimo 1) ──────────────────────
  const alterarQuantidade = useCallback((id, delta) => {
    setItens(
      (prev) =>
        prev
          .map((i) =>
            i.id === id ? { ...i, quantidade: i.quantidade + delta } : i,
          )
          .filter((i) => i.quantidade > 0), // remove se chegar a 0
    );
  }, []);

  // ── Alterar observação de um item ──────────────────────
  const alterarObservacao = useCallback((id, texto) => {
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, observacao: texto } : i)),
    );
  }, []);

  // ── Esvaziar o carrinho (após pedido confirmado) ───────
  const limparCarrinho = useCallback(() => {
    setItens([]);
  }, []);

  // ── Cálculos derivados ─────────────────────────────────
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const subtotal = itens.reduce(
    (acc, i) => acc + i.precoComDesconto * i.quantidade,
    0,
  );
  const periodoAtual = itens[0]?.periodo ?? null; // impede mistura almoço/jantar

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        aberto,
        setAberto,
        adicionarItem,
        removerItem,
        alterarQuantidade,
        alterarObservacao,
        limparCarrinho,
        totalItens,
        subtotal,
        periodoAtual,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};
