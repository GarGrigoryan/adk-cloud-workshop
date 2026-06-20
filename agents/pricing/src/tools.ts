import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import { openDb } from '@techparts/shared';

export function getOurPrice(input: { skuOrName: string }): any {
  const db = openDb();

  const skuStmt = db.prepare('SELECT sku, name, price AS ourPrice FROM products WHERE UPPER(sku) = UPPER(?)');
  let product = skuStmt.get(input.skuOrName);

  if (!product) {
    const nameStmt = db.prepare('SELECT sku, name, price AS ourPrice FROM products WHERE name LIKE ? LIMIT 1');
    product = nameStmt.get(`%${input.skuOrName}%`);
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
  execute: async (args) => getOurPrice(args),
});