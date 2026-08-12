'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ListOrdered, Play, Pause, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function QueuePage() {
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleProcessBatch = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/v1/queue/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchLimit: 25 }),
      });
      const data = await res.json();
      setLastResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
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
                <ListOrdered className="w-7 h-7 text-emerald-400" />
                Fila de Envio & Rate Limiter WABA
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Motor assíncrono com verificação prévia de Opt-Out LGPD e retentativas controladas.
              </p>
            </div>

            <button
              onClick={handleProcessBatch}
              disabled={processing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
              <span>Processar Lote Manualmente</span>
            </button>
          </div>

          {/* Engine Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Status do Motor de Fila</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xl font-black text-white">ATIVO & MONITORANDO</span>
              </div>
              <p className="text-[11px] text-slate-400">Taxa atual: 60 mensagens por minuto</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Proteção LGPD na Fila</span>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                <ShieldCheck className="w-5 h-5" /> 100% Verificado
              </div>
              <p className="text-[11px] text-slate-400">Contatos com Opt-out são descartados automaticamente</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Algoritmo de Retentativa</span>
              <div className="text-xl font-black text-purple-300">Exponential Backoff</div>
              <p className="text-[11px] text-slate-400">Até 3 tentativas em erros temporários de rede</p>
            </div>
          </div>

          {/* Execution Log */}
          {lastResult && (
            <div className="glass-panel p-6 rounded-3xl space-y-3">
              <h3 className="font-bold text-sm text-emerald-300">Último Ciclo de Processamento da Fila:</h3>
              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
