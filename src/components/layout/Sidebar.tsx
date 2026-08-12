'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Layers,
  Send,
  FileCode,
  Calendar,
  ListOrdered,
  MessageSquare,
  Zap,
  BarChart3,
  ScrollText,
  Plug,
  ShieldCheck,
  CreditCard,
  Settings,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contatos', href: '/contacts', icon: Users },
  { name: 'Listas & Segmentos', href: '/segments', icon: Layers },
  { name: 'Campanhas', href: '/campaigns', icon: Send },
  { name: 'Templates', href: '/templates', icon: FileCode },
  { name: 'Agendamentos', href: '/schedules', icon: Calendar },
  { name: 'Fila de Envio', href: '/queue', icon: ListOrdered },
  { name: 'Caixa de Entrada', href: '/inbox', icon: MessageSquare, badge: '2' },
  { name: 'Automações', href: '/automations', icon: Zap },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Logs & Auditoria', href: '/logs', icon: ScrollText },
  { name: 'Integração WABA', href: '/integration', icon: Plug },
  { name: 'Compliance LGPD', href: '/lgpd', icon: ShieldCheck },
  { name: 'Planos SaaS', href: '/plans', icon: CreditCard },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-40 backdrop-blur-md">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            <img src="/logo.png" alt="Zendify Logo" className="relative w-12 h-12 rounded-2xl object-contain bg-slate-950 p-1 shadow-xl border border-emerald-500/40" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
              Zendify<span className="text-emerald-400 font-normal text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">API</span>
            </span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">WhatsApp SaaS Platform</p>
          </div>
        </Link>
      </div>

      {/* WABA Account Status Badge */}
      <div className="mx-4 my-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 font-medium text-[11px]">WABA Conectado</span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">v20.0</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plan Usage Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[110px]">Acme Corp</span>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-semibold uppercase">
            PRO
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Mensagens Mês</span>
            <span className="text-slate-200 font-mono">1.240 / 50.000</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
