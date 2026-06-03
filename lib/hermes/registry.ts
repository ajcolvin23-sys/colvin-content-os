// ─── Hermes Agent Registry ──────────────────────────────────────────────────
// One import surface for every agent in the mesh. Agents self-register by calling
// registerAgent() at module load, or are registered in bulk via registerAll().

import type { Agent } from './types'

const REGISTRY = new Map<string, Agent>()

export function registerAgent(agent: Agent): void {
  if (REGISTRY.has(agent.name)) {
    throw new Error(`Agent "${agent.name}" is already registered — names must be unique.`)
  }
  REGISTRY.set(agent.name, agent)
}

export function registerAll(agents: Agent[]): void {
  for (const a of agents) registerAgent(a)
}

export function getAgent(name: string): Agent {
  const a = REGISTRY.get(name)
  if (!a) {
    throw new Error(
      `Agent "${name}" not found in registry. Registered: ${listAgents().join(', ') || '(none)'}`
    )
  }
  return a
}

export function hasAgent(name: string): boolean {
  return REGISTRY.has(name)
}

export function listAgents(): string[] {
  return [...REGISTRY.keys()].sort()
}

export function describeAgents(): Array<{ name: string; kind: string; taskType?: string; description?: string }> {
  return listAgents().map((name) => {
    const a = REGISTRY.get(name)!
    return { name: a.name, kind: a.kind, taskType: a.taskType, description: a.description }
  })
}

/** Test/dev only — clears the registry. */
export function _resetRegistry(): void {
  REGISTRY.clear()
}
