import { LlmAgent } from '@google/adk';

const INVENTORY_URL = process.env.INVENTORY_AGENT_URL ?? 'http://localhost:8001';
const ORDERS_URL = process.env.ORDERS_AGENT_URL ?? 'http://localhost:8002';
const PRICING_URL = process.env.PRICING_AGENT_URL ?? 'http://localhost:8003';

// TODO(workshop): Build the orchestrator.
//
// The orchestrator has no tools or data of its own — it coordinates the three
// worker agents, each running as its own service, over the A2A protocol:
// - For each worker, create a RemoteA2AAgent whose `agentCard` is the worker's
//   base URL (use the constants above). Give each a clear `description` so the
//   orchestrator knows when to delegate to it.
// - Wrap each RemoteA2AAgent in an AgentTool and add them to `tools` below.
// - Write an `instruction` that breaks a case into sub-questions, delegates each
//   to the right specialist (passing all needed context, since the specialists
//   don't see this conversation), and synthesizes one recommendation.
//   (See the slides on A2A, RemoteA2AAgent and AgentTool.)
export const rootAgent = new LlmAgent({
  name: 'ops_orchestrator',
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  description: 'TODO: one line describing the orchestrator.',
  instruction: 'TODO: write the orchestrator instruction (how to delegate and synthesize).',
  tools: [],
});
