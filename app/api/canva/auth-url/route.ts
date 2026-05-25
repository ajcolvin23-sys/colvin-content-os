import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { buildCanvaAuthorizationUrl, createCanvaPkcePair, getCanvaStatus } from '@/lib/integrations/canva';

export async function GET() {
  const status = getCanvaStatus();
  if (!status.readyForOAuth) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Canva OAuth is not ready. Set CANVA_ENABLED=true, CANVA_CLIENT_ID, and CANVA_REDIRECT_URI first.',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const { codeVerifier, codeChallenge } = createCanvaPkcePair();
  const state = randomUUID();
  const url = buildCanvaAuthorizationUrl({ codeChallenge, state });

  return NextResponse.json({
    success: true,
    data: {
      authorization_url: url,
      state,
      code_verifier: codeVerifier,
      warning: 'Store code_verifier server-side before production use. Do not expose this endpoint publicly without auth.',
    },
    error: null,
    timestamp: new Date().toISOString(),
  });
}
