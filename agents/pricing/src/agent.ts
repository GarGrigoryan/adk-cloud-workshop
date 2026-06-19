import { LlmAgent } from '@google/adk';
import { getOurPriceTool } from './tools.ts';

// TODO(workshop): Build the pricing agent.
//
// It should compare TechParts' own price against the current market:
// - get_our_price gives our price (already wired below).
// - For market prices you need web search. The built-in GOOGLE_SEARCH tool
//   can't live in the same `tools` array as a function tool, so the ADK pattern
//   is to put GOOGLE_SEARCH on its own small LlmAgent and expose that agent here
//   via AgentTool. Build that market-research sub-agent and add it to `tools`.
//   (See the slides on built-in tools and AgentTool composition.)
//
// Then write an `instruction` that always fetches our price AND researches the
// market, compares them, and states clearly whether we're cheaper / in line /
// more expensive.
export const rootAgent = new LlmAgent({
  name: 'pricing_agent',
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  description: 'TODO: one line describing what the pricing agent does.',
  instruction: 'TODO: write the system instruction for the pricing agent.',
  tools: [getOurPriceTool],
});
