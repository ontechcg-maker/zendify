'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import WhatsAppPreview, { WhatsAppAttachment } from '@/components/whatsapp/WhatsAppPreview';
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
  Video,
  Mic,
  Smile,
  Zap,
  Trash2,
  Paperclip,
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
  const [messageText, setMessageText] = useState(
    'Olá, {{nome}}! Temos uma oferta especial da empresa {{empresa}} para a cidade de {{cidade}}.'
  );

  // Attachments State (Multi-file)
  const [attachments, setAttachments] = useState<WhatsAppAttachment[]>([]);
  const [mediaType, setMediaType] = useState<'NONE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO'>('NONE');
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

  const handleSelectTemplate = (tId: string) => {
    setTemplateId(tId);
    if (!tId) return;
    const selected = templates.find((t) => t.id === tId);
    if (selected) {
      setMessageText(selected.bodyText);
    }
  };

  const addAttachment = (type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO') => {
    const newAtt: WhatsAppAttachment = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      url: type === 'IMAGE' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600' : '',
      name: type === 'DOCUMENT' ? 'Catalogo_2026.pdf' : type === 'AUDIO' ? 'Audio_Explicativo.mp3' : undefined,
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const removeAttachment = (id?: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAttachmentUrl = (id: string, url: string) => {
    setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, url } : a)));
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const scheduledFor =
        sendOption === 'SCHEDULE' && scheduledDate && scheduledTime
          ? `${scheduledDate}T${scheduledTime}:00`
          : null;

      // Consolidate attachments into json string
      const consolidatedMediaUrl = mediaUrl || attachments[0]?.url || null;
      const primaryType = mediaType !== 'NONE' ? mediaType : attachments[0]?.type || 'NONE';

      const res = await fetch('/api/v1/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          segmentId: segmentId || null,
          templateId: templateId || null,
          messageText,
          mediaType: primaryType,
          mediaUrl: consolidatedMediaUrl,
          buttonsJson: attachments.length > 0 ? JSON.stringify(attachments) : null,
          sendNow: sendOption === 'NOW',
          scheduledFor,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setView('list');
        setName('');
        setAttachments([]);
        setMediaUrl('');
        setMediaType('NONE');
        fetchCampaigns();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Erro de conexão: ${err.message}`);
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Send className="w-7 h-7 text-emerald-400" />
                Gestão de Campanhas de Disparo
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Dispare mensagens personalizadas com imagens, documentos, vídeos, áudios e múltiplos anexos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {view === 'list' ? (
                <button
                  onClick={() => setView('new')}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nova Campanha</span>
                </button>
              ) : (
                <button
                  onClick={() => setView('list')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition"
                >
                  Ver Lista de Campanhas
                </button>
              )}
            </div>
          </div>

          {view === 'new' ? (
            /* Create Campaign Form & Preview Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form */}
              <form onSubmit={handleCreateCampaign} className="lg:col-span-7 space-y-6">
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> 1. Informações Básicas da Campanha
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Nome da Campanha</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Lançamento de Verão 2026 - Clientes VIP"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-300 block mb-1 font-semibold">Segmento / Lista de Contatos</label>
                        <select
                          value={segmentId}
                          onChange={(e) => setSegmentId(e.target.value)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                        >
                          <option value="">Todos os Contatos Ativos ({segments.length} listas)</option>
                          {segments.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.contactCount} contatos)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1 font-semibold">Template Meta (Opcional)</label>
                        <select
                          value={templateId}
                          onChange={(e) => handleSelectTemplate(e.target.value)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                        >
                          <option value="">Nenhum (Mensagem Livre)</option>
                          {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.category})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message & Attachments Panel */}
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" /> 2. Conteúdo e Mídias Anexadas
                    </div>
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-slate-300 font-semibold">Texto da Mensagem</label>
                        <span className="text-[10px] text-slate-400">Variáveis: &#123;&#123;nome&#125;&#125;, &#123;&#123;empresa&#125;&#125;, &#123;&#123;cidade&#125;&#125;</span>
                      </div>
                      <textarea
                        rows={5}
                        required
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-sans text-xs focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    {/* Media Type & Multi-File Add Buttons */}
                    <div>
                      <label className="text-slate-300 block mb-2 font-semibold">Adicionar Anexos de Mídia (Imagens, Vídeos, PDFs, Áudios)</label>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => addAttachment('IMAGE')}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-300 transition"
                        >
                          <ImageIcon className="w-4 h-4 text-emerald-400" />
                          <span>+ Imagem</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addAttachment('VIDEO')}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-300 transition"
                        >
                          <Video className="w-4 h-4 text-blue-400" />
                          <span>+ Vídeo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addAttachment('DOCUMENT')}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-300 transition"
                        >
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span>+ Documento</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addAttachment('AUDIO')}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-300 transition"
                        >
                          <Mic className="w-4 h-4 text-purple-400" />
                          <span>+ Áudio/Voz</span>
                        </button>
                      </div>
                    </div>

                    {/* Render Multi-File Attachment Inputs */}
                    {attachments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-xs font-bold text-emerald-400 block">Arquivos Anexados ({attachments.length}):</span>
                        {attachments.map((att, idx) => (
                          <div key={att.id || idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-emerald-300 font-bold uppercase">
                              {att.type}
                            </span>
                            <input
                              type="text"
                              value={att.url}
                              onChange={(e) => updateAttachmentUrl(att.id!, e.target.value)}
                              placeholder={`URL do arquivo ${att.type} (ex: https://site.com/arquivo.${att.type === 'IMAGE' ? 'jpg' : att.type === 'DOCUMENT' ? 'pdf' : att.type === 'VIDEO' ? 'mp4' : 'mp3'})`}
                              className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => removeAttachment(att.id)}
                              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling & Submit */}
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" /> 3. Agendamento e Envio
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSendOption('NOW')}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                          sendOption === 'NOW'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>Disparar Agora</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSendOption('SCHEDULE')}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                          sendOption === 'SCHEDULE'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Agendar Data e Hora</span>
                      </button>
                    </div>

                    {sendOption === 'SCHEDULE' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-300 block mb-1 font-semibold">Data</label>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 block mb-1 font-semibold">Horário</label>
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                      {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{sendOption === 'NOW' ? 'Iniciar Disparo da Campanha' : 'Confirmar Agendamento'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Right Column: WhatsApp Live Preview */}
              <div className="lg:col-span-5">
                <div className="sticky top-24">
                  <WhatsAppPreview messageText={messageText} attachments={attachments} />
                </div>
              </div>
            </div>
          ) : (
            /* Campaign List View */
            <div className="space-y-4">
              {loading ? (
                <p className="text-xs text-slate-500">Carregando campanhas...</p>
              ) : campaigns.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
                  <Send className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="font-bold text-white text-base">Nenhuma campanha criada</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Crie sua primeira campanha para enviar mensagens em massa com suporte a imagens, vídeos, PDFs e áudios.
                  </p>
                  <button
                    onClick={() => setView('new')}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
                  >
                    Criar Primeira Campanha
                  </button>
                </div>
              ) : (
                campaigns.map((c) => (
                  <div key={c.id} className="glass-panel p-6 rounded-3xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : c.status === 'PROCESSING'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {c.status}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-lg text-white">{c.name}</h3>
                      </div>

                      <div className="flex items-center gap-6 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Destinatários</span>
                          <span className="font-bold text-white">{c.totalRecipients || 0}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Enviadas</span>
                          <span className="font-bold text-emerald-400">{c.sentCount || 0}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Entregues</span>
                          <span className="font-bold text-emerald-300">{c.deliveredCount || 0}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Lidas</span>
                          <span className="font-bold text-sky-400">{c.readCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-2xl text-xs text-slate-300 font-sans border border-slate-800 flex justify-between items-center">
                      <p className="truncate max-w-2xl">{c.messageText}</p>
                      {c.mediaType !== 'NONE' && (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono border border-emerald-500/20">
                          {c.mediaType}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
