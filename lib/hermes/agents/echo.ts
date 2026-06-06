// Sample agents used to prove the spine end-to-end (Phase 0 exit criteria).
// They are deterministic (no LLM) so the test is fast, free, and offline.

import type { Agent } from '../types'

interface EchoInput { message: string }
interface EchoOutput { echoed: string; length: number }

export const echoAgent: Agent<EchoInput, EchoOutput> = {
  name: 'sample.echo',
  description: 'Echoes a message back with its length. Used to verify the mesh spine.',
  kind: 'deterministic',
  inputSchema: {
    type: 'object',
    required: ['message'],
    properties: { message: { type: 'string', minLength: 1 } },
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    required: ['echoed', 'length'],
    properties: { echoed: { type: 'string' }, length: { type: 'number' } },
    additionalProperties: false,
  },
  async run(input, ctx) {
    ctx.log(`echoing "${input.message}"`)
    return { echoed: input.message, length: input.message.length }
  },
}

interface ShoutOutput { shouted: string }

export const shoutAgent: Agent<EchoOutput, ShoutOutput> = {
  name: 'sample.shout',
  description: 'Uppercases the echoed message. Proves data flows between pipeline steps.',
  kind: 'deterministic',
  inputSchema: {
    type: 'object',
    required: ['echoed'],
    properties: { echoed: { type: 'string' }, length: { type: 'number' } },
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    required: ['shouted'],
    properties: { shouted: { type: 'string' } },
    additionalProperties: false,
  },
  async run(input, ctx) {
    ctx.log(`shouting`)
    return { shouted: input.echoed.toUpperCase() + '!' }
  },
}
