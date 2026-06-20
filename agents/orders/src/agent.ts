import { LlmAgent } from '@google/adk';
import { checkReturnEligibilityTool, getCustomerOrdersTool, getOrderDetailsTool } from './tools.ts';

// TODO(workshop): Build the orders agent.
// - Write a `description` (used in its A2A agent card so peers know what it does).
// - Write an `instruction` telling it how and when to use its tools. In
//   particular, for any return question it should run check_return_eligibility
//   and report the reason and days left, and never invent orders or outcomes.
export const rootAgent = new LlmAgent({
  name: 'orders_agent',
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  description: 'Manages customer orders, retrieves purchase histories, details, and determines return eligibility.',
  instruction: `You are an orders and returns specialist agent. Your core objective is to assist users with their order histories, order details, and return requests using your tools.

TOOL USAGE RULES:
1. Use 'getCustomerOrdersTool' to retrieve a list of orders for a customer.
2. Use 'getOrderDetailsTool' to look up specific information about a given order ID.
3. For ANY question regarding returns or refunds, you MUST run 'checkReturnEligibilityTool'. When reporting the outcome, you must explicitly state the reason provided by the tool and the number of days left for the return.

CRITICAL GUARDRAILS:
- Never invent order IDs, tracking information, history, or outcomes.
- Base every single answer strictly on the results returned by your tools. If an order or a return status cannot be verified via the tools, inform the user clearly without assuming the outcome.`,
  tools: [getCustomerOrdersTool, getOrderDetailsTool, checkReturnEligibilityTool],
});
