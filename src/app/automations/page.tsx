'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { Zap, Plus, ArrowRight, CheckCircle2, Play, Pause, Trash2, X } from 'lucide-react';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('NEW_CONTACT');
  const [actionMsg, setActionMsg] = useState('');

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/automations');
      const data = await res.json();
      setAutomations(data.automations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          triggerType,
          steps: [{ type: 'ACTION_SEND_MSG', config: { message: actionMsg } }],
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setActionMsg('');
        fetchAutomations();
      }
    } catch (err) {
      console.error(err);
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
                <Zap className="w-7 h-7 text-amber-400" />
                Construtor Visual de Automações
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Crie regras no formato Gatilho → Condição → Ação para automação de atendimento e engajamento.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Automação</span>
            </button>
          </div>

          {/* Automations List */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-xs text-slate-500">Carregando automações...</p>
            ) : (
              automations.map((auto) => (
                <div key={auto.id} className="glass-panel p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-white">{auto.name}</h3>
                        <p className="text-xs text-slate-400">Execuções totais: {auto.executionCount}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                      {auto.status}
                    </span>
                  </div>

                  {/* Visual Flow Builder Representation */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-4 text-xs">
                    {/* Step 1: Trigger */}
                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center min-w-[140px]">
                      <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">⚡ GATILHO</span>
                      <span className="font-semibold text-slate-200">{auto.triggerType}</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

                    {/* Step 2: Condition */}
                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center min-w-[140px]">
                      <span className="text-[10px] text-blue-400 font-bold uppercase block mb-1">🔍 CONDIÇÃO</span>
                      <span className="font-semibold text-slate-200">Sem Opt-out</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

                    {/* Step 3: Action */}
                    <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl text-center flex-1">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">🚀 AÇÃO</span>
                      <span className="font-semibold text-slate-200">
                        {auto.steps?.[0]?.configJson ? JSON.parse(auto.steps[0].configJson).message || 'Enviar Mensagem' : 'Enviar Mensagem'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-lg text-white">Criar Automação</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAutomation} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Nome da Automação *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Mensagem de Boas-Vindas"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Evento Gatilho (Trigger) *</label>
                    <select
                      value={triggerType}
                      onChange={(e) => setTriggerType(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    >
                      <option value="NEW_CONTACT">Quando um novo contato for cadastrado</option>
                      <option value="MESSAGE_RECEIVED">Quando uma mensagem for recebida</option>
                      <option value="INACTIVITY_DAYS">Quando o contato ficar 30 dias inativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Mensagem da Ação Automática *</label>
                    <textarea
                      required
                      rows={3}
                      value={actionMsg}
                      onChange={(e) => setActionMsg(e.target.value)}
                      placeholder="Seja bem-vindo(a)! Como posso ajudar?"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 font-bold text-slate-950 rounded-xl"
                    >
                      Ativar Automação
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
