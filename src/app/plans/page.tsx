'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { CreditCard, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const plans = [
  {
    name: 'FREE',
    price: 'R$ 0',
    users: '1 usuário',
    contacts: '100 contatos',
    messages: '500 msgs/mês',
    features: ['WhatsApp Meta API Cloud', 'Editor com Preview', 'Gestão de Contatos', 'Fila básica'],
    popular: false,
  },
  {
    name: 'STARTER',
    price: 'R$ 149',
    users: '3 usuários',
    contacts: '1.000 contatos',
    messages: '5.000 msgs/mês',
    features: ['Tudo do Plano Free', 'Automações Básicas', 'Importação CSV ilimitada', 'Suporte Prioritário'],
    popular: false,
  },
  {
    name: 'PRO',
    price: 'R$ 399',
    users: '10 usuários',
    contacts: '10.000 contatos',
    messages: '50.000 msgs/mês',
    features: ['Tudo do Starter', 'Caixa de Entrada Multiatendimento', 'Webhooks Avançados', 'Relatórios Exportáveis em PDF'],
    popular: true,
  },
  {
    name: 'ENTERPRISE',
    price: 'R$ 899',
    users: 'Usuários Ilimitados',
    contacts: '100.000 contatos',
    messages: '500.000 msgs/mês',
    features: ['Tudo do Plano Pro', 'Gerente de Conta Dedicado', 'SLA de Atendimento 99.9%', 'Infraestrutura Dedicada WABA'],
    popular: false,
  },
];

export default function PlansPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
              Assinatura SaaS Zendify
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Escolha o plano ideal para a sua empresa</h1>
            <p className="text-slate-400 text-sm">
              Escala de infraestrutura preparada para integração com Stripe / Mercado Pago com cobrança recorrente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-6 relative ${
                  p.popular ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10' : ''
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Mais Popular
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className="font-extrabold text-xl text-white">{p.name}</h3>
                  <div>
                    <span className="text-3xl font-black text-white">{p.price}</span>
                    <span className="text-xs text-slate-400"> /mês</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <p className="font-medium">✔️ {p.users}</p>
                    <p className="font-medium">✔️ {p.contacts}</p>
                    <p className="font-medium">✔️ {p.messages}</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Simulação de checkout para o plano ${p.name}`)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                    p.popular
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {p.name === 'PRO' ? 'Plano Atual (Ativo)' : 'Migrar de Plano'}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
