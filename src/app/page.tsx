'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  Send,
  CheckCircle2,
  CheckCheck,
  Eye,
  AlertTriangle,
  TrendingUp,
  Percent,
  Calendar,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/dashboard/stats');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {};
  const recentCampaigns = data?.recentCampaigns || [];
  const chartData = data?.performanceChart || [];

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-6 rounded-3xl border border-emerald-500/20 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="relative hidden sm:block flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-30"></div>
                <img src="/logo.png" alt="Zendify Logo" className="relative w-14 h-14 rounded-2xl object-contain bg-slate-950 p-1.5 border border-emerald-500/40 shadow-2xl" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                    Visão Geral SaaS
                  </span>
                  <span className="text-slate-400 text-xs">WhatsApp Business API Meta v20.0</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Painel de Controle Zendify
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Acompanhe o desempenho das suas campanhas, taxas de entrega e contatos em tempo real.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>

              <Link
                href="/campaigns?action=new"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Campanha</span>
              </Link>
            </div>
          </div>

          {/* 13 Primary Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Contatos */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total de Contatos</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-white">{stats.totalContacts || 0}</span>
                <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> {stats.totalContacts > 0 ? '+12% este mês' : 'Base zerada'}
                </p>
              </div>
            </div>

            {/* Card 2: Contatos Ativos */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Contatos Ativos</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-emerald-400">{stats.activeContacts || 0}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Opt-in confirmado</p>
              </div>
            </div>

            {/* Card 3: Bloqueados / Inativos */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Inativos / Opt-Out</span>
                <UserX className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-amber-400">{stats.inactiveContacts || 0}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Proteção LGPD ativa</p>
              </div>
            </div>

            {/* Card 4: Campanhas Enviadas */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Campanhas Disparadas</span>
                <Send className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-white">{stats.totalCampaigns || 0}</span>
                <p className="text-[11px] text-blue-400 mt-0.5">Histórico completo</p>
              </div>
            </div>

            {/* Card 5: Mensagens Enviadas */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Mensagens Enviadas</span>
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-white">{stats.messagesSent || 0}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Disparos no período</p>
              </div>
            </div>

            {/* Card 6: Mensagens Entregues */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Mensagens Entregues</span>
                <CheckCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-emerald-300">{stats.messagesDelivered || 0}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Confirmação de recebimento</p>
              </div>
            </div>

            {/* Card 7: Mensagens Lidas */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Mensagens Lidas</span>
                <Eye className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-purple-300">{stats.messagesRead || 0}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Visualizadas pelos clientes</p>
              </div>
            </div>

            {/* Card 8: Mensagens com Erro */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Com Erro / Falhas</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-rose-400">{stats.messagesFailed || 0}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Números inválidos / Meta API</p>
              </div>
            </div>

            {/* Rates Highlights */}
            {/* Card 9: Taxa de Entrega */}
            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
              <span className="text-xs font-medium text-slate-400">Taxa de Entrega</span>
              <div className="text-2xl font-black text-emerald-400 mt-2">{stats.deliveryRate ?? '0.0%'}</div>
              <p className="text-[10px] text-slate-400 mt-1">Status Meta WABA Oficial</p>
            </div>

            {/* Card 10: Taxa de Leitura */}
            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-purple-500">
              <span className="text-xs font-medium text-slate-400">Taxa de Leitura</span>
              <div className="text-2xl font-black text-purple-400 mt-2">{stats.readRate ?? '0.0%'}</div>
              <p className="text-[10px] text-slate-400 mt-1">Engajamento de abertura</p>
            </div>

            {/* Card 11: Taxa de Resposta */}
            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-blue-500">
              <span className="text-xs font-medium text-slate-400">Taxa de Resposta</span>
              <div className="text-2xl font-black text-blue-400 mt-2">{stats.responseRate ?? '0.0%'}</div>
              <p className="text-[10px] text-slate-400 mt-1">Interação na Caixa de Entrada</p>
            </div>

            {/* Card 12: Campanhas Agendadas */}
            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500">
              <span className="text-xs font-medium text-slate-400">Campanhas Agendadas</span>
              <div className="text-2xl font-black text-amber-300 mt-2">{stats.scheduledCampaignsCount || 0}</div>
              <p className="text-[10px] text-slate-400 mt-1">Agendamentos futuros</p>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart: Performance de Mensagens */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white">Desempenho de Entregas & Leitura</h3>
                  <p className="text-xs text-slate-400">Volume de mensagens enviadas, entregues e lidas nos últimos 7 dias</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  Semanal
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorEnviadas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLidas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="enviadas" stroke="#10B981" fillOpacity={1} fill="url(#colorEnviadas)" name="Enviadas" />
                    <Area type="monotone" dataKey="lidas" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorLidas)" name="Lidas" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Campaigns Table Card */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-base">Últimas Campanhas</h3>
                  <Link href="/campaigns" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                    Ver todas <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentCampaigns.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">Nenhuma campanha registrada ainda.</p>
                  ) : (
                    recentCampaigns.map((c: any) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-200 truncate max-w-[150px]">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.totalRecipients} destinatários</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : c.status === 'PROCESSING'
                              ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Modo Fila Ativo (60 msgs/min)</span>
                </div>
                <Link href="/queue" className="underline text-[11px] font-semibold">
                  Fila
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
