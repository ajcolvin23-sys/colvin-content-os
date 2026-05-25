import { NextResponse } from 'next/server';
import { buildGabrielCanvaContentPlan, getCanvaStatus } from '@/lib/integrations/canva';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: getCanvaStatus(),
      gabriel_plan: buildGabrielCanvaContentPlan(),
    },
    error: null,
    timestamp: new Date().toISOString(),
  });
}
