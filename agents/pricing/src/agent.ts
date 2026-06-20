import { LlmAgent, GOOGLE_SEARCH, AgentTool } from '@google/adk';
import { getOurPriceTool } from './tools.ts';

const marketResearchAgent = new LlmAgent({
  name: 'market_research_agent',
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  description: 'Searches the live web to find current competitor market pricing for tech products.',
  instruction: 'You are a web search assistant. Your sole task is to search the internet to find the current market prices or competitor prices for the specified product. Return clean, factual price points.',
  tools: [GOOGLE_SEARCH],
});

const marketResearchTool = new AgentTool({
  agent: marketResearchAgent,
});

export const rootAgent = new LlmAgent({
  name: 'pricing_agent',
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  description: 'Compares internal TechParts pricing against live external competitor rates.',
  instruction: `You are a strategic pricing analysis specialist. Your job is to determine how TechParts' pricing matches up against the current online market.

When evaluating a product's price, you MUST follow these steps:
1. Always call 'getOurPriceTool' to retrieve our current internal price for the item.
2. Always call 'market_research_agent' to research what competitors or the general market are charging for the exact same item.
3. Compare the two price points.
4. Provide a clear, direct summary stating whether TechParts is cheaper, in line with, or more expensive than the current market. Cite the specific numbers found.

Never guess, assume, or hallucinate our internal price or the competitor price without running both tools.`,
  tools: [getOurPriceTool, marketResearchTool],
});
