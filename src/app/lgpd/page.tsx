'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ShieldCheck, Lock, Trash2, Download, CheckCircle, AlertTriangle, UserX } from 'lucide-react';

export default function LgpdPage() {
  const [optOuts, setOptOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/lgpd')
      .then((res) => res.json())
      .then((data) => setOptOuts(data.optOuts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              Módulo de Compliance LGPD & Opt-Out
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Garantia de conformidade total com a Lei Geral de Proteção de Dados: consentimento, bloqueio imediato e eliminação definitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Bloqueio Automático em Disparos</span>
              <div className="text-xl font-black text-emerald-400">100% GARANTIDO</div>
              <p className="text-[11px] text-slate-400">A fila valida o banco de opt-out antes de enviar qualquer mensagem.</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Opt-out por Palavra-Chave</span>
              <div className="text-xl font-black text-white">PARAR / CANCELAR</div>
              <p className="text-[11px] text-slate-400">Processado em tempo real via Webhook oficial Meta API.</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Direito ao Esquecimento</span>
              <div className="text-xl font-black text-rose-400">Exclusão Definitiva</div>
              <p className="text-[11px] text-slate-400">Com registro de auditoria anônimo para compliance fiscal.</p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 font-bold text-sm text-white flex items-center gap-2">
              <UserX className="w-4 h-4 text-amber-400" />
              <span>Lista Oficial de Contatos em Opt-Out / Descadasctrados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/40 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Telefone (E.164)</th>
                    <th className="p-4">Motivo do Opt-Out</th>
                    <th className="p-4">Origem</th>
                    <th className="p-4">Data da Solicitação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 font-sans">
                        Carregando registros de Opt-Out...
                      </td>
                    </tr>
                  ) : optOuts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 font-sans">
                        Nenhum opt-out registrado no momento.
                      </td>
                    </tr>
                  ) : (
                    optOuts.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-4 font-semibold text-rose-300">{o.phone}</td>
                        <td className="p-4 text-slate-300 font-sans">{o.reason || 'Solicitação direta do usuário'}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {o.source}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
