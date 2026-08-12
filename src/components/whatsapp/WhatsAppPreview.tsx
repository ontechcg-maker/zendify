'use client';

import React from 'react';
import { CheckCheck, Image as ImageIcon, FileText, Video, Mic, ExternalLink, MessageCircle, Play, Music } from 'lucide-react';

export interface WhatsAppAttachment {
  id?: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  url: string;
  caption?: string;
  name?: string;
}

interface WhatsAppPreviewProps {
  messageText: string;
  mediaType?: 'NONE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  mediaUrl?: string;
  attachments?: WhatsAppAttachment[];
  buttons?: Array<{ text: string; type?: string }>;
  footerText?: string;
  contactName?: string;
  companyName?: string;
}

export default function WhatsAppPreview({
  messageText,
  mediaType = 'NONE',
  mediaUrl,
  attachments = [],
  buttons = [],
  footerText,
  contactName = 'Ana Pereira',
  companyName = 'Acme Corp',
}: WhatsAppPreviewProps) {
  // Replace variables preview
  const formattedText = (messageText || 'Olá, {{nome}}! Esta é uma prévia visual da sua mensagem no WhatsApp.')
    .replace(/\{\{nome\}\}/gi, contactName)
    .replace(/\{\{empresa\}\}/gi, companyName)
    .replace(/\{\{cidade\}\}/gi, 'São Paulo')
    .replace(/\{\{telefone\}\}/gi, '+55 11 99887-7661');

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Consolidate single mediaUrl + attachments list
  const activeAttachments: WhatsAppAttachment[] = [...attachments];
  if (mediaType !== 'NONE' && mediaUrl && !attachments.some((a) => a.url === mediaUrl)) {
    activeAttachments.unshift({
      type: mediaType as any,
      url: mediaUrl,
      name: mediaType === 'DOCUMENT' ? 'Documento_Anexo.pdf' : undefined,
    });
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      {/* Smartphone Header Bar */}
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 text-white">
        <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-sm text-white shadow">
          {contactName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{contactName}</p>
          <p className="text-[10px] text-emerald-200">Online - WhatsApp Business</p>
        </div>
      </div>

      {/* Chat Canvas */}
      <div className="p-4 bg-[#0b141a] min-h-[360px] flex flex-col justify-end gap-3 text-xs">
        {/* Date Pill */}
        <div className="self-center px-2.5 py-1 rounded-md bg-[#182229] text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
          Hoje
        </div>

        {/* Message Bubble */}
        <div className="self-end max-w-[85%] bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-xs p-3 shadow-md relative group space-y-2">
          {/* Multiple Attachments Preview */}
          {activeAttachments.length > 0 && (
            <div className="space-y-2">
              {activeAttachments.map((att, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden bg-slate-900/80 border border-emerald-500/20">
                  {att.type === 'IMAGE' && (
                    <div className="max-h-40 flex items-center justify-center bg-slate-950">
                      {att.url ? (
                        <img src={att.url} alt="Imagem Anexa" className="w-full h-auto object-cover" />
                      ) : (
                        <div className="py-5 text-slate-400 flex flex-col items-center gap-1">
                          <ImageIcon className="w-5 h-5 text-emerald-400" />
                          <span className="text-[10px]">Imagem Anexada</span>
                        </div>
                      )}
                    </div>
                  )}

                  {att.type === 'VIDEO' && (
                    <div className="p-3 bg-slate-950 flex items-center gap-2 text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-semibold text-[11px] text-white">Vídeo_Campanha.mp4</p>
                        <p className="text-[9px] text-slate-400">00:45 • MP4</p>
                      </div>
                    </div>
                  )}

                  {att.type === 'DOCUMENT' && (
                    <div className="p-2.5 bg-[#054638] flex items-center gap-2 border-l-2 border-l-emerald-400">
                      <FileText className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                      <div className="flex-1 truncate text-[11px] font-mono text-white">
                        {att.name || 'Documento_PDF.pdf'}
                      </div>
                    </div>
                  )}

                  {att.type === 'AUDIO' && (
                    <div className="p-2.5 bg-[#054638] flex items-center gap-3 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-emerald-500/40 rounded-full flex items-center">
                          <div className="w-1/3 h-full bg-emerald-300 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-emerald-200 font-mono">
                          <span>0:14</span>
                          <span>Áudio de Voz</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text Content */}
          <div className="whitespace-pre-wrap leading-relaxed text-sm">{formattedText}</div>

          {/* Footer Text if Template */}
          {footerText && (
            <div className="mt-2 text-[10px] text-slate-300/80 border-t border-emerald-500/20 pt-1">
              {footerText}
            </div>
          )}

          {/* Timestamp and Checkmarks */}
          <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 mt-1">
            <span>{currentTime}</span>
            <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
          </div>

          {/* Interactive Buttons Preview */}
          {buttons && buttons.length > 0 && (
            <div className="mt-2 pt-2 border-t border-emerald-500/30 space-y-1">
              {buttons.map((btn, idx) => (
                <div
                  key={idx}
                  className="w-full py-1.5 bg-[#075E54]/60 hover:bg-[#075E54] rounded-lg text-center font-semibold text-emerald-200 text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 text-emerald-300" />
                  <span>{btn.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phone Footer */}
      <div className="bg-[#1f2c34] px-4 py-2 text-[10px] text-slate-400 text-center border-t border-slate-800 flex items-center justify-center gap-1">
        <MessageCircle className="w-3 h-3 text-emerald-400" />
        <span>Prévia Oficial WhatsApp SaaS Platform</span>
      </div>
    </div>
  );
}
