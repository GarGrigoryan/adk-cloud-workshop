import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import { openDb } from '@techparts/shared';

// TODO(workshop): Implement the inventory tools.
//
// You are building two tools backed by the SQLite `products` table
// (columns: sku, name, category, price, stock, warehouse):
//   1. search_products — find products by free text, category and/or max price.
//   2. get_stock        — stock level + warehouse for a single SKU.
//
// Use openDb() to query the database (see shared/src/db.ts), and let the tests
// in test/tools.test.ts describe the exact shapes you need to return.

export function searchProducts(input: { query?: string; category?: string; maxPrice?: number }): { products: any[] } {
  // TODO: query the `products` table and return `{ products: [...] }`.
  throw new Error('Not implemented: searchProducts');
}

export function getStock(input: { sku: string }): any {
  // TODO: look up one product by SKU (case-insensitive) and return its stock
  // and warehouse, or `{ error }` if the SKU is unknown.
  throw new Error('Not implemented: getStock');
}

export const searchProductsTool = new FunctionTool({
  name: 'search_products',
  description: 'TODO: describe this tool so the model knows when and how to call it.',
  parameters: z.object({
    // TODO: define the parameters (e.g. query?, category?, maxPrice?) with .describe() hints.
  }),
  execute: async () => searchProducts({}),
});

export const getStockTool = new FunctionTool({
  name: 'get_stock',
  description: 'TODO: describe this tool so the model knows when and how to call it.',
  parameters: z.object({
    // TODO: define the parameters (e.g. sku) with .describe() hints.
  }),
  execute: async () => getStock({ sku: '' }),
});
