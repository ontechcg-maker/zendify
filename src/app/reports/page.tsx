'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { BarChart3, Download, CheckCircle2, Eye, MessageSquare, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
  const handleExportReport = () => {
    alert('Relatório consolidado exportado em formato CSV com sucesso!');
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-emerald-400" />
                Relatório de Campanhas & Analytics
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Análise detalhada de taxas de entrega, conversão e métricas de desempenho por disparo.
              </p>
            </div>

            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition w-fit"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Relatório Consolidado (CSV)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl space-y-1 border-l-4 border-l-emerald-500">
              <span className="text-xs text-slate-400 font-medium">Taxa Média de Entrega</span>
              <div className="text-3xl font-black text-emerald-400">98.5%</div>
              <p className="text-[10px] text-slate-400">Excelente qualidade WABA</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-1 border-l-4 border-l-purple-500">
              <span className="text-xs text-slate-400 font-medium">Taxa Média de Leitura</span>
              <div className="text-3xl font-black text-purple-400">82.4%</div>
              <p className="text-[10px] text-slate-400">Visualizações confirmadas</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-1 border-l-4 border-l-blue-500">
              <span className="text-xs text-slate-400 font-medium">Taxa Média de Resposta</span>
              <div className="text-3xl font-black text-blue-400">42.8%</div>
              <p className="text-[10px] text-slate-400">Respostas na caixa de entrada</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-1 border-l-4 border-l-amber-500">
              <span className="text-xs text-slate-400 font-medium">Retorno Geral (ROI)</span>
              <div className="text-3xl font-black text-amber-300">4.8x</div>
              <p className="text-[10px] text-slate-400">Conversão de vendas</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-base text-white">Relatório Detalhado por Campanha</h3>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>Campanha de Lançamento VIP</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">COMPLETED</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-slate-300 font-mono pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">ENVIADAS</span>
                  <span>5 / 5</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">ENTREGUES</span>
                  <span className="text-emerald-400">5 (100%)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">LIDAS</span>
                  <span className="text-purple-400">4 (80%)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">RESPOSTAS</span>
                  <span className="text-blue-400">2 (40%)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">ERROS</span>
                  <span className="text-slate-500">0 (0%)</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
