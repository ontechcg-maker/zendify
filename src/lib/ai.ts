/**
 * AIService for Zendify
 * Handles AI message generation via OpenRouter API (or Direct OpenAI / Gemini) with Mock Mode fallback.
 */

export interface AIConfig {
  provider: 'OPENROUTER' | 'OPENAI' | 'GEMINI';
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  autoReplyEnabled: boolean;
}

export interface AIGenerateResult {
  success: boolean;
  text?: string;
  error?: string;
  modelUsed?: string;
  isMock?: boolean;
}

export class AIService {
  private config: AIConfig;
  private isMockMode: boolean;

  constructor(config?: Partial<AIConfig>) {
    const rawApiKey = (config?.apiKey || process.env.OPENROUTER_API_KEY || '').trim();
    this.config = {
      provider: config?.provider || 'OPENROUTER',
      apiKey: rawApiKey,
      model: config?.model || 'anthropic/claude-3.5-sonnet',
      systemPrompt:
        config?.systemPrompt ||
        'Você é um assistente virtual atencioso, ágil e profissional do Zendify. Responda as dúvidas do cliente de forma clara e amigável via WhatsApp.',
      temperature: config?.temperature !== undefined ? config.temperature : 0.7,
      autoReplyEnabled: config?.autoReplyEnabled !== undefined ? config.autoReplyEnabled : false,
    };

    // If key is empty or demo, operate in Mock Mode
    this.isMockMode = !this.config.apiKey || this.config.apiKey.includes('demo') || this.config.apiKey === '';
  }

  /**
   * Generate AI Completion for WhatsApp customer message
   */
  public async generateResponse(
    userMessage: string,
    conversationHistory: Array<{ sender: string; text: string }> = []
  ): Promise<AIGenerateResult> {
    if (this.isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        success: true,
        text: `🤖 [IA Demo - ${this.config.model}]: Olá! Recebi sua mensagem: "${userMessage}". Como posso te ajudar hoje com o Zendify?`,
        modelUsed: `${this.config.model} (Simulador)`,
        isMock: true,
      };
    }

    try {
      // Build OpenRouter / OpenAI Chat Messages array
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: this.config.systemPrompt },
      ];

      // Append last 5 messages for context
      conversationHistory.slice(-5).forEach((msg) => {
        messages.push({
          role: msg.sender === 'CONTACT' ? 'user' : 'assistant',
          content: msg.text,
        });
      });

      // Append current incoming user message
      messages.push({ role: 'user', content: userMessage });

      if (this.config.provider === 'OPENROUTER') {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': 'https://zendify.app',
            'X-Title': 'Zendify SaaS WhatsApp Platform',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            messages,
            temperature: this.config.temperature,
            max_tokens: 500,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data?.error?.message || data?.message || `Erro HTTP ${response.status} na OpenRouter`;
          return { success: false, error: `[OpenRouter Error]: ${errorMsg}` };
        }

        const generatedText = data?.choices?.[0]?.message?.content;
        if (!generatedText) {
          return { success: false, error: 'OpenRouter não retornou conteúdo na resposta.' };
        }

        return {
          success: true,
          text: generatedText.trim(),
          modelUsed: data?.model || this.config.model,
        };
      } else if (this.config.provider === 'GEMINI') {
        // Direct Google Gemini API
        let primaryModel = (this.config.model || 'gemini-1.5-flash').trim();
        if (primaryModel.includes('/')) {
          primaryModel = primaryModel.split('/')[1];
        }
        if (primaryModel === 'gemini-2.0-flash' || !primaryModel.startsWith('gemini')) {
          primaryModel = 'gemini-1.5-flash';
        }

        const candidateModels = Array.from(
          new Set([primaryModel, 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'])
        );

        const rawContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        // Build history in Gemini format
        conversationHistory.slice(-5).forEach((msg) => {
          const role = msg.sender === 'CONTACT' || msg.sender === 'USER' ? 'user' : 'model';
          if (msg.text && msg.text.trim()) {
            rawContents.push({
              role,
              parts: [{ text: msg.text.trim() }],
            });
          }
        });

        // Add current user message
        rawContents.push({
          role: 'user',
          parts: [{ text: userMessage.trim() }],
        });

        // Sanitize contents to guarantee valid Gemini role alternation (user, model, user, model)
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
        for (const item of rawContents) {
          if (contents.length === 0) {
            if (item.role === 'user') {
              contents.push(item);
            }
          } else {
            const lastRole = contents[contents.length - 1].role;
            if (item.role !== lastRole) {
              contents.push(item);
            } else {
              contents[contents.length - 1].parts[0].text += `\n${item.parts[0].text}`;
            }
          }
        }

        if (contents.length === 0) {
          contents.push({ role: 'user', parts: [{ text: userMessage.trim() || 'Olá' }] });
        }

        let lastErrorMsg = '';

        // Try primary model first, fallback to gemini-1.5-flash / gemini-2.5-flash if unavailable
        for (const geminiModel of candidateModels) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${this.config.apiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: this.config.systemPrompt }],
                  },
                  contents,
                  generationConfig: {
                    temperature: this.config.temperature,
                    maxOutputTokens: 500,
                  },
                }),
              }
            );

            const data = await response.json();

            if (!response.ok) {
              lastErrorMsg = data?.error?.message || data?.message || `Erro HTTP ${response.status} no Gemini (${geminiModel})`;
              if (response.status === 404 || lastErrorMsg.includes('no longer available') || lastErrorMsg.includes('not found')) {
                continue;
              }
              return { success: false, error: `[Gemini Error]: ${lastErrorMsg}` };
            }

            const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!generatedText) {
              return { success: false, error: 'Google Gemini não retornou texto na resposta.' };
            }

            return {
              success: true,
              text: generatedText.trim(),
              modelUsed: geminiModel,
            };
          } catch (err: any) {
            lastErrorMsg = err?.message;
          }
        }

        return { success: false, error: `[Gemini Error]: ${lastErrorMsg || 'Modelos Gemini indisponíveis'}` };
      } else {
        // Direct OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model || 'gpt-4o-mini',
            messages,
            temperature: this.config.temperature,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: `[OpenAI Error]: ${data?.error?.message || 'Erro OpenAI'}` };
        }

        return {
          success: true,
          text: data?.choices?.[0]?.message?.content?.trim(),
          modelUsed: data?.model || this.config.model,
        };
      }
    } catch (err: any) {
      return { success: false, error: `Falha na requisição da IA: ${err?.message}` };
    }
  }
}
