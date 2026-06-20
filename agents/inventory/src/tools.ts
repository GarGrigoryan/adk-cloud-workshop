import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import { openDb } from '@techparts/shared';

export function searchProducts(input: { query?: string; category?: string; maxPrice?: number }): { products: any[] } {
  const db = openDb();
  
  let queryStr = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (input.query) {
    const words = input.query.trim().split(/\s+/);
    words.forEach((word) => {
      queryStr += ' AND (name LIKE ? OR category LIKE ? OR sku LIKE ?)';
      params.push(`%${word}%`, `%${word}%`, `%${word}%`);
    });
  }

  if (input.category) {
    queryStr += ' AND category = ?';
    params.push(input.category);
  }

  if (input.maxPrice !== undefined) {
    queryStr += ' AND price <= ?';
    params.push(input.maxPrice);
  }

  // Use db.prepare() then execute .all() on the statement object
  const stmt = db.prepare(queryStr);
  const products = stmt.all(...params);
  return { products: products || [] };
}

export function getStock(input: { sku: string }): any {
  const db = openDb();
  
  const stmt = db.prepare('SELECT * FROM products WHERE UPPER(sku) = UPPER(?)');
  const product = stmt.get(input.sku);

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
    category: z.string().optional().describe('Filter products by a specific category name.'),
    maxPrice: z.number().optional().describe('Filter products to a maximum price ceiling.'),
  }),
  execute: async (args) => searchProducts(args),
});

export const getStockTool = new FunctionTool({
  name: 'get_stock',
  description: 'Retrieve the current stock level, warehouse location, and product information for a specific product SKU.',
  parameters: z.object({
    sku: z.string().describe('The unique Stock Keeping Unit (SKU) identifier for the product (case-insensitive).'),
  }),
  execute: async (args) => getStock(args),
});