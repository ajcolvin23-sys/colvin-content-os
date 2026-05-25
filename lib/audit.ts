import { createAdminClient } from '@/lib/supabase/admin'

export async function logAction(
  action: string,
  entityType: string,
  entityId?: string,
  entityTitle?: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    const supabase = createAdminClient()
    await supabase.from('content_audit_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_title: entityTitle,
      metadata,
    })
  } catch (err) {
    // Non-fatal — log to console but don't throw
    console.error('[audit]', action, entityType, err)
  }
}
