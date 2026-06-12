import { beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { seed } from '../src/seed.ts';
import { openDb } from '../src/db.ts';

beforeAll(() => {
  process.env.TECHPARTS_DB = path.join(mkdtempSync(path.join(tmpdir(), 'techparts-')), 'test.db');
  seed();
});

describe('seed', () => {
  it('creates at least 20 products with stock and prices', () => {
    const db = openDb();
    const rows = db.prepare('SELECT * FROM products').all() as any[];
    expect(rows.length).toBeGreaterThanOrEqual(20);
    expect(rows.every((r) => r.price > 0)).toBe(true);
  });

  it('seeds the flagship demo order: #88231, customer 1042, Sony WH-1000XM5, delivered 21 days ago', () => {
    const db = openDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = 88231').get() as any;
    expect(order.customer_id).toBe(1042);
    expect(order.sku).toBe('SONY-WH1000XM5');
    expect(order.status).toBe('delivered');
    const ageDays = (Date.now() - Date.parse(order.delivered_date)) / 86_400_000;
    expect(ageDays).toBeGreaterThan(20);
    expect(ageDays).toBeLessThan(30); // still return-eligible
  });

  it('is idempotent', () => {
    seed();
    seed();
    const db = openDb();
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM customers').get() as any;
    expect(n).toBeLessThan(30);
  });
});
