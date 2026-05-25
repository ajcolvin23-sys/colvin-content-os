import crypto from 'crypto';

const CANVA_API_BASE_URL = 'https://api.canva.com/rest/v1';
const CANVA_AUTHORIZE_URL = 'https://www.canva.com/api/oauth/authorize';

export type CanvaExportFormat =
  | { type: 'mp4'; quality: 'horizontal_480p' | 'horizontal_720p' | 'horizontal_1080p' | 'horizontal_4k' | 'vertical_480p' | 'vertical_720p' | 'vertical_1080p' | 'vertical_4k'; pages?: number[]; export_quality?: 'regular' | 'pro' }
  | { type: 'png'; width?: number; height?: number; transparent_background?: boolean; as_single_image?: boolean; pages?: number[]; export_quality?: 'regular' | 'pro' }
  | { type: 'jpg'; quality: number; width?: number; height?: number; pages?: number[]; export_quality?: 'regular' | 'pro' }
  | { type: 'pdf'; size?: 'a4' | 'a3' | 'letter' | 'legal'; pages?: number[]; export_quality?: 'regular' | 'pro' };

export interface CanvaTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: 'Bearer';
  expires_in: number;
  scope?: string;
}

export interface CanvaExportJob {
  job: {
    id: string;
    status: 'failed' | 'in_progress' | 'success';
    urls?: string[];
    error?: {
      code: string;
      message: string;
    };
  };
}

export interface CanvaStatus {
  enabled: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasRefreshToken: boolean;
  hasDefaultDesignId: boolean;
  redirectUri: string | null;
  readyForOAuth: boolean;
  readyForRefresh: boolean;
}

export interface CanvaContentPlan {
  workflow: 'canva_template_export';
  purpose: string;
  recommendedUse: string[];
  avoidUse: string[];
  requiredApproval: true;
  tokenSavingsLogic: string;
}

function getEnv(name: string): string {
  return process.env[name] || '';
}

function basicAuthHeader(): string {
  const clientId = getEnv('CANVA_CLIENT_ID');
  const clientSecret = getEnv('CANVA_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    throw new Error('Canva client credentials are not configured.');
  }

  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
}

function base64Url(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function getCanvaStatus(): CanvaStatus {
  const enabled = getEnv('CANVA_ENABLED') === 'true';
  const hasClientId = Boolean(getEnv('CANVA_CLIENT_ID'));
  const hasClientSecret = Boolean(getEnv('CANVA_CLIENT_SECRET'));
  const hasRefreshToken = Boolean(getEnv('CANVA_REFRESH_TOKEN'));
  const hasDefaultDesignId = Boolean(getEnv('CANVA_DEFAULT_DESIGN_ID'));
  const redirectUri = getEnv('CANVA_REDIRECT_URI') || null;

  return {
    enabled,
    hasClientId,
    hasClientSecret,
    hasRefreshToken,
    hasDefaultDesignId,
    redirectUri,
    readyForOAuth: enabled && hasClientId && Boolean(redirectUri),
    readyForRefresh: enabled && hasClientId && hasClientSecret && hasRefreshToken,
  };
}

export function createCanvaPkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = base64Url(crypto.randomBytes(64));
  const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

export function buildCanvaAuthorizationUrl(options: {
  codeChallenge: string;
  state: string;
  scopes?: string[];
  redirectUri?: string;
}): string {
  const clientId = getEnv('CANVA_CLIENT_ID');
  const redirectUri = options.redirectUri || getEnv('CANVA_REDIRECT_URI');
  if (!clientId || !redirectUri) {
    throw new Error('Canva OAuth requires CANVA_CLIENT_ID and CANVA_REDIRECT_URI.');
  }

  const params = new URLSearchParams({
    code_challenge: options.codeChallenge,
    code_challenge_method: 's256',
    scope: (options.scopes || ['design:meta:read', 'design:content:read', 'asset:read']).join(' '),
    response_type: 'code',
    client_id: clientId,
    state: options.state,
    redirect_uri: redirectUri,
  });

  return `${CANVA_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCanvaAuthorizationCode(options: {
  code: string;
  codeVerifier: string;
  redirectUri?: string;
}): Promise<CanvaTokenResponse> {
  const redirectUri = options.redirectUri || getEnv('CANVA_REDIRECT_URI');
  if (!redirectUri) {
    throw new Error('CANVA_REDIRECT_URI is required to exchange an authorization code.');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code_verifier: options.codeVerifier,
    code: options.code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${CANVA_API_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Canva token exchange failed with HTTP ${response.status}.`);
  }

  return response.json() as Promise<CanvaTokenResponse>;
}

export async function refreshCanvaAccessToken(refreshToken = getEnv('CANVA_REFRESH_TOKEN')): Promise<CanvaTokenResponse> {
  if (!refreshToken) {
    throw new Error('CANVA_REFRESH_TOKEN is required to refresh Canva access.');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(`${CANVA_API_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Canva token refresh failed with HTTP ${response.status}.`);
  }

  return response.json() as Promise<CanvaTokenResponse>;
}

export async function createCanvaExportJob(options: {
  accessToken: string;
  designId: string;
  format: CanvaExportFormat;
}): Promise<CanvaExportJob> {
  const response = await fetch(`${CANVA_API_BASE_URL}/exports`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      design_id: options.designId,
      format: options.format,
    }),
  });

  if (!response.ok) {
    throw new Error(`Canva export job failed with HTTP ${response.status}.`);
  }

  return response.json() as Promise<CanvaExportJob>;
}

export async function getCanvaExportJob(options: {
  accessToken: string;
  exportId: string;
}): Promise<CanvaExportJob> {
  const response = await fetch(`${CANVA_API_BASE_URL}/exports/${encodeURIComponent(options.exportId)}`, {
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Canva export status failed with HTTP ${response.status}.`);
  }

  return response.json() as Promise<CanvaExportJob>;
}

export function buildGabrielCanvaContentPlan(): CanvaContentPlan {
  return {
    workflow: 'canva_template_export',
    purpose: 'Use reusable Canva templates for brand-safe creative production and export finished assets without re-prompting AI for layout every time.',
    recommendedUse: [
      'Export approved Canva templates as MP4, PNG, JPG, or PDF.',
      'Generate social graphics from a stable design system.',
      'Hand off AI-written scripts and captions into a human-approved design workflow.',
      'Save model tokens by reusing templates instead of asking an LLM to redesign layouts from scratch.',
    ],
    avoidUse: [
      'Do not use Canva to invent claims, testimonials, pricing, or visual proof.',
      'Do not auto-publish exports.',
      'Do not use pro-quality exports unless Alfred has approved any premium licensing/cost impact.',
    ],
    requiredApproval: true,
    tokenSavingsLogic: 'Gabriel should spend AI tokens on strategy, hooks, captions, and scripts; Canva should handle repeatable visual layout and export.',
  };
}
