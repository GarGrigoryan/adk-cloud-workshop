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
  const db = openDb();

  let queryStr = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (input.query) {
    queryStr += ' AND (name LIKE ? OR category LIKE ? OR sku LIKE ?)';
    params.push(`%${input.query}%`, `%${input.query}%`, `%${input.query}%`);
  }

  if (input.category) {
    queryStr += ' AND category = ?';
    params.push(input.category);
  }

  if (input.maxPrice !== undefined) {
    queryStr += ' AND price <= ?';
    params.push(input.maxPrice);
  }

  const products = db.prepare(queryStr).all(...params);
  return { products: products || [] };
}

export function getStock(input: { sku: string }): any {
  const db = openDb();

  const product = db.prepare(
    'SELECT * FROM products WHERE UPPER(sku) = UPPER(?)'
  ).get(input.sku);

  if (!product) {
    return { error: `Product with SKU ${input.sku} not found.` };
  }

  return product;
}

export const searchProductsTool = new FunctionTool({
  name: 'search_products',
  description: 'Search for products in the inventory by free text query, category, and/or maximum price thresholds.',
  parameters: z.object({
    query: z.string().optional().describe('Free text search term to match against product name or metadata.'),
    category: z.string().optional().describe('Filter products by a specific category name (e.g., "headphones").'),
    maxPrice: z.number().optional().describe('Filter products to a maximum price ceiling.'),
  }),
  execute: async (args) => {
    return searchProducts(args);
  },
});

export const getStockTool = new FunctionTool({
  name: 'get_stock',
  description: 'Retrieve the current stock level, warehouse location, and product information for a specific product SKU.',
  parameters: z.object({
    sku: z.string().describe('The unique Stock Keeping Unit (SKU) identifier for the product (case-insensitive).'),
  }),
  execute: async (args) => {
    return getStock(args);
  },
});
