import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import { relatorioService } from '../services/relatorioService';
import { apiFetch } from '../api/api';
import { formatCurrency } from '../utils/formatters';
import './Relatorios.css';

// ── Paleta do Sol do Cerrado ──────────────────────────────
const CORES = ['#D4AF37', '#C97458', '#2C3E6B', '#10b981', '#8b5cf6'];

const LABEL_ATENDIMENTO = {
  'Salão (Presencial)': { icone: '🏪', cor: '#D4AF37' },
  'Delivery Próprio':   { icone: '🛵', cor: '#C97458' },
  'iFood / Apps':       { icone: '📱', cor: '#2C3E6B' },
};

// ── Tooltip customizado ───────────────────────────────────
const TooltipMoeda = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rel-tooltip">
      <p className="rel-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{
            p.name.toLowerCase().includes('fat') || p.name.toLowerCase().includes('total')
              ? formatCurrency(p.value)
              : p.value
          }</strong>
        </p>
      ))}
    </div>
  );
};

// ── Componente de KPI Card ────────────────────────────────
const KpiCard = ({ icone, titulo, valor, sub, cor, delay }) => (
  <motion.div
    className="rel-kpi"
    style={{ borderTop: `4px solid ${cor}` }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div className="rel-kpi-icone" style={{ background: `${cor}18` }}>{icone}</div>
    <div className="rel-kpi-corpo">
      <p className="rel-kpi-titulo">{titulo}</p>
      <p className="rel-kpi-valor" style={{ color: cor }}>{valor}</p>
      {sub && <p className="rel-kpi-sub">{sub}</p>}
    </div>
  </motion.div>
);

// ── Componente principal ──────────────────────────────────
const Relatorios = () => {
  const [faturamento, setFaturamento]           = useState([]);
  const [itensMaisVendidos, setItensMaisVendidos] = useState([]);
  const [pedidosDia, setPedidosDia]             = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [periodoFiltro, setPeriodoFiltro]       = useState(30); // dias

  useEffect(() => { carregarRelatorios(); }, [periodoFiltro]);

  const carregarRelatorios = async () => {
    setLoading(true);
    try {
      const dataFim    = new Date();
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - periodoFiltro);

      const ini = dataInicio.toISOString().split('T')[0];
      const fim = dataFim.toISOString().split('T')[0];

      const [dadosFat, dadosItens, dadosPedidos] = await Promise.all([
        relatorioService.faturamento(ini, fim),
        relatorioService.itensMaisVendidos(ini, fim),
        // Busca todos os pedidos do período para montar o gráfico de linha
        apiFetch('/Pedido').then(r => r.ok ? r.json() : []),
      ]);

      setFaturamento(dadosFat);
      setItensMaisVendidos(dadosItens.slice(0, 10));

      // Agrupa pedidos por dia para o gráfico de linha
      const porDia = {};
      const hoje = new Date();
      for (let i = periodoFiltro; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        porDia[key] = { data: key, pedidos: 0, faturamento: 0 };
      }
      dadosPedidos.forEach(p => {
        const key = new Date(p.dataHoraPedido)
          .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (porDia[key]) {
          porDia[key].pedidos++;
          porDia[key].faturamento += p.totalFinal;
        }
      });
      setPedidosDia(Object.values(porDia));

    } catch (e) {
      console.error('Erro ao carregar relatórios:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── KPIs calculados ─────────────────────────────────────
  const totalFaturamento = faturamento.reduce((s, i) => s + i.faturamento, 0);
  const totalPedidos     = faturamento.reduce((s, i) => s + i.totalPedidos, 0);
  const ticketMedio      = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;
  const topItem          = itensMaisVendidos[0];

  // ── Dados do gráfico de pizza (faturamento por canal) ───
  const dataPizza = faturamento.map((item, i) => ({
    name:  item.tipoAtendimento,
    value: Number(item.faturamento.toFixed(2)),
    cor:   CORES[i % CORES.length],
  }));

  // ── Dados do bar chart (Top 8 itens) ────────────────────
  const dataBarras = itensMaisVendidos.slice(0, 8).map(i => ({
    nome:     i.nome.length > 18 ? i.nome.slice(0, 16) + '…' : i.nome,
    nomeCompleto: i.nome,
    vendidos: i.totalVendido,
    comDesc:  i.vendidoComDesconto,
    semDesc:  i.vendidoSemDesconto,
  }));

  if (loading) {
    return (
      <div className="relatorios">
        <header className="page-header">
          <h1>Relatórios</h1>
          <p>Carregando dados...</p>
        </header>
        <div className="rel-loading">
          <div className="rel-spinner">☀️</div>
          <p>Processando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relatorios">
      {/* ── HEADER ── */}
      <header className="page-header">
        <div>
          <h1>📊 Relatórios</h1>
          <p>Análise de desempenho — últimos {periodoFiltro} dias</p>
        </div>
        {/* Filtro de período */}
        <div className="rel-filtros">
          {[7, 15, 30, 60].map(d => (
            <button
              key={d}
              className={`rel-filtro-btn ${periodoFiltro === d ? 'ativo' : ''}`}
              onClick={() => setPeriodoFiltro(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      </header>

      {/* ── KPIs ── */}
      <div className="rel-kpis">
        <KpiCard icone="💰" titulo="Faturamento Total"    valor={formatCurrency(totalFaturamento)} cor="#D4AF37" delay={0}    />
        <KpiCard icone="📝" titulo="Total de Pedidos"     valor={totalPedidos}                      cor="#C97458" delay={0.08} />
        <KpiCard icone="🎯" titulo="Ticket Médio"         valor={formatCurrency(ticketMedio)}        cor="#2C3E6B" delay={0.16} />
        <KpiCard icone="⭐" titulo="Item Mais Vendido"    valor={topItem?.nome ?? '—'}  sub={topItem ? `${topItem.totalVendido} unidades` : ''} cor="#10b981" delay={0.24} />
      </div>

      {/* ── GRÁFICO DE LINHA: Evolução diária ── */}
      <motion.div
        className="rel-card rel-card-largo"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="rel-card-header">
          <h2>📈 Evolução Diária de Pedidos e Faturamento</h2>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={pedidosDia} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradPed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C97458" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#C97458" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" />
            <XAxis
              dataKey="data"
              tick={{ fontSize: 11, fill: '#8a7560' }}
              interval={Math.floor(pedidosDia.length / 7)}
            />
            <YAxis yAxisId="fat" orientation="right" tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8a7560' }} />
            <YAxis yAxisId="ped" orientation="left"  tick={{ fontSize: 11, fill: '#8a7560' }} />
            <Tooltip content={<TooltipMoeda />} />
            <Legend />
            <Area yAxisId="fat" type="monotone" dataKey="faturamento" name="Faturamento (R$)" stroke="#D4AF37" fill="url(#gradFat)" strokeWidth={2} dot={false} />
            <Area yAxisId="ped" type="monotone" dataKey="pedidos"     name="Pedidos"           stroke="#C97458" fill="url(#gradPed)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── LINHA 2: Pizza + Barras verticais ── */}
      <div className="rel-linha-2">

        {/* Pizza — Faturamento por canal */}
        <motion.div
          className="rel-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="rel-card-header">
            <h2>🥧 Faturamento por Canal</h2>
          </div>
          {dataPizza.length === 0 ? (
            <p className="rel-sem-dados">Sem dados no período</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={dataPizza}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${(LABEL_ATENDIMENTO[name]?.icone ?? '')} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {dataPizza.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legenda manual */}
              <div className="rel-pizza-legenda">
                {dataPizza.map((d, i) => (
                  <div key={i} className="rel-legenda-item">
                    <span className="rel-legenda-bolinha" style={{ background: d.cor }} />
                    <span className="rel-legenda-nome">{LABEL_ATENDIMENTO[d.name]?.icone} {d.name}</span>
                    <span className="rel-legenda-valor">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Tabela resumo por canal */}
        <motion.div
          className="rel-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="rel-card-header">
            <h2>📋 Resumo por Canal</h2>
          </div>
          <table className="rel-tabela">
            <thead>
              <tr>
                <th>Canal</th>
                <th>Pedidos</th>
                <th>Faturamento</th>
                <th>Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              {faturamento.length === 0 ? (
                <tr><td colSpan={4} className="rel-sem-dados">Sem dados</td></tr>
              ) : (
                faturamento.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <span className="rel-canal-label">
                        {LABEL_ATENDIMENTO[item.tipoAtendimento]?.icone ?? '📦'}{' '}
                        {item.tipoAtendimento}
                      </span>
                    </td>
                    <td className="rel-num">{item.totalPedidos}</td>
                    <td className="rel-num rel-destaque">{formatCurrency(item.faturamento)}</td>
                    <td className="rel-num">
                      {formatCurrency(item.totalPedidos > 0 ? item.faturamento / item.totalPedidos : 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {faturamento.length > 0 && (
              <tfoot>
                <tr className="rel-total-row">
                  <td><strong>Total</strong></td>
                  <td className="rel-num"><strong>{totalPedidos}</strong></td>
                  <td className="rel-num rel-destaque"><strong>{formatCurrency(totalFaturamento)}</strong></td>
                  <td className="rel-num"><strong>{formatCurrency(ticketMedio)}</strong></td>
                </tr>
              </tfoot>
            )}
          </table>
        </motion.div>
      </div>

      {/* ── GRÁFICO DE BARRAS: Top 8 itens mais vendidos ── */}
      <motion.div
        className="rel-card rel-card-largo"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="rel-card-header">
          <h2>🍽️ Top 8 Itens Mais Vendidos</h2>
          <span className="rel-card-sub">com vs. sem desconto da Sugestão do Chef</span>
        </div>
        {dataBarras.length === 0 ? (
          <p className="rel-sem-dados">Sem dados no período</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataBarras} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" vertical={false} />
              <XAxis
                dataKey="nome"
                tick={{ fontSize: 11, fill: '#8a7560' }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#8a7560' }} />
              <Tooltip content={<TooltipMoeda />} />
              <Legend verticalAlign="top" height={32} />
              <Bar dataKey="semDesc" name="Sem desconto" fill="#D4AF37" radius={[4,4,0,0]} stackId="a" />
              <Bar dataKey="comDesc" name="Com desconto (⭐ Chef)" fill="#C97458" radius={[4,4,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── TABELA: Top 10 detalhada ── */}
      <motion.div
        className="rel-card rel-card-largo"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="rel-card-header">
          <h2>📊 Ranking Completo de Itens</h2>
        </div>
        <table className="rel-tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Prato</th>
              <th>Período</th>
              <th>Total Vendido</th>
              <th>⭐ Com Desconto</th>
              <th>Sem Desconto</th>
            </tr>
          </thead>
          <tbody>
            {itensMaisVendidos.length === 0 ? (
              <tr><td colSpan={6} className="rel-sem-dados">Sem dados no período selecionado</td></tr>
            ) : (
              itensMaisVendidos.map((item, i) => (
                <tr key={i}>
                  <td>
                    <span className={`rel-rank ${i < 3 ? 'rel-rank-top' : ''}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
                    </span>
                  </td>
                  <td className="rel-item-nome">{item.nome}</td>
                  <td>
                    <span className={`periodo-badge ${item.periodo === 'Almoco' || item.periodo === 0 ? 'almoco' : 'jantar'}`}>
                      {item.periodo === 'Almoco' || item.periodo === 0 ? '☀️ Almoço' : '🌙 Jantar'}
                    </span>
                  </td>
                  <td className="rel-num rel-destaque"><strong>{item.totalVendido}</strong></td>
                  <td className="rel-num">{item.vendidoComDesconto ?? 0}</td>
                  <td className="rel-num">{item.vendidoSemDesconto ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

    </div>
  );
};

export default Relatorios;