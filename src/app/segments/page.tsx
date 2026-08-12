'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Users,
  Send,
  Sparkles,
  Filter,
  CheckCircle2,
  Trash2,
  Edit,
  Tag as TagIcon,
  MapPin,
  X,
} from 'lucide-react';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/segments');
      const data = await res.json();
      setSegments(data.segments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rules = { state: stateFilter, city: cityFilter };
      const res = await fetch('/api/v1/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, rules }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setStateFilter('');
        setCityFilter('');
        fetchSegments();
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
                <Layers className="w-7 h-7 text-emerald-400" />
                Listas & Segmentos de Contatos
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Crie listas inteligentes baseadas em localização, status, tags ou comportamento para usar diretamente em campanhas.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Segmento</span>
            </button>
          </div>

          {/* Segments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-slate-500 text-xs">Carregando segmentos...</p>
            ) : (
              segments.map((seg) => (
                <div key={seg.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4 relative group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                        Segmento Ativo
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{seg.contactCount} contatos</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition">
                      {seg.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {seg.description || 'Segmentação personalizada para direcionamento de disparo.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/campaigns?segmentId=${seg.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Usar em Campanha</span>
                    </Link>

                    <span className="text-[10px] text-slate-500">
                      Atualizado {new Date(seg.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-lg text-white">Criar Novo Segmento</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSegment} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Nome do Segmento *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Clientes VIP São Paulo"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Descrição</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Finalidade do segmento..."
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">Estado (UF)</label>
                      <input
                        type="text"
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value.toUpperCase())}
                        placeholder="SP"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Cidade</label>
                      <input
                        type="text"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        placeholder="São Paulo"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
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
                      Salvar Segmento
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
