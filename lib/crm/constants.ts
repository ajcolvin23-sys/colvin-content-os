export const HUB_STATUSES = ['Idea','Active','Building','Revenue Focus','On Hold','Future','Needs Review','Completed'] as const
export const HUB_PRIORITIES = ['Critical','High','Medium','Low','Future'] as const
export const TASK_STATUSES = ['Backlog','To Do','In Progress','Waiting','Needs Review','Approved','Done','Blocked'] as const
export const LEAD_STAGES = ['New','Researched','Qualified','Outreach Drafted','Contacted','Follow-Up Needed','Responded','Call Booked','Proposal Sent','Negotiation','Won','Lost','Nurture'] as const
export const CONTENT_STATUSES = ['Idea','Researched','Scripted','Designed','In Production','Ready to Publish','Published','Repurpose','Archived'] as const
export const EVIDENCE_LABELS = ['Verified','Strong Evidence','Reasoned Inference','Assumption','Needs Verification','Outdated','Contradicted'] as const
export const REVENUE_STAGES = ['New','Discovery','Proposal','Negotiation','Verbal Yes','Won','Lost','Nurture'] as const
export const AUTOMATION_STATUSES = ['Draft','Active','Paused','Failed','Needs Review','Deprecated'] as const
export const APPROVAL_STATUSES = ['Pending','Approved','Rejected','Needs Changes'] as const

export const STATUS_COLORS: Record<string,string> = {
  'Active': 'bg-emerald-500/10 text-emerald-400',
  'Revenue Focus': 'bg-emerald-500/10 text-emerald-400',
  'Won': 'bg-emerald-500/10 text-emerald-400',
  'Approved': 'bg-emerald-500/10 text-emerald-400',
  'Published': 'bg-emerald-500/10 text-emerald-400',
  'Done': 'bg-emerald-500/10 text-emerald-400',
  'Building': 'bg-blue-500/10 text-blue-400',
  'In Progress': 'bg-blue-500/10 text-blue-400',
  'Proposal': 'bg-blue-500/10 text-blue-400',
  'Contacted': 'bg-blue-500/10 text-blue-400',
  'Idea': 'bg-slate-500/10 text-slate-400',
  'New': 'bg-slate-500/10 text-slate-400',
  'Draft': 'bg-slate-500/10 text-slate-400',
  'Backlog': 'bg-slate-500/10 text-slate-400',
  'On Hold': 'bg-amber-500/10 text-amber-400',
  'Paused': 'bg-amber-500/10 text-amber-400',
  'Waiting': 'bg-amber-500/10 text-amber-400',
  'Needs Review': 'bg-orange-500/10 text-orange-400',
  'Needs Changes': 'bg-orange-500/10 text-orange-400',
  'Needs Verification': 'bg-orange-500/10 text-orange-400',
  'Future': 'bg-violet-500/10 text-violet-400',
  'Nurture': 'bg-violet-500/10 text-violet-400',
  'Blocked': 'bg-red-500/10 text-red-400',
  'Failed': 'bg-red-500/10 text-red-400',
  'Lost': 'bg-red-500/10 text-red-400',
  'Rejected': 'bg-red-500/10 text-red-400',
  'Deprecated': 'bg-red-500/10 text-red-400',
  'Pending': 'bg-amber-500/10 text-amber-400',
  'Verbal Yes': 'bg-emerald-500/10 text-emerald-400',
  'Negotiation': 'bg-blue-500/10 text-blue-400',
  'Completed': 'bg-emerald-500/10 text-emerald-400',
}

export const PRIORITY_COLORS: Record<string,string> = {
  'Critical': 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  'High': 'bg-amber-500/10 text-amber-400',
  'Medium': 'bg-slate-500/10 text-slate-400',
  'Low': 'bg-slate-700/50 text-slate-500',
  'Future': 'bg-violet-500/10 text-violet-400',
}

export const EVIDENCE_COLORS: Record<string,string> = {
  'Verified': 'bg-emerald-500/10 text-emerald-400',
  'Strong Evidence': 'bg-blue-500/10 text-blue-400',
  'Reasoned Inference': 'bg-sky-500/10 text-sky-400',
  'Assumption': 'bg-amber-500/10 text-amber-400',
  'Needs Verification': 'bg-orange-500/10 text-orange-400',
  'Outdated': 'bg-slate-500/10 text-slate-400',
  'Contradicted': 'bg-red-500/10 text-red-400',
}
