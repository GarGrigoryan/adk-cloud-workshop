import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import { openDb } from '@techparts/shared';

// TODO(workshop): Implement the pricing tool.
//
// Build one tool backed by the SQLite `products` table:
//   get_our_price — TechParts' own selling price for a product, by SKU or
//   (partial) product name. Fall back to a name search when no SKU matches.
//
// Use openDb() to query the database (see shared/src/db.ts). The tests in
// test/tools.test.ts describe the exact shapes you need to return.

export function getOurPrice(input: { skuOrName: string }): any {
  // TODO: return `{ sku, name, ourPrice }`, or `{ error }` if not found.
  throw new Error('Not implemented: getOurPrice');
}

export const getOurPriceTool = new FunctionTool({
  name: 'get_our_price',
  description: 'TODO: describe this tool so the model knows when and how to call it.',
  parameters: z.object({
    // TODO: define the parameters (e.g. skuOrName) with .describe() hints.
  }),
  execute: async () => getOurPrice({ skuOrName: '' }),
});
