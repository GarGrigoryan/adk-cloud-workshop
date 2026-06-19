import { LlmAgent } from '@google/adk';
import { getStockTool, searchProductsTool } from './tools.ts';

// TODO(workshop): Build the inventory agent.
// - Write a `description` (used in its A2A agent card so peers know what it does).
// - Write an `instruction` telling it how and when to use its tools, and to
//   base every answer on tool results (never invent products, prices or stock).
export const rootAgent = new LlmAgent({
  name: 'inventory_agent',
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  description: 'TODO: one line describing what the inventory agent does.',
  instruction: 'TODO: write the system instruction for the inventory agent.',
  tools: [searchProductsTool, getStockTool],
});
