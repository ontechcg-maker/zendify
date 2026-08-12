'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import {
  FileCode,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Trash2,
  Search,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [bodyText, setBodyText] = useState('');
  const [footerText, setFooterText] = useState('');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          bodyText,
          footerText,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setBodyText('');
        setFooterText('');
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <FileCode className="w-7 h-7 text-emerald-400" />
                Templates de Mensagem HSM
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Modelos de mensagens pré-aprovados pela Meta para disparo oficial de notificações e campanhas.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Template</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200"
            />
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-slate-500 text-xs">Carregando templates...</p>
            ) : (
              filteredTemplates.map((t) => (
                <div key={t.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4 relative">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-bold uppercase tracking-wider">
                        {t.category}
                      </span>

                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Meta Aprovado
                      </span>
                    </div>

                    <h3 className="font-mono font-bold text-sm text-emerald-300">{t.name}</h3>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                      {t.bodyText}
                    </div>

                    {t.footerText && (
                      <p className="text-[10px] text-slate-500 italic">Rodapé: {t.footerText}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Idioma: {t.language}</span>
                    <button
                      onClick={() => alert(`Copiado template ${t.name}`)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
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
                  <h3 className="font-bold text-lg text-white">Criar Template Meta HSM</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTemplate} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Nome do Template *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ex: comunicacao_promocional_v1"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Categoria *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    >
                      <option value="MARKETING">Marketing</option>
                      <option value="SERVICE">Atendimento</option>
                      <option value="BILLING">Cobrança</option>
                      <option value="INFORMATIVE">Informativo</option>
                      <option value="PROMOTION">Promoção</option>
                      <option value="AFTER_SALES">Pós-venda</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Texto Principal *</label>
                    <textarea
                      required
                      rows={4}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Olá, {{nome}}! Seu pedido na {{empresa}} foi atualizado..."
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
                      Solicitar Aprovação Meta
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
