'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import {
  MessageSquare,
  Search,
  Send,
  CheckCheck,
  User,
  Phone,
  Building2,
  Clock,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/inbox');
      const data = await res.json();
      const convs = data.conversations || [];
      setConversations(convs);
      if (convs.length > 0 && !activeConv) {
        setActiveConv(convs[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !activeConv) return;
    setSending(true);

    try {
      const res = await fetch('/api/v1/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          text: replyText,
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchInbox();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.phone.includes(search)
  );

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              Caixa de Entrada Multiatendimento
            </h1>
            <p className="text-xs text-slate-400">Atenda e responda conversas recebidas do WhatsApp em tempo real.</p>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 flex-1 grid grid-cols-12 min-h-[550px]">
            {/* Left Conversations List */}
            <div className="col-span-4 border-r border-slate-800 flex flex-col bg-slate-900/40">
              <div className="p-3 border-b border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar conversa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
                {loading ? (
                  <p className="text-xs text-slate-500 p-4 text-center">Carregando conversas...</p>
                ) : filteredConvs.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">Nenhuma conversa encontrada.</p>
                ) : (
                  filteredConvs.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setActiveConv(c)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                        activeConv?.id === c.id ? 'bg-slate-800/80 border-l-4 border-emerald-500' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs">
                        {c.contact.firstName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xs text-slate-100 truncate">{c.contact.firstName}</p>
                          <span className="text-[9px] text-slate-500">
                            {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage || 'Mensagem enviada'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Chat Area */}
            <div className="col-span-8 flex flex-col bg-[#0b141a]">
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3.5 bg-[#1f2c34] border-b border-slate-800 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
                        {activeConv.contact.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{activeConv.contact.firstName} {activeConv.contact.lastName || ''}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">{activeConv.contact.whatsapp}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {activeConv.inboxMessages && activeConv.inboxMessages.map((msg: any) => {
                      const isOperator = msg.sender === 'OPERATOR';
                      return (
                        <div
                          key={msg.id}
                          className={`max-w-[70%] p-3 rounded-2xl text-xs ${
                            isOperator
                              ? 'ml-auto bg-[#005c4b] text-slate-100 rounded-tr-xs'
                              : 'mr-auto bg-[#202c33] text-slate-200 rounded-tl-xs'
                          }`}
                        >
                          <p className="font-semibold text-[10px] text-emerald-300 mb-0.5">{msg.senderName || msg.sender}</p>
                          <p className="leading-relaxed">{msg.text}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Send Input Bar */}
                  <form onSubmit={handleSendReply} className="p-3 bg-[#1f2c34] flex items-center gap-2 border-t border-slate-800">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva uma resposta..."
                      className="flex-1 p-2 bg-[#2a3942] text-xs text-slate-100 rounded-xl focus:outline-none placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !replyText}
                      className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl disabled:opacity-50 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  Selecione uma conversa ao lado para visualizar e responder.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
