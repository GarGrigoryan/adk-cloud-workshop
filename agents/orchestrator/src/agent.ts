import { LlmAgent, RemoteA2AAgent, AgentTool } from '@google/adk';

const INVENTORY_URL = process.env.INVENTORY_AGENT_URL ?? 'http://localhost:8001';
const ORDERS_URL = process.env.ORDERS_AGENT_URL ?? 'http://localhost:8002';
const PRICING_URL = process.env.PRICING_AGENT_URL ?? 'http://localhost:8003';

const inventoryWorker = new RemoteA2AAgent({
  agentCard: INVENTORY_URL,
  name: 'inventory_agent',
  description: 'Specializes in product catalog searches, item descriptions, and looking up real-time warehouse stock counts.',
});

const ordersWorker = new RemoteA2AAgent({
  agentCard: ORDERS_URL,
  name: 'orders_agent',
  description: 'Specializes in retrieving customer order histories, fetching granular order details, and checking return or refund eligibility.',
});

const pricingWorker = new RemoteA2AAgent({
  agentCard: PRICING_URL,
  name: 'pricing_agent',
  description: 'Specializes in pulling TechParts internal prices and performing live web market research to see if we are cheaper or more expensive than competitors.',
});

const inventoryTool = new AgentTool({ agent: inventoryWorker });
const ordersTool = new AgentTool({ agent: ordersWorker });
const pricingTool = new AgentTool({ agent: pricingWorker });

export const rootAgent = new LlmAgent({
  name: 'ops_orchestrator',
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  description: 'Central operations orchestrator that coordinates inventory, orders, and pricing specialists to resolve multi-domain customer requests.',
  instruction: `You are the master operations orchestrator. You do not have direct access to database tools or live market search yourself. Instead, you fulfill complex requests by breaking them down and delegating sub-tasks to your three specialized worker agents: 'inventory_agent', 'orders_agent', and 'pricing_agent'.

Your operating blueprint:
1. **Analyze and Deconstruct:** When a user request arrives, break it down into explicit logical sub-questions (e.g., Identifying an item -> Checking stock -> Looking up order history -> Calculating a price match).
2. **Context-Rich Delegation:** Call the appropriate specialist agent for each sub-question. Because these remote agents cannot see the global conversation history, you MUST pass all relevant context, variables, item names, order IDs, or customer names explicitly inside your tool invocation to them.
3. **Synthesize:** Gather the granular outputs returned by your worker agents. Combine their independent findings into a single, cohesive, professional recommendation or resolution for the end user.

Never make up data, numbers, statuses, or resolutions. Rely entirely on the synthesis of your specialists' replies.`,
  tools: [inventoryTool, ordersTool, pricingTool],
});
