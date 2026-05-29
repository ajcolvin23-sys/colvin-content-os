import { PipelineSummaryWidget } from './PipelineSummaryWidget'
import { OutreachQueueWidget } from './OutreachQueueWidget'
import { TopTasksWidget } from './TopTasksWidget'
import { NextActionWidget } from './NextActionWidget'
import { ContentCalendarWidget } from './ContentCalendarWidget'
import { ComplianceGateWidget } from './ComplianceGateWidget'
import { RecentResearchWidget } from './RecentResearchWidget'
import { PinnedPromptsWidget } from './PinnedPromptsWidget'
import { GenericPlaceholderWidget } from './GenericPlaceholderWidget'
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
    case 'pipeline_summary':           return <PipelineSummaryWidget {...props} />
    case 'outreach_queue':             return <OutreachQueueWidget {...props} />
    case 'top_tasks':                  return <TopTasksWidget {...props} />
    case 'next_action':                return <NextActionWidget {...props} />
    case 'content_calendar':           return <ContentCalendarWidget {...props} />
    case 'compliance_gate':            return <ComplianceGateWidget {...props} />
    case 'recent_research':            return <RecentResearchWidget {...props} />
    case 'pinned_prompts':             return <PinnedPromptsWidget {...props} />
    default:
      return <GenericPlaceholderWidget {...props} widgetKey={widget} />
  }
}
