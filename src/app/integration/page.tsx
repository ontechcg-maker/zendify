'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import {
  Plug,
  CheckCircle2,
  RefreshCw,
  Server,
  QrCode,
  Globe,
  Radio,
  Copy,
  Check,
} from 'lucide-react';

export default function IntegrationPage() {
  const [provider, setProvider] = useState<'EVOLUTION' | 'META'>('EVOLUTION');
  const [accountId, setAccountId] = useState<string | null>(null);

  // Evolution API fields
  const [serverUrl, setServerUrl] = useState('https://evo.ontechcg.cloud');
  const [instanceName, setInstanceName] = useState('zendify_instancia_1');
  const [apiKey, setApiKey] = useState('zendify_secret_key_2026');

  // Meta WABA fields
  const [wabaId, setWabaId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const [webhookUrl, setWebhookUrl] = useState('https://zendify.ontechcg.cloud/api/webhooks/evolution');
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setWebhookUrl(`${origin}/api/webhooks/${provider === 'EVOLUTION' ? 'evolution' : 'whatsapp'}`);
    }
  }, [provider]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/config');
      const data = await res.json();
      if (data.account) {
        setAccountId(data.account.id);
        if (data.account.name?.includes('Evolution')) {
          setProvider('EVOLUTION');
          setServerUrl(data.account.wabaId || 'https://evo.ontechcg.cloud');
          setInstanceName(data.account.phoneNumberId || 'zendify_instancia_1');
          setApiKey(data.account.accessToken || 'zendify_secret_key_2026');
        } else {
          setProvider('META');
          setWabaId(data.account.wabaId || '');
          setPhoneNumberId(data.account.phoneNumberId || '');
          setAccessToken(data.account.accessToken || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleTestConnection = async (
    customServerUrl?: string,
    customInstanceName?: string,
    customApiKey?: string
  ) => {
    setTesting(true);
    setTestResult(null);

    const targetServerUrl = customServerUrl || serverUrl;
    const targetInstanceName = customInstanceName || instanceName;
    const targetApiKey = customApiKey || apiKey;

    try {
      const res = await fetch('/api/v1/whatsapp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          serverUrl: targetServerUrl,
          instanceName: targetInstanceName,
          apiKey: targetApiKey,
          phoneNumberId,
          accessToken,
        }),
      });
      const data = await res.json();
      setTestResult(data.result);
      if (data.result?.qrCodeBase64) {
        setQrCodeBase64(data.result.qrCodeBase64);
      } else {
        setQrCodeBase64(null);
      }
    } catch (err: any) {
      setTestResult({ connected: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: accountId,
          provider,
          serverUrl,
          instanceName,
          apiKey,
          wabaId,
          phoneNumberId,
          accessToken,
          webhookUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.account?.id) {
          setAccountId(data.account.id);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        handleTestConnection(serverUrl, instanceName, apiKey);
      } else {
        alert(`Erro ao salvar: ${data.error || 'Falha ao salvar configurações'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Erro de comunicação: ${err.message}`);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Plug className="w-7 h-7 text-emerald-400" />
              Integração WhatsApp - Evolution API & Meta
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Conecte seu WhatsApp via **Evolution API v2** (QR Code / Baileys) ou **Meta Cloud API Oficial**.
            </p>
          </div>

          {/* Provider Selection Tabs */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setProvider('EVOLUTION');
              }}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition text-left ${
                provider === 'EVOLUTION'
                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Evolution API v2 (Recomendado)</h3>
                <p className="text-[11px] text-slate-400">Conexão via QR Code Baileys / Servidor Próprio</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setProvider('META');
              }}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition text-left ${
                provider === 'META'
                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Meta Cloud API Oficial</h3>
                <p className="text-[11px] text-slate-400">WABA Oficial v20.0 via Facebook Graph API</p>
              </div>
            </button>
          </div>

          {/* Connection Status Card */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                ⚡
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Status da Conexão</span>
                <h3 className="font-black text-lg text-white uppercase">
                  {provider === 'EVOLUTION' ? 'Evolution API v2 Ativa' : 'Meta Cloud API Oficial'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provedor Atual: <span className="text-emerald-300 font-semibold">{provider === 'EVOLUTION' ? 'Evolution Server' : 'Meta WABA'}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestConnection()}
              disabled={testing}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Testar Status & QR Code</span>
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-medium ${
                testResult.connected
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* QR Code Renderer for Evolution API */}
          {provider === 'EVOLUTION' && qrCodeBase64 && (
            <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 border border-emerald-500/30 bg-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <QrCode className="w-5 h-5" />
                <span>Escaneie o QR Code no seu WhatsApp</span>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-2xl">
                <img src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} alt="QR Code WhatsApp" className="w-56 h-56" />
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Abra o WhatsApp no celular {'>'} **Dispositivos Conectados** {'>'} **Conectar um dispositivo** e aponte a câmera.
              </p>
            </div>
          )}

          {/* Evolution API Configuration Form */}
          {provider === 'EVOLUTION' ? (
            <form onSubmit={handleSaveConfig} className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" /> Parâmetros do Servidor Evolution API v2
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">URL do Servidor Evolution API</label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="Ex: https://evo.ontechcg.cloud"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Nome da Instância (Instance Name)</label>
                  <input
                    type="text"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    placeholder="Ex: zendify_instancia_1"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-slate-300 block mb-1">API Key Global ou Chave da Instância</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Informe a API Key do Evolution..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold">Webhook:</span> Configure `{webhookUrl}` no Evolution API
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition"
                >
                  {saved ? '✓ Salvo com Sucesso!' : 'Salvar Configuração Evolution'}
                </button>
              </div>
            </form>
          ) : (
            /* Meta WABA Configuration Form */
            <form onSubmit={handleSaveConfig} className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">Credenciais WABA Meta</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">WhatsApp Business Account ID (WABA ID)</label>
                  <input
                    type="text"
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    placeholder="Ex: 109823749817234"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Phone Number ID Meta</label>
                  <input
                    type="text"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="Ex: 102938475610293"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-slate-300 block mb-1">Permanent Access Token (Meta Graph API)</label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition"
                >
                  {saved ? '✓ Salvo com Sucesso!' : 'Salvar Configuração Meta'}
                </button>
              </div>
            </form>
          )}

          {/* Webhook Copy Box */}
          <div className="glass-panel p-5 rounded-3xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white mb-0.5">URL do Webhook para Eventos em Tempo Real</p>
              <p className="text-slate-400 font-mono text-[11px]">{webhookUrl}</p>
            </div>
            <button
              onClick={copyWebhook}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5 font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
