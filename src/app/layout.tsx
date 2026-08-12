import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zendify - Plataforma SaaS Oficial WhatsApp Business API',
  description: 'Gestão de contatos, criação de campanhas e automação de mensagens utilizando a WhatsApp Business Platform / Meta Graph API v20.0.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
