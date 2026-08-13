'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { Settings, Building2, Users } from 'lucide-react';

export default function SettingsPage() {
  const [companyData, setCompanyData] = useState<any>({
    name: 'Minha Empresa',
    cnpj: '',
  });

  useEffect(() => {
    fetch('/api/v1/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data?.company) {
          setCompanyData((prev: any) => ({
            ...prev,
            name: data.company.name || 'Minha Empresa',
          }));
        }
      })
      .catch(() => {});
  }, []);

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

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" /> Dados da Empresa (Tenant)
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Razão Social / Nome Fantasia</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  placeholder="Nome da sua empresa"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">CNPJ</label>
                <input
                  type="text"
                  value={companyData.cnpj}
                  onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Controle de Acesso por Perfil (RBAC)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Administrador</p>
                  <p className="text-[10px] text-slate-400">admin@zendify.app</p>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase text-[10px]">
                  COMPANY_ADMIN
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
