/**
 * Evolution API v2 Client for Zendify
 * Handles instance management, QR Code generation, message sending, and status checks.
 */

export interface EvolutionConfig {
  serverUrl: string;
  instanceName: string;
  apiKey: string;
}

export interface EvolutionSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isMock?: boolean;
}

export class EvolutionClient {
  private serverUrl: string;
  private instanceName: string;
  private apiKey: string;
  private isMockMode: boolean;

  constructor(config?: Partial<EvolutionConfig>) {
    this.serverUrl = (config?.serverUrl || process.env.EVOLUTION_SERVER_URL || 'http://localhost:8080').replace(/\/$/, '');
    this.instanceName = config?.instanceName || process.env.EVOLUTION_INSTANCE_NAME || 'zendify_instance';
    this.apiKey = config?.apiKey || process.env.EVOLUTION_API_KEY || '';
    
    // Check if credentials are missing or default demo
    this.isMockMode = !this.serverUrl || !this.apiKey || this.apiKey.includes('demo') || this.apiKey === '';
  }

  /**
   * Format phone number to WhatsApp E.164 (without leading +)
   */
  public static formatToE164(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 || cleaned.length === 11) {
      cleaned = `55${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Fetch instance connection state and QR Code if disconnected
   */
  public async getInstanceStatus(): Promise<{
    connected: boolean;
    state: string; // 'open' | 'connecting' | 'close'
    qrCodeBase64?: string;
    pairingCode?: string;
    message: string;
    instanceName: string;
  }> {
    if (this.isMockMode) {
      return {
        connected: true,
        state: 'open',
        message: '🟢 Conectado via Evolution API v2 (Modo de Demonstração / Simulador)',
        instanceName: this.instanceName,
      };
    }

    try {
      const response = await fetch(`${this.serverUrl}/instance/connectionState/${this.instanceName}`, {
        method: 'GET',
        headers: {
          apikey: this.apiKey,
        },
      });

      if (!response.ok) {
        // Try creating instance if it doesn't exist yet
        return this.createAndConnectInstance();
      }

      const data = await response.json();
      const state = data?.instance?.state || data?.state || 'close';
      const isConnected = state === 'open';

      if (isConnected) {
        return {
          connected: true,
          state: 'open',
          message: `🟢 Instância "${this.instanceName}" Conectada à Evolution API!`,
          instanceName: this.instanceName,
        };
      }

      // If disconnected or connecting, fetch QR Code
      const qrData = await this.getQrCode();
      return {
        connected: false,
        state,
        qrCodeBase64: qrData.qrCodeBase64,
        pairingCode: qrData.pairingCode,
        message: `🟡 Instância "${this.instanceName}" desconectada. Escaneie o QR Code abaixo com seu WhatsApp.`,
        instanceName: this.instanceName,
      };
    } catch (err: any) {
      return {
        connected: false,
        state: 'close',
        message: `🔴 Erro de conexão com servidor Evolution API (${this.serverUrl}): ${err?.message}`,
        instanceName: this.instanceName,
      };
    }
  }

  /**
   * Create instance on Evolution API if not exists
   */
  public async createAndConnectInstance(): Promise<any> {
    try {
      const createRes = await fetch(`${this.serverUrl}/instance/create`, {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: this.instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });

      const data = await createRes.json();
      const qrCodeBase64 = data?.qrcode?.base64 || data?.base64;

      return {
        connected: false,
        state: 'connecting',
        qrCodeBase64,
        message: `🟡 Instância "${this.instanceName}" criada. Escaneie o QR Code para conectar.`,
        instanceName: this.instanceName,
      };
    } catch (err: any) {
      return {
        connected: false,
        state: 'close',
        message: `🔴 Falha ao criar instância no Evolution API: ${err?.message}`,
        instanceName: this.instanceName,
      };
    }
  }

  /**
   * Fetch latest QR Code for pairing
   */
  public async getQrCode(): Promise<{ qrCodeBase64?: string; pairingCode?: string }> {
    try {
      const res = await fetch(`${this.serverUrl}/instance/connect/${this.instanceName}`, {
        method: 'GET',
        headers: { apikey: this.apiKey },
      });
      const data = await res.json();
      return {
        qrCodeBase64: data?.base64 || data?.qrcode?.base64,
        pairingCode: data?.pairingCode,
      };
    } catch (err) {
      return {};
    }
  }

  /**
   * Send Text Message via Evolution API
   */
  public async sendTextMessage(toPhone: string, textBody: string): Promise<EvolutionSendResult> {
    const formattedPhone = EvolutionClient.formatToE164(toPhone);

    if (this.isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      return {
        success: true,
        messageId: `evo_${Math.random().toString(36).substring(2, 12)}`,
        isMock: true,
      };
    }

    try {
      const response = await fetch(`${this.serverUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: textBody,
          delay: 1200, // humanized delay in ms
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.response?.message || data?.message || 'Erro de envio via Evolution API',
        };
      }

      const messageId = data?.key?.id || data?.messageId || data?.id;
      return { success: true, messageId };
    } catch (err: any) {
      return { success: false, error: `Erro ao enviar via Evolution API: ${err?.message}` };
    }
  }

  /**
   * Send Media Message via Evolution API
   */
  public async sendMediaMessage(
    toPhone: string,
    mediaType: 'image' | 'video' | 'document' | 'audio',
    mediaUrl: string,
    caption?: string
  ): Promise<EvolutionSendResult> {
    const formattedPhone = EvolutionClient.formatToE164(toPhone);

    if (this.isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      return {
        success: true,
        messageId: `evo_media_${Math.random().toString(36).substring(2, 12)}`,
        isMock: true,
      };
    }

    try {
      const response = await fetch(`${this.serverUrl}/message/sendMedia/${this.instanceName}`, {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: formattedPhone,
          mediatype: mediaType,
          media: mediaUrl,
          caption: caption || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.response?.message || data?.message || 'Erro ao enviar mídia via Evolution API',
        };
      }

      const messageId = data?.key?.id || data?.messageId || data?.id;
      return { success: true, messageId };
    } catch (err: any) {
      return { success: false, error: `Erro de mídia no Evolution API: ${err?.message}` };
    }
  }
}
