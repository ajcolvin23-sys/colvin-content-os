// ─── Per-Niche Workspace Config ──────────────────────────────────────────────
// Each hub gets its own custom dashboard layout + sidebar nav tailored to what
// that business actually needs daily. This is the source of truth.
// ─────────────────────────────────────────────────────────────────────────────

export type WidgetKey =
  // Sales widgets
  | 'pipeline_summary'
  | 'outreach_queue'
  | 'next_call'
  | 'pending_proposals'
  | 'weekly_activity'
  // Content widgets
  | 'content_calendar'
  | 'content_awaiting_review'
  | 'lead_magnet_stats'
  | 'tiktok_queue'
  | 'email_list_health'
  // Compliance / housing widgets
  | 'compliance_gate'
  | 'buyer_funnel'
  | 'partner_network'
  // SEO widgets
  | 'county_coverage'
  | 'listing_requests'
  | 'seo_page_status'
  // Event widgets
  | 'sponsor_pipeline'
  | 'registrations'
  | 'event_countdown'
  // Agent / system widgets
  | 'daily_run_status'
  | 'cost_log'
  | 'locked_upgrades'
  | 'skill_registry'
  // Generic widgets
  | 'top_tasks'
  | 'recent_research'
  | 'pinned_prompts'
  | 'next_action'

export interface HubNavItem {
  label: string
  href: string  // resolved with the hub slug at render time using {slug}
}

export interface HubWorkspaceConfig {
  // Sidebar items shown when this hub is the active scope
  sidebar: HubNavItem[]
  // Widgets to render on the hub's dashboard, in order
  widgets: WidgetKey[]
  // Optional short description of what daily work in this hub looks like
  daily_brief?: string
}

// Default for any hub not explicitly configured — generic workspace
const DEFAULT_WORKSPACE: HubWorkspaceConfig = {
  sidebar: [
    { label: 'Overview', href: '/h/{slug}' },
    { label: 'Tasks', href: '/h/{slug}/tasks' },
    { label: 'Notes', href: '/h/{slug}/notes' },
    { label: 'Prompts', href: '/h/{slug}/prompts' },
  ],
  widgets: ['next_action', 'top_tasks', 'recent_research', 'pinned_prompts'],
}

/**
 * Parent → child relationships. A child hub is a client/engagement of the parent
 * and does NOT appear in the global niche selector. You only see clients from
 * inside the parent hub's "Clients" sidebar item.
 *
 * Key = child slug, value = parent slug.
 */
export const HUB_PARENTS: Record<string, string> = {
  'urban-legacy-day': 'colvin-enterprises',
}

/**
 * Convenience reverse map: parent slug → array of client slugs.
 */
export function getClientsOf(parentSlug: string): string[] {
  return Object.entries(HUB_PARENTS)
    .filter(([, parent]) => parent === parentSlug)
    .map(([child]) => child)
}

/**
 * Returns true if the given hub is a client of some other hub.
 */
export function isClientHub(slug: string): boolean {
  return slug in HUB_PARENTS
}

export const HUB_WORKSPACES: Record<string, HubWorkspaceConfig> = {
  'colvin-enterprises': {
    daily_brief: 'Move active opportunities forward. Send what\'s in the outreach queue. Show up for discovery calls.',
    sidebar: [
      { label: 'Pipeline', href: '/h/colvin-enterprises' },
      { label: 'Outreach Queue', href: '/h/colvin-enterprises/outreach' },
      { label: 'Discovery Calls', href: '/h/colvin-enterprises/calls' },
      { label: 'Proposals', href: '/h/colvin-enterprises/proposals' },
      { label: 'Clients', href: '/h/colvin-enterprises/clients' },
      { label: 'Won', href: '/h/colvin-enterprises/won' },
      { label: 'Notes', href: '/h/colvin-enterprises/notes' },
    ],
    widgets: [
      'pipeline_summary',
      'outreach_queue',
      'next_call',
      'pending_proposals',
      'weekly_activity',
    ],
  },

  'first-keys-indy': {
    daily_brief: 'Compliance first. Move qualified buyers forward. Publish what passes review.',
    sidebar: [
      { label: 'Buyer Funnel', href: '/h/first-keys-indy' },
      { label: 'Content Pipeline', href: '/h/first-keys-indy/content' },
      { label: 'Compliance Gate', href: '/h/first-keys-indy/compliance' },
      { label: 'Partners', href: '/h/first-keys-indy/partners' },
      { label: 'Calendar', href: '/h/first-keys-indy/calendar' },
    ],
    widgets: [
      'compliance_gate',
      'content_awaiting_review',
      'buyer_funnel',
      'partner_network',
      'content_calendar',
    ],
  },

  'music-theory-secrets': {
    daily_brief: 'Ship one piece of content. Grow the email list. Watch what converts.',
    sidebar: [
      { label: 'Content Calendar', href: '/h/music-theory-secrets' },
      { label: 'Lead Magnet', href: '/h/music-theory-secrets/lead-magnet' },
      { label: 'TikTok Queue', href: '/h/music-theory-secrets/tiktok' },
      { label: 'Email List', href: '/h/music-theory-secrets/email' },
      { label: 'Students', href: '/h/music-theory-secrets/students' },
    ],
    widgets: [
      'lead_magnet_stats',
      'content_calendar',
      'tiktok_queue',
      'email_list_health',
    ],
  },

  'indiana-backflow': {
    daily_brief: 'Programmatic SEO. Fill the directory. Compound page coverage.',
    sidebar: [
      { label: 'Counties', href: '/h/indiana-backflow' },
      { label: 'Listing Requests', href: '/h/indiana-backflow/listings' },
      { label: 'SEO Pages', href: '/h/indiana-backflow/seo' },
      { label: 'Test Reminders', href: '/h/indiana-backflow/reminders' },
    ],
    widgets: ['county_coverage', 'listing_requests', 'seo_page_status'],
  },

  'urban-legacy-day': {
    daily_brief: 'Colvin Enterprises client engagement. Sponsors first. Registrations second. Logistics third.',
    sidebar: [
      { label: 'Sponsors', href: '/h/urban-legacy-day' },
      { label: 'Registrations', href: '/h/urban-legacy-day/registrations' },
      { label: 'Speakers', href: '/h/urban-legacy-day/speakers' },
      { label: 'Logistics', href: '/h/urban-legacy-day/logistics' },
      { label: '← Colvin Clients', href: '/h/colvin-enterprises/clients' },
    ],
    widgets: ['sponsor_pipeline', 'pending_proposals', 'top_tasks', 'content_calendar'],
  },

  'hermes-gabriel': {
    daily_brief: 'Yesterday\'s run. Today\'s skills. Tomorrow\'s upgrades.',
    sidebar: [
      { label: 'Daily Run', href: '/h/hermes-gabriel' },
      { label: 'Cost Log', href: '/h/hermes-gabriel/costs' },
      { label: 'Locked Upgrades', href: '/h/hermes-gabriel/locked' },
      { label: 'Skill Registry', href: '/h/hermes-gabriel/skills' },
    ],
    widgets: ['daily_run_status', 'cost_log', 'locked_upgrades', 'skill_registry'],
  },

  'genius-prompts': {
    daily_brief: 'Catalog. Reuse. Improve. The prompt is the leverage.',
    sidebar: [
      { label: 'Library', href: '/h/genius-prompts' },
      { label: 'Categories', href: '/h/genius-prompts/categories' },
      { label: 'Recently Used', href: '/h/genius-prompts/recent' },
      { label: 'Performance', href: '/h/genius-prompts/performance' },
    ],
    widgets: ['pinned_prompts', 'recent_research'],
  },

  'funding-ready-indiana': {
    daily_brief: 'Grant readiness audits. Church + nonprofit pipeline. Compliance first.',
    sidebar: [
      { label: 'Client Pipeline', href: '/h/funding-ready-indiana' },
      { label: 'Readiness Audits', href: '/h/funding-ready-indiana/audits' },
      { label: 'Grant Library', href: '/h/funding-ready-indiana/grants' },
      { label: 'Compliance', href: '/h/funding-ready-indiana/compliance' },
    ],
    widgets: ['pipeline_summary', 'compliance_gate', 'top_tasks', 'recent_research'],
  },

  'church-nonprofit-ai': {
    daily_brief: 'Close one church per month. AI ops + financial literacy is the wedge.',
    sidebar: [
      { label: 'Client Roster', href: '/h/church-nonprofit-ai' },
      { label: 'Active Setups', href: '/h/church-nonprofit-ai/setups' },
      { label: 'Donor Automations', href: '/h/church-nonprofit-ai/donor' },
      { label: 'Notes', href: '/h/church-nonprofit-ai/notes' },
    ],
    widgets: ['pipeline_summary', 'outreach_queue', 'top_tasks', 'pinned_prompts'],
  },

  'local-biz-automation': {
    daily_brief: 'Productize. Deploy. Stack template wins.',
    sidebar: [
      { label: 'Template Library', href: '/h/local-biz-automation' },
      { label: 'Deployed Clients', href: '/h/local-biz-automation/clients' },
      { label: 'Pipeline', href: '/h/local-biz-automation/pipeline' },
      { label: 'Pricing', href: '/h/local-biz-automation/pricing' },
    ],
    widgets: ['pipeline_summary', 'outreach_queue', 'top_tasks', 'pinned_prompts'],
  },

  'linkedin-outreach': {
    daily_brief: 'Send today\'s 5 connection requests. Reply to anyone who replied. Book calls.',
    sidebar: [
      { label: 'Today\'s Queue', href: '/h/linkedin-outreach' },
      { label: 'Active Conversations', href: '/h/linkedin-outreach/conversations' },
      { label: 'Booked Calls', href: '/h/linkedin-outreach/calls' },
      { label: 'Connection Library', href: '/h/linkedin-outreach/library' },
    ],
    widgets: ['outreach_queue', 'next_call', 'weekly_activity', 'pinned_prompts'],
  },

  'daily-lead-intelligence': {
    daily_brief: 'Review the 25 leads Gabriel surfaced. Approve top 5 for outreach.',
    sidebar: [
      { label: 'Today\'s Leads', href: '/h/daily-lead-intelligence' },
      { label: 'Scoring Queue', href: '/h/daily-lead-intelligence/scoring' },
      { label: 'Approved Queue', href: '/h/daily-lead-intelligence/approved' },
      { label: 'Run Logs', href: '/h/daily-lead-intelligence/logs' },
    ],
    widgets: ['daily_run_status', 'outreach_queue', 'top_tasks', 'cost_log'],
  },

  'gabriel-creative': {
    daily_brief: 'Generate. Adapt. Distribute. The creative system never stops.',
    sidebar: [
      { label: 'Active Campaigns', href: '/h/gabriel-creative' },
      { label: 'Templates', href: '/h/gabriel-creative/templates' },
      { label: 'Asset Library', href: '/h/gabriel-creative/assets' },
      { label: 'Prompts', href: '/h/gabriel-creative/prompts' },
    ],
    widgets: ['content_calendar', 'top_tasks', 'pinned_prompts', 'recent_research'],
  },

  'remotion-video': {
    daily_brief: 'Render the daily ad for each active brand. Review before publish.',
    sidebar: [
      { label: 'Render Queue', href: '/h/remotion-video' },
      { label: 'Today\'s Renders', href: '/h/remotion-video/today' },
      { label: 'Templates', href: '/h/remotion-video/templates' },
      { label: 'Brand Skills', href: '/h/remotion-video/skills' },
    ],
    widgets: ['content_calendar', 'content_awaiting_review', 'top_tasks', 'cost_log'],
  },

  'bible-teaching': {
    daily_brief: 'Write what you actually teach. One outline at a time.',
    sidebar: [
      { label: 'Sermon Outlines', href: '/h/bible-teaching' },
      { label: 'Scripture Index', href: '/h/bible-teaching/scripture' },
      { label: 'Publish Queue', href: '/h/bible-teaching/queue' },
      { label: 'Devotionals', href: '/h/bible-teaching/devotionals' },
    ],
    widgets: ['top_tasks', 'content_calendar', 'pinned_prompts', 'recent_research'],
  },

  'yahweh-comics': {
    daily_brief: 'Build the Samson world. Canon consistency. Visual fidelity.',
    sidebar: [
      { label: 'Story Arcs', href: '/h/yahweh-comics' },
      { label: 'Character Bible', href: '/h/yahweh-comics/characters' },
      { label: 'Panel Scripts', href: '/h/yahweh-comics/panels' },
      { label: 'Canon Notes', href: '/h/yahweh-comics/canon' },
    ],
    widgets: ['top_tasks', 'recent_research', 'pinned_prompts', 'next_action'],
  },

  'girls-got-game': {
    daily_brief: 'Editorial calendar. Player profiles. Sponsor outreach. Consistency wins.',
    sidebar: [
      { label: 'Editorial Calendar', href: '/h/girls-got-game' },
      { label: 'Player Profiles', href: '/h/girls-got-game/players' },
      { label: 'Sponsors', href: '/h/girls-got-game/sponsors' },
      { label: 'Audience', href: '/h/girls-got-game/audience' },
    ],
    widgets: ['content_calendar', 'sponsor_pipeline', 'top_tasks', 'pinned_prompts'],
  },

  'glory-engine-ai': {
    daily_brief: 'Preset recipes. MVP scope. Sound designer feedback loop.',
    sidebar: [
      { label: 'Preset Recipes', href: '/h/glory-engine-ai' },
      { label: 'MVP Roadmap', href: '/h/glory-engine-ai/roadmap' },
      { label: 'DSP Notes', href: '/h/glory-engine-ai/dsp' },
      { label: 'Beta Testers', href: '/h/glory-engine-ai/beta' },
    ],
    widgets: ['top_tasks', 'next_action', 'recent_research', 'pinned_prompts'],
  },

  'comm-eval-engine': {
    daily_brief: 'Rubric. Sample. Score. Improve. Build the eval, then trust it.',
    sidebar: [
      { label: 'Eval Rubric', href: '/h/comm-eval-engine' },
      { label: 'Sample Scores', href: '/h/comm-eval-engine/samples' },
      { label: 'Active Clients', href: '/h/comm-eval-engine/clients' },
      { label: 'Library', href: '/h/comm-eval-engine/library' },
    ],
    widgets: ['top_tasks', 'recent_research', 'pinned_prompts', 'cost_log'],
  },

  'credit-repair-agent': {
    daily_brief: 'BLOCKED — compliance review required before any build activity.',
    sidebar: [
      { label: 'Compliance Review', href: '/h/credit-repair-agent' },
      { label: 'Notes', href: '/h/credit-repair-agent/notes' },
    ],
    widgets: ['next_action', 'recent_research'],
  },
}

/**
 * Resolve hub workspace config by slug. Returns the default workspace if no
 * custom config exists for that slug yet.
 */
export function getHubWorkspace(slug: string | null | undefined): HubWorkspaceConfig {
  if (!slug) return DEFAULT_WORKSPACE
  return HUB_WORKSPACES[slug] ?? DEFAULT_WORKSPACE
}

/**
 * Resolve sidebar items for a hub, replacing {slug} placeholder with the actual slug.
 */
export function getHubSidebar(slug: string | null | undefined): HubNavItem[] {
  const config = getHubWorkspace(slug)
  if (!slug) return config.sidebar
  return config.sidebar.map(item => ({
    ...item,
    href: item.href.replace('{slug}', slug),
  }))
}
