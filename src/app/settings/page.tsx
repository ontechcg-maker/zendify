'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { Settings, Building2, Users, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [companyData, setCompanyData] = useState<any>({
    name: '',
    cnpj: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userAdmin, setUserAdmin] = useState<any>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/settings');
      const data = await res.json();
      if (data?.company) {
        setCompanyData({
          name: data.company.name || '',
          cnpj: data.company.cnpj || '',
        });
      }
      if (data?.user) {
        setUserAdmin(data.user);
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        fetchSettings();
      } else {
        alert('Erro ao salvar configurações');
      }
    } catch (err: any) {
      alert(`Erro de conexão: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Settings className="w-7 h-7 text-emerald-400" />
              Configurações & Segurança RBAC
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Gerencie dados da empresa, permissões de usuários e chaves de segurança.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> Dados da Empresa (Tenant)
              </h3>
              {saved && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Alterações salvas no banco!
                </span>
              )}
            </div>

            {loading ? (
              <p className="text-xs text-slate-500">Carregando configurações...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Razão Social / Nome Fantasia *</label>
                    <input
                      type="text"
                      required
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      placeholder="Nome da sua empresa"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">CNPJ</label>
                    <input
                      type="text"
                      value={companyData.cnpj}
                      onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saved ? '✓ Salvo no Banco' : 'Salvar Configurações'}</span>
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Controle de Acesso por Perfil (RBAC)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{userAdmin?.name || 'Administrador'}</p>
                  <p className="text-[10px] text-slate-400">{userAdmin?.email || 'admin@zendify.app'}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase text-[10px]">
                  {userAdmin?.role || 'COMPANY_ADMIN'}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

