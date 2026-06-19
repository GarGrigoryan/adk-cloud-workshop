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
  description: 'TODO: one line describing what the orders agent does.',
  instruction: 'TODO: write the system instruction for the orders agent.',
  tools: [getCustomerOrdersTool, getOrderDetailsTool, checkReturnEligibilityTool],
});
