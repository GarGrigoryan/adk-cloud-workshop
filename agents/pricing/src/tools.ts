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
  const db = openDb();

  let product = db.get(
    'SELECT sku, name, price AS ourPrice FROM products WHERE UPPER(sku) = UPPER(?)',
    [input.skuOrName]
  );

  if (!product) {
    product = db.get(
      'SELECT sku, name, price AS ourPrice FROM products WHERE name LIKE ? LIMIT 1',
      [`%${input.skuOrName}%`]
    );
  }

  if (!product) {
    return { error: `Product matching '${input.skuOrName}' could not be found.` };
  }

  return product;
}

export const getOurPriceTool = new FunctionTool({
  name: 'get_our_price',
  description: "Retrieve TechParts' selling price, official product name, and stock keeping unit (SKU) by passing either an exact SKU code or a partial product name.",
  parameters: z.object({
    skuOrName: z.string().describe('The strict alphanumeric SKU identifier or a descriptive segment of the product name.'),
  }),
  execute: async (args) => {
    return getOurPrice(args);
  },
});