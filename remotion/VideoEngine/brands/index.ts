import type { BrandConfig, BrandId } from '../types';

const colvinEnterprises: BrandConfig = {
  id: 'colvin_enterprises',
  name: 'Colvin Enterprises',
  primary_color: '#1A1A2E',
  secondary_color: '#16213E',
  background_color: '#080A0F',
  text_color: '#FFFFFF',
  accent_color: '#4FC3F7',
  font_headline: 'Inter',
  font_body: 'Inter',
  tagline: 'AI That Works While You Sleep',
  compliance_notes: [
    'No guaranteed ROI claims',
    'No "you will get X clients" language',
    'Case studies must be real and verifiable',
  ],
};

const firstKeysIndy: BrandConfig = {
  id: 'first_keys_indy',
  name: 'First Keys Indy',
  primary_color: '#1B4332',
  secondary_color: '#2D6A4F',
  background_color: '#0D1F1A',
  text_color: '#FFFFFF',
  accent_color: '#74C69D',
  font_headline: 'Inter',
  font_body: 'Inter',
  tagline: 'Your First Home Starts Here',
  compliance_notes: [
    'NEVER say "you will qualify" — always say "you may qualify"',
    'HUD/RESPA language required on financial claims',
    'Always recommend contacting a HUD-approved lender',
    'Never guarantee DPA approval or specific dollar amounts',
    'Katrina review required before publishing',
  ],
};

const indianaBackflow: BrandConfig = {
  id: 'indiana_backflow',
  name: 'Indiana Backflow Directory',
  primary_color: '#1C3D5A',
  secondary_color: '#2E6D9E',
  background_color: '#0A1929',
  text_color: '#FFFFFF',
  accent_color: '#60A5FA',
  font_headline: 'Inter',
  font_body: 'Inter',
  tagline: 'Find Certified Testers in Your County',
  compliance_notes: [
    'No legal advice — only educational content',
    'Licensing claims must reference verifiable state records',
    'No contractor guarantees',
  ],
};

const musicTheorySecrets: BrandConfig = {
  id: 'music_theory_secrets',
  name: 'Music Theory Secrets',
  primary_color: '#2D1B4E',
  secondary_color: '#4A2C7A',
  background_color: '#12091F',
  text_color: '#FFFFFF',
  accent_color: '#C77DFF',
  font_headline: 'Inter',
  font_body: 'Inter',
  tagline: 'Gospel Piano — Finally Makes Sense',
  compliance_notes: [
    'No "you will become a professional musician" claims',
    'No fabricated testimonials',
    'Faith-adjacent content welcome — not preachy',
  ],
};

const pianoApp: BrandConfig = {
  id: 'piano_app',
  name: 'Piano App',
  primary_color: '#1A1A2E',
  secondary_color: '#252550',
  background_color: '#080810',
  text_color: '#FFFFFF',
  accent_color: '#FFD166',
  font_headline: 'Inter',
  font_body: 'Inter',
  tagline: 'Learn Piano at Your Own Pace',
  compliance_notes: [
    'App is in development — no launch date commitments',
    'No ability claims without evidence',
  ],
};

const fundingReadyIndiana: BrandConfig = {
  id: 'funding_ready_indiana',
  name: 'FundingReady Indiana',
  primary_color: '#1A3A1A',
  secondary_color: '#2D5A2D',
  background_color: '#0A150A',
  text_color: '#FFFFFF',
  accent_color: '#6BCB77',
  font_headline: 'Inter',
  font_body: 'Inter',
  tagline: 'Indiana Businesses Deserve Better Funding Access',
  compliance_notes: [
    'No guarantee of funding or grant approval',
    'Legal disclaimer required on all content',
    'Katrina review required before publishing',
    'Results vary — always disclose',
  ],
};

const girlsGotGame: BrandConfig = {
  id: 'girls_got_game',
  name: 'Girls Got Game',
  primary_color: '#8B0000',
  secondary_color: '#C62828',
  background_color: '#1A0000',
  text_color: '#FFFFFF',
  accent_color: '#FF8A65',
  font_headline: 'Inter',
  font_body: 'Inter',
  tagline: 'Building Tomorrow\'s Leaders Today',
  compliance_notes: [
    'Youth-safe content only — no PII for minors',
    'Outreach to adults only (parents, coaches, administrators)',
    'Nonprofit tone — never commercial',
    'Katrina review required for ALL content',
    'No images of minors without parental consent',
  ],
};

const gloryEngine: BrandConfig = {
  id: 'glory_engine',
  name: 'GloryEngine / Yahweh Comics',
  primary_color: '#4A0E8F',
  secondary_color: '#7B2FBE',
  background_color: '#180733',
  text_color: '#FFFFFF',
  accent_color: '#FFD700',
  font_headline: 'Inter',
  font_body: 'Inter',
  tagline: 'Faith-Powered Stories',
  compliance_notes: [
    'Faith-aligned messaging only',
    'Positive, uplifting content — no controversy',
    'No political positions',
    'No denominational disputes',
  ],
};

// ── Brand Registry ────────────────────────────────────────────────────────────
export const BRANDS: Record<BrandId, BrandConfig> = {
  colvin_enterprises: colvinEnterprises,
  first_keys_indy: firstKeysIndy,
  indiana_backflow: indianaBackflow,
  music_theory_secrets: musicTheorySecrets,
  piano_app: pianoApp,
  funding_ready_indiana: fundingReadyIndiana,
  girls_got_game: girlsGotGame,
  glory_engine: gloryEngine,
};

export function getBrand(id: BrandId): BrandConfig {
  const brand = BRANDS[id];
  if (!brand) throw new Error(`Unknown brand: ${id}`);
  return brand;
}
