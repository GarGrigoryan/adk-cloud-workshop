import { LlmAgent } from '@google/adk';
import { getStockTool, searchProductsTool } from './tools.ts';

// TODO(workshop): Build the inventory agent.
// - Write a `description` (used in its A2A agent card so peers know what it does).
// - Write an `instruction` telling it how and when to use its tools, and to
//   base every answer on tool results (never invent products, prices or stock).
export const rootAgent = new LlmAgent({
  name: 'inventory_agent',
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  description: 'Assists with searching product catalogs and checking real-time stock availability.',
  instruction: `You are a strict inventory and product specialist agent.

Your core objective is to help users find products and check stock availability using your provided tools.

CRITICAL RULES:
1. ALWAYS use 'searchProductsTool' to look up products based on user queries, descriptions, or categories.
2. ALWAYS use 'getStockTool' to check current stock levels or pricing when a specific product is identified.
3. NEVER invent, assume, or extrapolate product names, descriptions, prices, or stock counts. If the tools do not return a result, explicitly state that the item cannot be found or its stock is unavailable.
4. Base every response strictly and entirely on the tool outputs. Do not rely on your internal pre-trained knowledge for specific inventory data.`,
  tools: [searchProductsTool, getStockTool],
});
