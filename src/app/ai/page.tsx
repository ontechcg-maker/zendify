'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import {
  Bot,
  Sparkles,
  Zap,
  Key,
  Sliders,
  Send,
  RefreshCw,
  CheckCircle2,
  Cpu,
  MessageSquare,
  Globe,
  Radio,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function AIPage() {
  const [provider, setProvider] = useState<'OPENROUTER' | 'OPENAI' | 'GEMINI'>('OPENROUTER');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('anthropic/claude-3.5-sonnet');
  const [systemPrompt, setSystemPrompt] = useState(
    'Você é o assistente virtual da empresa. Atenda os clientes via WhatsApp com cortesia, agilidade e clareza.'
  );
  const [temperature, setTemperature] = useState(0.7);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Chat Sandbox State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string }>>([
    { sender: 'AI', text: 'Olá! Sou o assistente virtual configurado. Como posso te ajudar hoje?' },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fetchAIConfig = async () => {
    try {
      const res = await fetch('/api/v1/ai/config');
      const data = await res.json();
      if (data.config) {
        setProvider(data.config.provider || 'OPENROUTER');
        setApiKey(data.config.apiKey || '');
        setModel(data.config.model || 'anthropic/claude-3.5-sonnet');
        setSystemPrompt(
          data.config.systemPrompt ||
            'Você é o assistente virtual da empresa. Atenda os clientes via WhatsApp com cortesia, agilidade e clareza.'
        );
        setTemperature(data.config.temperature || 0.7);
        setAutoReplyEnabled(data.config.autoReplyEnabled || false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAIConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          systemPrompt,
          temperature,
          autoReplyEnabled,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendSandboxMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || chatLoading) return;

    const userText = inputMsg.trim();
    setInputMsg('');

    setChatMessages((prev) => [...prev, { sender: 'USER', text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/v1/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          systemPrompt,
          temperature,
          userMessage: userText,
          history: chatMessages.map((m) => ({ sender: m.sender === 'USER' ? 'CONTACT' : 'BOT', text: m.text })),
        }),
      });

      const data = await res.json();

      if (data.result?.success) {
        setChatMessages((prev) => [...prev, { sender: 'AI', text: data.result.text }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'AI', text: `❌ Erro na IA: ${data.result?.error || 'Verifique sua API Key'}` },
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { sender: 'AI', text: `❌ Erro de conexão: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const applyPromptPreset = (presetType: string) => {
    if (presetType === 'VENDAS') {
      setSystemPrompt(
        'Você é um especialista em vendas e qualificação de leads. Seu objetivo é apresentar produtos, tirar dúvidas de preços e convidar o cliente a agendar uma demonstração ou fechar negócio.'
      );
    } else if (presetType === 'SUPORTE') {
      setSystemPrompt(
        'Você é um atendente de suporte técnico de Nível 1. Seja direto, resolutivo e forneça instruções passo a passo para resolver problemas dos clientes com clareza.'
      );
    } else if (presetType === 'AGENDAMENTO') {
      setSystemPrompt(
        'Você é uma secretária virtual de agendamentos. Solicite o nome, dia e horário de preferência do cliente e confirme o agendamento de forma educada.'
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-7 h-7 text-purple-400" />
              Agente de IA & OpenRouter
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure seu robô de atendimento com **OpenRouter**, insira modelos manualmente e teste em tempo real antes de responder no WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: AI Settings Form */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSaveConfig} className="glass-panel p-6 rounded-3xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Configuração do Provedor de IA
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Auto-Reply WhatsApp:</span>
                    <button
                      type="button"
                      onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        autoReplyEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Provider Selector */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProvider('OPENROUTER');
                      setModel('anthropic/claude-3.5-sonnet');
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                      provider === 'OPENROUTER'
                        ? 'bg-purple-950/50 border-purple-500 text-purple-300 ring-2 ring-purple-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className="font-extrabold text-xs text-white">OpenRouter ⭐</span>
                    <span className="text-[10px] text-slate-400">Todos os Modelos em 1 API</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProvider('OPENAI');
                      setModel('gpt-4o-mini');
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                      provider === 'OPENAI'
                        ? 'bg-purple-950/50 border-purple-500 text-purple-300 ring-2 ring-purple-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className="font-extrabold text-xs text-white">OpenAI Direct</span>
                    <span className="text-[10px] text-slate-400">GPT-4o / GPT-4o-mini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProvider('GEMINI');
                      setModel('gemini-2.0-flash');
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                      provider === 'GEMINI'
                        ? 'bg-purple-950/50 border-purple-500 text-purple-300 ring-2 ring-purple-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className="font-extrabold text-xs text-white">Google Gemini</span>
                    <span className="text-[10px] text-slate-400">Gemini 2.0 Flash</span>
                  </button>
                </div>

                {/* API Key */}
                <div className="text-xs">
                  <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" /> API Key ({provider})
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      provider === 'OPENROUTER' ? 'sk-or-v1-...' : provider === 'OPENAI' ? 'sk-...' : 'AIzaSy...'
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Insira sua chave de API ({provider === 'OPENROUTER' ? 'OpenRouter' : provider === 'OPENAI' ? 'OpenAI' : 'Google AI Studio (Gemini)'}). Se mantido em branco, o sistema utilizará o **Simulador de IA**.
                  </p>
                </div>

                {/* Manual Model Input Field & Suggestions */}
                <div className="text-xs space-y-2">
                  <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" /> Modelo de IA (Digitação Manual)
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Digite o ID do modelo (ex: anthropic/claude-3.5-sonnet, deepseek/deepseek-chat)"
                    className="w-full p-2.5 bg-slate-950 border border-purple-500/40 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    required
                  />

                  {/* Preset Model Badges */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Modelos sugeridos (clique para preencher):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Claude 3.5 Sonnet', id: 'anthropic/claude-3.5-sonnet' },
                        { label: 'GPT-4o Mini', id: 'openai/gpt-4o-mini' },
                        { label: 'DeepSeek Chat / R1', id: 'deepseek/deepseek-chat' },
                        { label: 'Llama 3.3 70B', id: 'meta-llama/llama-3.3-70b-instruct' },
                        { label: 'Gemini 2.0 Flash', id: 'google/gemini-2.0-flash-001' },
                        { label: 'Mistral Large', id: 'mistralai/mistral-large' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setModel(m.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition ${
                            model === m.id
                              ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Prompt Editor */}
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-400" /> Prompt do Sistema (Persona do Robô)
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyPromptPreset('VENDAS')}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700"
                      >
                        Preset Vendas
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPromptPreset('SUPORTE')}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700"
                      >
                        Preset Suporte
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Instruções para o atendente virtual..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-sans text-xs"
                  />
                </div>

                {/* Temperature Slider */}
                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Criatividade (Temperatura): <strong className="text-purple-300 font-mono">{temperature}</strong></span>
                    <span>{temperature < 0.4 ? 'Mais Preciso' : temperature > 0.8 ? 'Mais Criativo' : 'Balanceado'}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{saved ? '✓ Configuração do Robô Salva!' : 'Salvar Configuração do Agente IA'}</span>
                </button>
              </form>
            </div>

            {/* Right Column: Interactive Chat Sandbox */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-5 rounded-3xl h-[620px] flex flex-col border border-purple-500/20">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <h3 className="font-extrabold text-sm text-white">Sandbox de Teste do Agente</h3>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono truncate max-w-[140px]">
                    {model}
                  </span>
                </div>

                {/* Chat Messages Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'USER'
                            ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-purple-400 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Agente IA pensando...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendSandboxMessage} className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Digite uma mensagem para testar a IA..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
