/**
 * Unified WhatsApp Client for Zendify
 * Supports both Evolution API v2 (WhatsApp Baileys / QR Code) and Meta Graph API v20.0 (WABA Official).
 */

import { EvolutionClient } from './evolution';

export interface WhatsAppSendResult {
  success: boolean;
  wabaMessageId?: string;
  error?: string;
  isMock?: boolean;
}

export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;
  private isMockMode: boolean;
  private evolutionClient: EvolutionClient;
  private provider: 'EVOLUTION' | 'META';

  constructor(phoneNumberId?: string | null, accessToken?: string | null, provider: 'EVOLUTION' | 'META' = 'EVOLUTION') {
    this.provider = provider;
    this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '';
    
    // Initialize Evolution client
    this.evolutionClient = new EvolutionClient({
      serverUrl: process.env.EVOLUTION_SERVER_URL || 'http://localhost:8080',
      instanceName: phoneNumberId || process.env.EVOLUTION_INSTANCE_NAME || 'zendify_instance',
      apiKey: accessToken || process.env.EVOLUTION_API_KEY || '',
    });

    this.isMockMode =
      !this.phoneNumberId ||
      !this.accessToken ||
      this.accessToken.includes('Demo') ||
      this.phoneNumberId === '102938475610293';
  }

  public static formatToE164(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 || cleaned.length === 11) {
      cleaned = `55${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Test WhatsApp API connection status
   */
  public async testConnection(): Promise<{ connected: boolean; message: string; rating?: string; phone?: string; qrCodeBase64?: string }> {
    if (this.provider === 'EVOLUTION') {
      const evoStatus = await this.evolutionClient.getInstanceStatus();
      return {
        connected: evoStatus.connected,
        message: evoStatus.message,
        qrCodeBase64: evoStatus.qrCodeBase64,
        phone: evoStatus.instanceName,
      };
    }

    if (this.isMockMode) {
      return {
        connected: true,
        message: '🟢 Conectado (Modo de Demonstração / Simulador Meta Graph API v20.0)',
        rating: 'GREEN',
        phone: '+55 11 98765-4321',
      };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${this.phoneNumberId}?fields=verified_name,code_verification_status,quality_rating`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          connected: false,
          message: `🔴 Falha na autenticação Meta API: ${errorData?.error?.message || 'Token ou Phone Number ID inválido'}`,
        };
      }

      const data = await response.json();
      return {
        connected: true,
        message: `🟢 Conectado à Meta Graph API - Nome Verificado: ${data.verified_name || 'Business Account'}`,
        rating: data.quality_rating || 'GREEN',
        phone: this.phoneNumberId,
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `🔴 Erro de rede ao conectar à Meta API: ${err?.message || 'Timeout de conexão'}`,
      };
    }
  }

  /**
   * Send a Text message via configured provider (Evolution API or Meta)
   */
  public async sendTextMessage(toPhone: string, textBody: string): Promise<WhatsAppSendResult> {
    if (this.provider === 'EVOLUTION') {
      const res = await this.evolutionClient.sendTextMessage(toPhone, textBody);
      return {
        success: res.success,
        wabaMessageId: res.messageId,
        error: res.error,
        isMock: res.isMock,
      };
    }

    const formattedPhone = WhatsAppClient.formatToE164(toPhone);
    if (this.isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      return { success: true, wabaMessageId: `wamid.HBgM${Math.random().toString(36).substring(2, 11).toUpperCase()}`, isMock: true };
    }

    return this.postToMetaGraph({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: { preview_url: true, body: textBody },
    });
  }

  /**
   * Send a Template / Formatted message
   */
  public async sendTemplateMessage(
    toPhone: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    variables: Record<string, string> = {}
  ): Promise<WhatsAppSendResult> {
    // If Evolution API, format as human text message
    if (this.provider === 'EVOLUTION') {
      let bodyText = `Template [${templateName}]\n`;
      Object.entries(variables).forEach(([k, v]) => {
        bodyText += `• ${k}: ${v}\n`;
      });
      return this.sendTextMessage(toPhone, bodyText.trim());
    }

    const formattedPhone = WhatsAppClient.formatToE164(toPhone);
    if (this.isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      return { success: true, wabaMessageId: `wamid.HBgT${Math.random().toString(36).substring(2, 11).toUpperCase()}`, isMock: true };
    }

    const parameters = Object.values(variables).map((val) => ({ type: 'text', text: val }));
    return this.postToMetaGraph({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(parameters.length > 0 ? { components: [{ type: 'body', parameters }] } : {}),
      },
    });
  }

  /**
   * Send Media Message
   */
  public async sendMediaMessage(
    toPhone: string,
    mediaType: 'image' | 'video' | 'document' | 'audio',
    mediaUrl: string,
    caption?: string
  ): Promise<WhatsAppSendResult> {
    if (this.provider === 'EVOLUTION') {
      const res = await this.evolutionClient.sendMediaMessage(toPhone, mediaType, mediaUrl, caption);
      return {
        success: res.success,
        wabaMessageId: res.messageId,
        error: res.error,
        isMock: res.isMock,
      };
    }

    const formattedPhone = WhatsAppClient.formatToE164(toPhone);
    if (this.isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      return { success: true, wabaMessageId: `wamid.HBgM${Math.random().toString(36).substring(2, 11).toUpperCase()}`, isMock: true };
    }

    return this.postToMetaGraph({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: mediaType,
      [mediaType]: { link: mediaUrl, ...(caption ? { caption } : {}) },
    });
  }

  private async postToMetaGraph(payload: any): Promise<WhatsAppSendResult> {
    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        return { success: false, error: `[Meta API Error]: ${responseData?.error?.message || response.status}` };
      }
      return { success: true, wabaMessageId: responseData?.messages?.[0]?.id };
    } catch (err: any) {
      return { success: false, error: `Erro ao conectar Meta API: ${err?.message}` };
    }
  }
}
