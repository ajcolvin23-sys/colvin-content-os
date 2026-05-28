export type HubStatus = 'Idea'|'Active'|'Building'|'Revenue Focus'|'On Hold'|'Future'|'Needs Review'|'Completed'
export type HubPriority = 'Critical'|'High'|'Medium'|'Low'|'Future'
export type TaskStatus = 'Backlog'|'To Do'|'In Progress'|'Waiting'|'Needs Review'|'Approved'|'Done'|'Blocked'
export type RevenueStage = 'New'|'Discovery'|'Proposal'|'Negotiation'|'Verbal Yes'|'Won'|'Lost'|'Nurture'
export type ApprovalStatus = 'Pending'|'Approved'|'Rejected'|'Needs Changes'

export interface Hub {
  id: string
  user_id: string | null
  name: string
  slug: string
  description: string | null
  category: string | null
  status: string
  priority: string
  revenue_potential: string | null
  color: string | null
  icon: string | null
  next_action: string | null
  created_at: string
  updated_at: string
}

export interface CrmTask {
  id: string
  user_id: string | null
  hub_id: string | null
  project_id: string | null
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  assigned_to: string | null
  next_action: string | null
  created_at: string
  updated_at: string
}

export interface RevenueOpportunity {
  id: string
  user_id: string | null
  hub_id: string | null
  lead_id: string | null
  title: string
  amount: number
  stage: string
  probability: number
  close_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ResearchNote {
  id: string
  user_id: string | null
  hub_id: string | null
  title: string
  source: string | null
  summary: string | null
  evidence_quality: string
  tags: string[] | null
  action_items: string | null
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: string
  user_id: string | null
  hub_id: string | null
  title: string
  category: string | null
  prompt_text: string | null
  model_target: string | null
  use_case: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface CrmAutomation {
  id: string
  user_id: string | null
  hub_id: string | null
  name: string
  trigger_type: string | null
  workflow_description: string | null
  tools_required: string[] | null
  status: string
  last_run_at: string | null
  error_log: string | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  user_id: string | null
  hub_id: string | null
  name: string
  goal: string | null
  audience: string | null
  offer: string | null
  start_date: string | null
  end_date: string | null
  status: string
  metrics: Record<string,unknown>
  created_at: string
  updated_at: string
}

export interface HermesAgentLog {
  id: string
  user_id: string | null
  hub_id: string | null
  agent_name: string | null
  action_taken: string | null
  result: string | null
  error: string | null
  confidence_level: string | null
  human_review_required: boolean
  created_at: string
}

export interface HermesApproval {
  id: string
  user_id: string | null
  hub_id: string | null
  item_type: string | null
  item_id: string | null
  title: string | null
  description: string | null
  proposed_action: string | null
  risk_level: string
  status: string
  reviewed_at: string | null
  reviewer_notes: string | null
  created_at: string
  updated_at: string
}
