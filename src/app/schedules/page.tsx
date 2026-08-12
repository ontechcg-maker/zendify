'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { Calendar, Clock, Send, Plus, Pause, Play, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function SchedulesPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-7 h-7 text-emerald-400" />
                Agendamentos & Calendário de Disparos
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Agende campanhas para datas e horários específicos com suporte a reincidência programada.
              </p>
            </div>

            <Link
              href="/campaigns?action=new"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Campanha</span>
            </Link>
          </div>

          {/* Schedule List */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-base text-white">Próximos Disparos Programados</h3>

            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Reengajamento de Leads Q3</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Programado para: <span className="text-amber-300 font-mono font-semibold">14/08/2026 às 14:30</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold">
                  SCHEDULED
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
