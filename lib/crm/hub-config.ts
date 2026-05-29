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

export const HUB_WORKSPACES: Record<string, HubWorkspaceConfig> = {
  'colvin-enterprises': {
    daily_brief: 'Move active opportunities forward. Send what\'s in the outreach queue. Show up for discovery calls.',
    sidebar: [
      { label: 'Pipeline', href: '/h/colvin-enterprises' },
      { label: 'Outreach Queue', href: '/h/colvin-enterprises/outreach' },
      { label: 'Discovery Calls', href: '/h/colvin-enterprises/calls' },
      { label: 'Proposals', href: '/h/colvin-enterprises/proposals' },
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
    daily_brief: 'Sponsors first. Registrations second. Logistics third.',
    sidebar: [
      { label: 'Sponsors', href: '/h/urban-legacy-day' },
      { label: 'Registrations', href: '/h/urban-legacy-day/registrations' },
      { label: 'Speakers', href: '/h/urban-legacy-day/speakers' },
      { label: 'Logistics', href: '/h/urban-legacy-day/logistics' },
    ],
    widgets: ['sponsor_pipeline', 'registrations', 'event_countdown'],
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
