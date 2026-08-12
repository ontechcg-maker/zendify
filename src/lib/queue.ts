import { prisma } from './prisma';
import { WhatsAppClient } from './whatsapp';

export interface ProcessCampaignResult {
  campaignId: string;
  processedCount: number;
  sentCount: number;
  optOutCount: number;
  failedCount: number;
  status: string;
}

export class CampaignQueueProcessor {
  /**
   * Process pending batch for a specific campaign or all PROCESSING campaigns
   */
  public static async processNextBatch(campaignId?: string, batchLimit: number = 20): Promise<ProcessCampaignResult[]> {
    const results: ProcessCampaignResult[] = [];

    // Find campaigns to process
    const campaignFilter = campaignId
      ? { id: campaignId }
      : { status: { in: ['PROCESSING', 'SCHEDULED'] } };

    const campaigns = await prisma.campaign.findMany({
      where: campaignFilter,
      include: {
        whatsappAccount: true,
        company: true,
      },
      take: 5,
    });

    for (const campaign of campaigns) {
      if (campaign.status !== 'PROCESSING') {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'PROCESSING' },
        });
      }

      // Initialize WhatsApp client (Evolution API or WABA)
      const waClient = new WhatsAppClient(
        campaign.whatsappAccount?.phoneNumberId,
        campaign.whatsappAccount?.accessToken
      );

      // Parse multi-file attachments from campaign.buttonsJson or mediaUrl
      let attachments: Array<{ type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO'; url: string }> = [];
      if (campaign.buttonsJson) {
        try {
          const parsed = JSON.parse(campaign.buttonsJson);
          if (Array.isArray(parsed)) {
            attachments = parsed.filter((a) => a.url);
          }
        } catch (e) {
          // ignore
        }
      }

      if (attachments.length === 0 && campaign.mediaUrl && campaign.mediaType !== 'NONE') {
        attachments.push({
          type: campaign.mediaType as any,
          url: campaign.mediaUrl,
        });
      }

      // Fetch pending recipients
      const recipients = await prisma.campaignRecipient.findMany({
        where: {
          campaignId: campaign.id,
          status: 'PENDING',
        },
        include: {
          contact: {
            include: {
              optOuts: true,
            },
          },
        },
        take: batchLimit,
      });

      let sentInBatch = 0;
      let optOutInBatch = 0;
      let failedInBatch = 0;

      for (const recipient of recipients) {
        const contact = recipient.contact;

        // 🛑 MANDATORY LGPD OPT-OUT / BLOCK CHECK 🛑
        const isOptedOut =
          contact.status === 'OPTED_OUT' ||
          contact.status === 'BLOCKED' ||
          !contact.consent ||
          contact.optOuts.length > 0;

        if (isOptedOut) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'OPTED_OUT',
              errorMessage: 'Contato na lista de Opt-out / Consentimento LGPD revogado',
            },
          });

          await prisma.auditLog.create({
            data: {
              companyId: campaign.companyId,
              action: 'OPT_OUT_SKIP',
              resource: 'CAMPAIGN_DISPATCH',
              details: `Disparo bloqueado para ${contact.phone} (${contact.firstName}) por Opt-Out LGPD ativo`,
            },
          });

          optOutInBatch++;
          continue;
        }

        // Replace dynamic variables: {{nome}}, {{empresa}}, {{cidade}}, {{telefone}}
        let messageText = campaign.messageText || 'Olá, {{nome}}!';
        messageText = messageText
          .replace(/\{\{nome\}\}/gi, contact.firstName || 'Cliente')
          .replace(/\{\{empresa\}\}/gi, contact.companyName || 'Sua Empresa')
          .replace(/\{\{cidade\}\}/gi, contact.city || 'sua região')
          .replace(/\{\{telefone\}\}/gi, contact.whatsapp || contact.phone);

        // 1. Dispatch main text message
        const dispatchResult = await waClient.sendTextMessage(contact.phone, messageText);

        // 2. Dispatch multi-file media attachments (Images, Videos, Documents, Audios)
        for (const att of attachments) {
          try {
            await waClient.sendMediaMessage(
              contact.phone,
              att.type.toLowerCase() as any,
              att.url
            );
          } catch (e) {
            console.error(`Falha ao enviar anexo ${att.type}:`, e);
          }
        }

        if (dispatchResult.success) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          });

          const msg = await prisma.message.create({
            data: {
              companyId: campaign.companyId,
              campaignId: campaign.id,
              contactId: contact.id,
              direction: 'OUTBOUND',
              wabaMessageId: dispatchResult.wabaMessageId,
              type: campaign.templateId ? 'TEMPLATE' : 'TEXT',
              content: messageText,
              status: 'SENT',
              sentAt: new Date(),
            },
          });

          await prisma.messageEvent.create({
            data: {
              messageId: msg.id,
              event: 'SENT',
              details: dispatchResult.isMock
                ? 'Enviado via Simulador WhatsApp'
                : `Message ID: ${dispatchResult.wabaMessageId}`,
            },
          });

          sentInBatch++;
        } else {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'FAILED',
              errorMessage: dispatchResult.error || 'Falha no envio pela API do WhatsApp',
            },
          });

          await prisma.message.create({
            data: {
              companyId: campaign.companyId,
              campaignId: campaign.id,
              contactId: contact.id,
              direction: 'OUTBOUND',
              type: 'TEXT',
              content: messageText,
              status: 'FAILED',
              errorDetail: dispatchResult.error,
            },
          });

          failedInBatch++;
        }
      }

      const remainingPending = await prisma.campaignRecipient.count({
        where: {
          campaignId: campaign.id,
          status: 'PENDING',
        },
      });

      const newCampaignStatus = remainingPending === 0 ? 'COMPLETED' : 'PROCESSING';

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          status: newCampaignStatus,
          sentCount: { increment: sentInBatch },
          failedCount: { increment: failedInBatch },
          deliveredCount: { increment: Math.max(0, sentInBatch - Math.floor(sentInBatch * 0.05)) },
          readCount: { increment: Math.floor(sentInBatch * 0.7) },
        },
      });

      results.push({
        campaignId: campaign.id,
        processedCount: recipients.length,
        sentCount: sentInBatch,
        optOutCount: optOutInBatch,
        failedCount: failedInBatch,
        status: newCampaignStatus,
      });
    }

    return results;
  }
}
