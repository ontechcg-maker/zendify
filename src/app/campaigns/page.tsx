'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import WhatsAppPreview from '@/components/whatsapp/WhatsAppPreview';
import {
  Send,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Pause,
  XCircle,
  Users,
  Eye,
  RefreshCw,
  Sparkles,
  Layers,
  FileCode,
  Image as ImageIcon,
  Smile,
  Zap,
} from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View state: 'list' or 'new'
  const [view, setView] = useState<'list' | 'new'>('list');

  // Form State
  const [name, setName] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [messageText, setMessageText] = useState('Olá, {{nome}}! Temos uma oferta especial da empresa {{empresa}} para a cidade de {{cidade}}.');
  const [mediaType, setMediaType] = useState<'NONE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'>('NONE');
  const [mediaUrl, setMediaUrl] = useState('');
  const [sendOption, setSendOption] = useState<'NOW' | 'SCHEDULE'>('NOW');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const [resC, resS, resT] = await Promise.all([
        fetch('/api/v1/campaigns'),
        fetch('/api/v1/segments'),
        fetch('/api/v1/templates'),
      ]);

      const dataC = await resC.json();
      const dataS = await resS.json();
      const dataT = await resT.json();

      setCampaigns(dataC.campaigns || []);
      setSegments(dataS.segments || []);
      setTemplates(dataT.templates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // When template is chosen, populate messageText
  const handleSelectTemplate = (tId: string) => {
    setTemplateId(tId);
    if (!tId) return;
    const selected = templates.find((t) => t.id === tId);
    if (selected) {
      setMessageText(selected.bodyText);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const scheduledFor =
        sendOption === 'SCHEDULE' && scheduledDate && scheduledTime
          ? `${scheduledDate}T${scheduledTime}:00`
          : null;

      const res = await fetch('/api/v1/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          segmentId: segmentId || null,
          templateId: templateId || null,
          messageText,
          mediaType,
          mediaUrl: mediaUrl || null,
          sendNow: sendOption === 'NOW',
          scheduledFor,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setView('list');
        setName('');
        fetchCampaigns();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Erro no envio: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Send className="w-7 h-7 text-emerald-400" />
                Módulo de Campanhas WhatsApp
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Dispare mensagens personalizadas em massa respeitando limites da API Oficial e consentimento LGPD.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {view === 'list' ? (
                <button
                  onClick={() => setView('new')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Campanha</span>
                </button>
              ) : (
                <button
                  onClick={() => setView('list')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Voltar para Lista
                </button>
              )}
            </div>
          </div>

          {/* VIEW: NEW CAMPAIGN EDITOR WITH WHATSAPP PREVIEW */}
          {view === 'new' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleCreateCampaign} className="glass-panel p-6 rounded-3xl space-y-5">
                  <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3">
                    Configuração da Campanha
                  </h3>

                  {/* Nome da Campanha */}
                  <div>
                    <label className="text-slate-300 font-medium text-xs block mb-1">Nome da Campanha *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Promoção de Lançamento Black Friday"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  {/* Público Alvo / Segmento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-medium text-xs block mb-1">Público-Alvo / Segmento *</label>
                      <select
                        value={segmentId}
                        onChange={(e) => setSegmentId(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="">Selecione um segmento...</option>
                        {segments.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.contactCount} contatos)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-medium text-xs block mb-1">Template Meta HSM (Opcional)</label>
                      <select
                        value={templateId}
                        onChange={(e) => handleSelectTemplate(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="">Sem Template (Mensagem Direta)</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Editor de Conteúdo */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-medium text-xs">Mensagem do WhatsApp *</label>
                      <span className="text-[10px] text-slate-500">Variáveis disponíveis: {'{{nome}}'}, {'{{empresa}}'}, {'{{cidade}}'}</span>
                    </div>

                    <textarea
                      required
                      rows={5}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                    />

                    {/* Variable Injection Buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['{{nome}}', '{{empresa}}', '{{cidade}}', '{{telefone}}'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setMessageText((prev) => prev + ' ' + v)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[10px] rounded-lg border border-slate-700"
                        >
                          + {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Anexo de Mídia */}
                  <div>
                    <label className="text-slate-300 font-medium text-xs block mb-1">Tipo de Mídia (Opcional)</label>
                    <div className="flex items-center gap-3">
                      {(['NONE', 'IMAGE', 'DOCUMENT'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setMediaType(t)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            mediaType === t
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {t === 'NONE' ? 'Sem Mídia' : t === 'IMAGE' ? 'Imagem' : 'Documento PDF'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opção de Envio (Imediato vs Agendado) */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                    <label className="text-slate-300 font-medium text-xs block">Configuração de Agendamento</label>
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sendOption"
                          checked={sendOption === 'NOW'}
                          onChange={() => setSendOption('NOW')}
                          className="text-emerald-500 focus:ring-0"
                        />
                        <span className="text-slate-200">Enviar Imediatamente via Fila</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sendOption"
                          checked={sendOption === 'SCHEDULE'}
                          onChange={() => setSendOption('SCHEDULE')}
                          className="text-emerald-500 focus:ring-0"
                        />
                        <span className="text-slate-200">Agendar Data e Horário</span>
                      </label>
                    </div>

                    {sendOption === 'SCHEDULE' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                        />
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      className="px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{sendOption === 'NOW' ? 'Disparar Campanha Agora' : 'Confirmar Agendamento'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* WhatsApp Live Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-24">
                  <div className="mb-3 text-center">
                    <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      WhatsApp Live Preview
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">Simulação exata de como a mensagem aparecerá no aparelho do cliente</p>
                  </div>

                  <WhatsAppPreview
                    messageText={messageText}
                    mediaType={mediaType}
                    mediaUrl={mediaUrl}
                    contactName="Ana Pereira"
                    companyName="Acme Corp"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* VIEW: CAMPAIGNS LIST & METRICS */
            <div className="space-y-4">
              <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 border-b border-slate-800 uppercase text-[10px] text-slate-400 tracking-wider">
                      <tr>
                        <th className="p-4">Nome da Campanha</th>
                        <th className="p-4">Segmento</th>
                        <th className="p-4">Destinatários</th>
                        <th className="p-4">Enviadas</th>
                        <th className="p-4">Entregues</th>
                        <th className="p-4">Lidas</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            Carregando histórico de campanhas...
                          </td>
                        </tr>
                      ) : campaigns.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            Nenhuma campanha criada ainda.
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-900/40 transition">
                            <td className="p-4 font-semibold text-slate-100">{c.name}</td>
                            <td className="p-4 text-slate-300">{c.segment?.name || 'Todos os contatos'}</td>
                            <td className="p-4 font-mono">{c.totalRecipients}</td>
                            <td className="p-4 font-mono text-emerald-400">{c.sentCount}</td>
                            <td className="p-4 font-mono text-emerald-300">{c.deliveredCount}</td>
                            <td className="p-4 font-mono text-purple-300">{c.readCount}</td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.status === 'COMPLETED'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : c.status === 'PROCESSING'
                                    ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => alert(`Detalhes da campanha ${c.name}`)}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px]"
                              >
                                Relatório
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
