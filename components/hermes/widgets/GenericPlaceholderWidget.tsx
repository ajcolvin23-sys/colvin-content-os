import { WidgetShell, WidgetEmpty } from './WidgetShell'

const WIDGET_LABELS: Record<string, string> = {
  next_call: 'Next Discovery Call',
  pending_proposals: 'Pending Proposals',
  weekly_activity: 'This Week',
  lead_magnet_stats: 'Lead Magnet',
  tiktok_queue: 'TikTok Queue',
  email_list_health: 'Email List',
  buyer_funnel: 'Buyer Funnel',
  partner_network: 'Partners',
  content_awaiting_review: 'Content Awaiting Review',
  county_coverage: 'County Coverage',
  listing_requests: 'Listing Requests',
  seo_page_status: 'SEO Pages',
  sponsor_pipeline: 'Sponsors',
  registrations: 'Registrations',
  event_countdown: 'Event Countdown',
  daily_run_status: 'Daily Run',
  cost_log: 'Cost Log',
  locked_upgrades: 'Locked Upgrades',
  skill_registry: 'Skill Registry',
}

export function GenericPlaceholderWidget({ widgetKey }: { hubId: string; hubSlug: string; hubColor: string | null; widgetKey: string }) {
  const label = WIDGET_LABELS[widgetKey] ?? widgetKey
  return (
    <WidgetShell title={label} meta="Coming soon">
      <WidgetEmpty message="This widget is queued for build" />
    </WidgetShell>
  )
}
