import { beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { seed } from '@techparts/shared';
import { getOurPrice } from '../src/tools.ts';

beforeAll(() => {
  process.env.TECHPARTS_DB = path.join(mkdtempSync(path.join(tmpdir(), 'techparts-')), 'test.db');
  seed();
});

describe('getOurPrice', () => {
  it('returns our price and name by exact SKU', () => {
    const result = getOurPrice({ skuOrName: 'SONY-WH1000XM5' });
    expect(result).toMatchObject({ sku: 'SONY-WH1000XM5', ourPrice: 349.99 });
  });

  it('falls back to name search when no SKU matches', () => {
    const result = getOurPrice({ skuOrName: 'WH-1000XM5' });
    expect(result).toMatchObject({ sku: 'SONY-WH1000XM5' });
  });

  it('reports unknown products clearly', () => {
    expect(getOurPrice({ skuOrName: 'flux capacitor' })).toHaveProperty('error');
  });
});
