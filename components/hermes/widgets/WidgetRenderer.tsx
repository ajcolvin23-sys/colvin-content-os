import { PipelineSummaryWidget } from './PipelineSummaryWidget'
import { OutreachQueueWidget } from './OutreachQueueWidget'
import { TopTasksWidget } from './TopTasksWidget'
import { NextActionWidget } from './NextActionWidget'
import { ContentCalendarWidget } from './ContentCalendarWidget'
import { ComplianceGateWidget } from './ComplianceGateWidget'
import { RecentResearchWidget } from './RecentResearchWidget'
import { PinnedPromptsWidget } from './PinnedPromptsWidget'
import { GenericPlaceholderWidget } from './GenericPlaceholderWidget'
import { DailyRunStatusWidget } from './DailyRunStatusWidget'
import { CostLogWidget } from './CostLogWidget'
import { LockedUpgradesWidget } from './LockedUpgradesWidget'
import { SkillRegistryWidget } from './SkillRegistryWidget'
import { NextCallWidget } from './NextCallWidget'
import { PendingProposalsWidget } from './PendingProposalsWidget'
import { WeeklyActivityWidget } from './WeeklyActivityWidget'
import { BuyerFunnelWidget } from './BuyerFunnelWidget'
import { PartnerNetworkWidget } from './PartnerNetworkWidget'
import { ContentAwaitingReviewWidget } from './ContentAwaitingReviewWidget'
import { LeadMagnetStatsWidget } from './LeadMagnetStatsWidget'
import { TikTokQueueWidget } from './TikTokQueueWidget'
import { EmailListHealthWidget } from './EmailListHealthWidget'
import { SponsorPipelineWidget } from './SponsorPipelineWidget'
import { CountyCoverageWidget } from './CountyCoverageWidget'
import type { WidgetKey } from '@/lib/crm/hub-config'

interface WidgetRendererProps {
  widget: WidgetKey
  hubId: string
  hubSlug: string
  hubColor: string | null
}

export async function WidgetRenderer({ widget, hubId, hubSlug, hubColor }: WidgetRendererProps) {
  const props = { hubId, hubSlug, hubColor }

  switch (widget) {
    // Sales
    case 'pipeline_summary':           return <PipelineSummaryWidget {...props} />
    case 'outreach_queue':             return <OutreachQueueWidget {...props} />
    case 'next_call':                  return <NextCallWidget {...props} />
    case 'pending_proposals':          return <PendingProposalsWidget {...props} />
    case 'weekly_activity':            return <WeeklyActivityWidget {...props} />
    // Content
    case 'content_calendar':           return <ContentCalendarWidget {...props} />
    case 'content_awaiting_review':    return <ContentAwaitingReviewWidget {...props} />
    case 'lead_magnet_stats':          return <LeadMagnetStatsWidget {...props} />
    case 'tiktok_queue':               return <TikTokQueueWidget {...props} />
    case 'email_list_health':          return <EmailListHealthWidget {...props} />
    // Compliance / housing
    case 'compliance_gate':            return <ComplianceGateWidget {...props} />
    case 'buyer_funnel':               return <BuyerFunnelWidget {...props} />
    case 'partner_network':            return <PartnerNetworkWidget {...props} />
    // SEO
    case 'county_coverage':            return <CountyCoverageWidget {...props} />
    // Event
    case 'sponsor_pipeline':           return <SponsorPipelineWidget {...props} />
    // Agent
    case 'daily_run_status':           return <DailyRunStatusWidget />
    case 'cost_log':                   return <CostLogWidget />
    case 'locked_upgrades':            return <LockedUpgradesWidget />
    case 'skill_registry':             return <SkillRegistryWidget />
    // Generic
    case 'top_tasks':                  return <TopTasksWidget {...props} />
    case 'next_action':                return <NextActionWidget {...props} />
    case 'recent_research':            return <RecentResearchWidget {...props} />
    case 'pinned_prompts':             return <PinnedPromptsWidget {...props} />
    default:
      return <GenericPlaceholderWidget {...props} widgetKey={widget} />
  }
}
