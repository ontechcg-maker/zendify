'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ScrollText, Search, ShieldCheck, Clock, User } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/lgpd')
      .then((res) => res.json())
      .then((data) => setLogs(data.auditLogs || []))
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
              <ScrollText className="w-7 h-7 text-emerald-400" />
              Logs do Sistema & Trilha de Auditoria
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Registro cronológico inalterável de disparos, acessos, exportações e operações de compliance LGPD.
            </p>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-800 uppercase text-[10px] text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-4">Data / Hora</th>
                    <th className="p-4">Ação</th>
                    <th className="p-4">Recurso</th>
                    <th className="p-4">Detalhes</th>
                    <th className="p-4">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                        Carregando logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                        Nenhum log de auditoria registrado ainda.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-4 text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">{log.resource}</td>
                        <td className="p-4 text-slate-200 font-sans">{log.details}</td>
                        <td className="p-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
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
