'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Plus,
  User,
} from 'lucide-react';

export default function Navbar() {
  const [userInfo, setUserInfo] = useState<{ name: string; role: string; company: string }>({
    name: 'Administrador',
    role: 'Admin',
    company: 'Minha Empresa',
  });

  useEffect(() => {
    fetch('/api/v1/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data?.company?.name) {
          setUserInfo((prev) => ({
            ...prev,
            company: data.company.name,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const initials = userInfo.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-slate-900/60 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Pesquisar contatos, campanhas..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <Link
          href="/campaigns?action=new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-semibold text-xs transition shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nova Campanha</span>
        </Link>

        <Link
          href="/contacts?action=new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
        >
          <User className="w-3.5 h-3.5" />
          <span>Add Contato</span>
        </Link>

        {/* System Health / Meta WABA Badge */}
        <div className="h-5 border-r border-slate-800 mx-1"></div>

        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 relative">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
            {initials || 'AD'}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-semibold text-slate-200">{userInfo.name}</p>
            <p className="text-[10px] text-slate-400">{userInfo.role} - {userInfo.company}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
