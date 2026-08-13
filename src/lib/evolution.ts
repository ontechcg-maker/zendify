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
    this.serverUrl = (config?.serverUrl || process.env.EVOLUTION_SERVER_URL || 'http://localhost:8080').replace(/\/$/, '').trim();
    this.instanceName = (config?.instanceName || process.env.EVOLUTION_INSTANCE_NAME || 'zendify_instance').trim();
    this.apiKey = (config?.apiKey || process.env.EVOLUTION_API_KEY || '').trim();
    
    // Check if credentials are missing or default demo
    this.isMockMode = !this.serverUrl || !this.apiKey || this.apiKey.includes('demo') || this.apiKey === '';
  }

  private getHeaders(withBody = false): Record<string, string> {
    const key = this.apiKey.trim();
    const headers: Record<string, string> = {
      apikey: key,
    };
    if (withBody) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
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
      const url = `${this.serverUrl}/instance/connectionState/${this.instanceName}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.status === 401 || response.status === 403) {
        return {
          connected: false,
          state: 'close',
          message: `🔴 Chave de API (API Key) não autorizada no servidor Evolution (${this.serverUrl}). Verifique se colou a Global Key correta.`,
          instanceName: this.instanceName,
        };
      }

      if (!response.ok) {
        // Instance does not exist yet (404 or other error) -> try creating instance
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
      if (!qrData.qrCodeBase64) {
        // Try creating instance if connect didn't return a QR code
        return this.createAndConnectInstance();
      }

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
      const url = `${this.serverUrl}/instance/create`;
      const createRes = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({
          instanceName: this.instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });

      const data = await createRes.json();

      if (!createRes.ok) {
        const rawErr = data?.response?.message || data?.message || data?.error || '';
        const errMsg = Array.isArray(rawErr) ? rawErr.join(', ') : String(rawErr);

        if (errMsg.toLowerCase().includes('already exist') || createRes.status === 403 || createRes.status === 400) {
          const qrData = await this.getQrCode();
          return {
            connected: false,
            state: 'connecting',
            qrCodeBase64: qrData.qrCodeBase64,
            pairingCode: qrData.pairingCode,
            message: qrData.qrCodeBase64
              ? `🟡 Instância "${this.instanceName}" já existente. Escaneie o QR Code abaixo para conectar.`
              : `🔴 Instância "${this.instanceName}" já existe no Evolution API, mas não foi possível gerar o QR Code. Erro: ${errMsg || 'Desconhecido'}`,
            instanceName: this.instanceName,
          };
        }

        return {
          connected: false,
          state: 'close',
          message: `🔴 Falha ao criar instância "${this.instanceName}" no Evolution API (HTTP ${createRes.status}): ${errMsg || 'Verifique se a API Key é a Global Key do Evolution'}`,
          instanceName: this.instanceName,
        };
      }

      let qrCodeBase64 = data?.qrcode?.base64 || data?.base64 || data?.qrcode?.code || data?.code;
      let pairingCode = data?.qrcode?.pairingCode || data?.pairingCode;

      if (!qrCodeBase64) {
        const qrData = await this.getQrCode();
        qrCodeBase64 = qrData.qrCodeBase64;
        pairingCode = qrData.pairingCode;
      }

      return {
        connected: false,
        state: 'connecting',
        qrCodeBase64,
        pairingCode,
        message: qrCodeBase64
          ? `🟡 Instância "${this.instanceName}" criada com sucesso! Escaneie o QR Code para conectar.`
          : `🟡 Instância "${this.instanceName}" criada. Clique em "Testar Status & QR Code" para exibir o QR Code.`,
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
      const url = `${this.serverUrl}/instance/connect/${this.instanceName}`;
      let res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        res = await fetch(url, {
          method: 'POST',
          headers: this.getHeaders(true),
        });
      }

      if (!res.ok) return {};

      const data = await res.json();
      const qrCodeBase64 = data?.base64 || data?.qrcode?.base64 || data?.code || data?.qrcode?.code;
      const pairingCode = data?.pairingCode || data?.qrcode?.pairingCode;

      return {
        qrCodeBase64,
        pairingCode,
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
        headers: this.getHeaders(true),
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
        headers: this.getHeaders(true),
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

  /**
   * Fetch all WhatsApp groups of the instance
   */
  public async fetchGroups(): Promise<Array<{
    id: string;
    subject: string;
    size: number;
    owner?: string;
    pictureUrl?: string;
    creation?: number;
  }>> {
    if (this.isMockMode) {
      return [
        { id: '120363000000000001@g.us', subject: 'Grupo Demo 1', size: 10 },
        { id: '120363000000000002@g.us', subject: 'Grupo Demo 2', size: 25 },
      ];
    }
    try {
      const res = await fetch(
        `${this.serverUrl}/group/fetchAllGroups/${this.instanceName}?getParticipants=false`,
        { method: 'GET', headers: this.getHeaders() }
      );
      if (!res.ok) return [];
      const data = await res.json();
      const groups = Array.isArray(data) ? data : (data?.groups || []);
      return groups.map((g: any) => ({
        id: g.id || g.groupId,
        subject: g.subject || g.name || 'Sem nome',
        size: g.size || g.participants?.length || 0,
        owner: g.owner,
        pictureUrl: g.pictureUrl,
        creation: g.creation,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetch participants of a specific WhatsApp group
   */
  public async fetchGroupParticipants(groupId: string): Promise<Array<{
    id: string;
    phone: string;
    pushName?: string;
    admin?: boolean;
  }>> {
    if (this.isMockMode) {
      return [
        { id: '5583999990001@s.whatsapp.net', phone: '5583999990001', pushName: 'Demo User 1' },
        { id: '5583999990002@s.whatsapp.net', phone: '5583999990002', pushName: 'Demo User 2' },
      ];
    }
    try {
      const res = await fetch(
        `${this.serverUrl}/group/participants/${this.instanceName}?groupJid=${encodeURIComponent(groupId)}`,
        { method: 'GET', headers: this.getHeaders() }
      );
      if (!res.ok) return [];
      const data = await res.json();
      const participants: any[] = Array.isArray(data) ? data : (data?.participants || []);
      return participants.map((p: any) => {
        const rawId = p.id || p.jid || '';
        const phone = rawId.replace('@s.whatsapp.net', '').replace('@c.us', '');
        return {
          id: rawId,
          phone,
          pushName: p.pushName || p.name,
          admin: p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin === true,
        };
      });
    } catch {
      return [];
    }
  }
}
