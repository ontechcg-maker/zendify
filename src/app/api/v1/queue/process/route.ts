import { NextRequest, NextResponse } from 'next/server';
import { CampaignQueueProcessor } from '@/lib/queue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { campaignId, batchLimit } = body;

    const results = await CampaignQueueProcessor.processNextBatch(campaignId, batchLimit || 25);

    return NextResponse.json({
      success: true,
      processed: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
