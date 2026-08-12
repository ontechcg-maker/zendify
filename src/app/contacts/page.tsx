'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Papa from 'papaparse';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Trash2,
  Lock,
  Tag as TagIcon,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  ShieldAlert,
  UserCheck,
  Building2,
  MapPin,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    companyName: '',
    city: '',
    state: '',
    consent: true,
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (selectedTag) query.set('tagId', selectedTag);
      if (selectedStatus) query.set('status', selectedStatus);
      if (selectedState) query.set('state', selectedState);

      const res = await fetch(`/api/v1/contacts?${query.toString()}`);
      const data = await res.json();
      setContacts(data.contacts || []);
      setTags(data.tags || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, selectedTag, selectedStatus, selectedState]);

  // Handle Add Contact Submit
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/v1/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: 'error', text: data.error || 'Erro ao adicionar contato' });
        return;
      }

      setFeedbackMsg({ type: 'success', text: 'Contato adicionado com sucesso!' });
      setIsAddModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        companyName: '',
        city: '',
        state: '',
        consent: true,
      });
      fetchContacts();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  // Handle CSV Import
  const handleImportCsv = async () => {
    if (!csvFile) return;
    setImporting(true);
    setFeedbackMsg(null);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/v1/contacts/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contacts: results.data }),
          });
          const data = await res.json();
          if (res.ok) {
            setFeedbackMsg({
              type: 'success',
              text: `Importação Concluída: ${data.importedCount} novos contatos adicionados (${data.duplicateCount} duplicados ignorados).`,
            });
            setIsImportModalOpen(false);
            setCsvFile(null);
            fetchContacts();
          } else {
            setFeedbackMsg({ type: 'error', text: data.error });
          }
        } catch (err: any) {
          setFeedbackMsg({ type: 'error', text: err.message });
        } finally {
          setImporting(false);
        }
      },
    });
  };

  // Export Contacts to CSV
  const handleExportCsv = () => {
    if (contacts.length === 0) return;
    const exportData = contacts.map((c) => ({
      Nome: c.firstName,
      Sobrenome: c.lastName || '',
      Telefone: c.phone,
      WhatsApp: c.whatsapp,
      Email: c.email || '',
      Empresa: c.companyName || '',
      Cidade: c.city || '',
      Estado: c.state || '',
      Status: c.status,
      Consentimento: c.consent ? 'SIM' : 'NAO',
      DataCadastro: c.createdAt,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zendify_contatos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Select / Deselect All
  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Users className="w-7 h-7 text-emerald-400" />
                Gerenciamento de Contatos
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Base unificada de contatos com validação E.164 e registro de consentimento LGPD.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Contato</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Importar CSV</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedbackMsg.text}</span>
              </div>
              <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por nome, telefone, email ou empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                <option value="">Todos os Status</option>
                <option value="ACTIVE">Ativos</option>
                <option value="OPTED_OUT">Opt-out / Bloqueado</option>
                <option value="INACTIVE">Inativos</option>
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                <option value="">Todas as Tags</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                <option value="">Todos os Estados</option>
                <option value="SP">São Paulo (SP)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="PR">Paraná (PR)</option>
                <option value="RS">Rio Grande do Sul (RS)</option>
              </select>
            </div>
          </div>

          {/* Contacts Data Table */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-800 uppercase text-[10px] text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={contacts.length > 0 && selectedIds.length === contacts.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                      />
                    </th>
                    <th className="p-4">Contato</th>
                    <th className="p-4">WhatsApp (E.164)</th>
                    <th className="p-4">Empresa / Cidade</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4">Consentimento LGPD</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Carregando contatos...
                      </td>
                    </tr>
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Nenhum contato encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => toggleSelectOne(c.id)}
                            className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400">
                              {c.firstName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-100">
                                {c.firstName} {c.lastName}
                              </p>
                              <p className="text-[11px] text-slate-400">{c.email || 'Sem e-mail'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-emerald-300 font-medium">{c.whatsapp || c.phone}</td>
                        <td className="p-4">
                          <p className="text-slate-200">{c.companyName || '—'}</p>
                          <p className="text-[10px] text-slate-400">
                            {c.city ? `${c.city}, ${c.state}` : 'Não informado'}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {c.contactTags && c.contactTags.length > 0 ? (
                              c.contactTags.map((ct: any) => (
                                <span
                                  key={ct.tag.id}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                                  style={{
                                    backgroundColor: `${ct.tag.color}15`,
                                    color: ct.tag.color,
                                    borderColor: `${ct.tag.color}30`,
                                  }}
                                >
                                  {ct.tag.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {c.consent ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1 w-fit">
                              <ShieldAlert className="w-3 h-3 text-emerald-400" /> Opt-in Ativo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium flex items-center gap-1 w-fit">
                              <Lock className="w-3 h-3 text-rose-400" /> Opt-out LGPD
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => alert(`Visualizando histórico de ${c.firstName}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Editar / Detalhes"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Contact Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-lg text-white">Cadastrar Novo Contato</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddContact} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">Nome *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Ex: Carlos"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Sobrenome</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Ex: Silva"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Telefone WhatsApp (E.164) *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: 11998877661 ou +5511998877661"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">E-mail</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="cliente@empresa.com"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Empresa</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Nome da empresa"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">Cidade</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Ex: São Paulo"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Estado</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                        placeholder="SP"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] text-emerald-200">Consentimento LGPD Confirmado</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                    >
                      Salvar Contato
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Import CSV Modal */}
          {isImportModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-lg text-white">Importar Contatos via CSV</h3>
                  <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-slate-400">
                    Selecione um arquivo CSV com as colunas: <code className="text-emerald-300">nome, telefone, email, empresa, cidade, estado</code>.
                  </p>

                  <div className="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-center bg-slate-950/40">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!csvFile || importing}
                      onClick={handleImportCsv}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl disabled:opacity-50 flex items-center gap-2"
                    >
                      {importing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Processar Importação</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
