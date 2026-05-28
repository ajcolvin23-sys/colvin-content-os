import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { HUBS_SEED, TASKS_SEED, REVENUE_SEED, RESEARCH_SEED, PROMPTS_SEED, AUTOMATIONS_SEED } from '@/lib/crm/seed-data'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // Check if already seeded
    const { count, error: countError } = await supabase
      .from('hubs')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json({ error: `Table check failed: ${countError.message}` }, { status: 500 })
    }

    if (count && count > 0) {
      return NextResponse.json({ message: 'Already seeded', count }, { status: 409 })
    }

    // Insert hubs
    const { data: insertedHubs, error: hubsError } = await supabase
      .from('hubs')
      .insert(HUBS_SEED.map(h => ({
        name: h.name,
        slug: h.slug,
        description: h.description,
        category: h.category,
        status: h.status,
        priority: h.priority,
        revenue_potential: h.revenue_potential,
        color: h.color,
        icon: h.icon,
        next_action: h.next_action,
      })))
      .select('id, slug')

    if (hubsError) {
      return NextResponse.json({ error: `Hubs insert failed: ${hubsError.message}` }, { status: 500 })
    }

    if (!insertedHubs) {
      return NextResponse.json({ error: 'No hubs returned after insert' }, { status: 500 })
    }

    // Build slug → id map
    const slugToId = Object.fromEntries(insertedHubs.map(h => [h.slug, h.id]))

    // Insert tasks
    const tasksWithHubIds = TASKS_SEED
      .filter(t => slugToId[t.hub_slug])
      .map(({ hub_slug, ...rest }) => ({
        ...rest,
        hub_id: slugToId[hub_slug],
      }))

    const { error: tasksError } = await supabase
      .from('crm_tasks')
      .insert(tasksWithHubIds)

    if (tasksError) {
      return NextResponse.json({ error: `Tasks insert failed: ${tasksError.message}` }, { status: 500 })
    }

    // Insert revenue opportunities
    const revenueWithHubIds = REVENUE_SEED
      .filter(r => slugToId[r.hub_slug])
      .map(({ hub_slug, ...rest }) => ({
        ...rest,
        hub_id: slugToId[hub_slug],
      }))

    const { error: revenueError } = await supabase
      .from('revenue_opportunities')
      .insert(revenueWithHubIds)

    if (revenueError) {
      return NextResponse.json({ error: `Revenue insert failed: ${revenueError.message}` }, { status: 500 })
    }

    // Insert research notes
    const researchWithHubIds = RESEARCH_SEED
      .filter(r => slugToId[r.hub_slug])
      .map(({ hub_slug, ...rest }) => ({
        ...rest,
        hub_id: slugToId[hub_slug],
      }))

    const { error: researchError } = await supabase
      .from('research_notes')
      .insert(researchWithHubIds)

    if (researchError) {
      return NextResponse.json({ error: `Research insert failed: ${researchError.message}` }, { status: 500 })
    }

    // Insert prompts
    const promptsWithHubIds = PROMPTS_SEED
      .filter(p => slugToId[p.hub_slug])
      .map(({ hub_slug, ...rest }) => ({
        ...rest,
        hub_id: slugToId[hub_slug],
      }))

    const { error: promptsError } = await supabase
      .from('prompts')
      .insert(promptsWithHubIds)

    if (promptsError) {
      return NextResponse.json({ error: `Prompts insert failed: ${promptsError.message}` }, { status: 500 })
    }

    // Insert automations
    const automationsWithHubIds = AUTOMATIONS_SEED
      .filter(a => slugToId[a.hub_slug])
      .map(({ hub_slug, ...rest }) => ({
        ...rest,
        hub_id: slugToId[hub_slug],
      }))

    const { error: automationsError } = await supabase
      .from('crm_automations')
      .insert(automationsWithHubIds)

    if (automationsError) {
      return NextResponse.json({ error: `Automations insert failed: ${automationsError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      counts: {
        hubs: insertedHubs.length,
        tasks: tasksWithHubIds.length,
        revenue: revenueWithHubIds.length,
        research: researchWithHubIds.length,
        prompts: promptsWithHubIds.length,
        automations: automationsWithHubIds.length,
      }
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
