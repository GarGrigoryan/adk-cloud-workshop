import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { dbPath } from './db.ts';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

// [sku, name, category, price, stock, warehouse]
const PRODUCTS: [string, string, string, number, number, string][] = [
  ['SONY-WH1000XM5', 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', 'headphones', 349.99, 12, 'A'],
  ['SONY-WH1000XM4', 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones', 'headphones', 279.99, 5, 'A'],
  ['BOSE-QC-ULTRA', 'Bose QuietComfort Ultra Headphones', 'headphones', 379.99, 8, 'B'],
  ['JBL-TUNE770NC', 'JBL Tune 770NC Wireless Headphones', 'headphones', 99.99, 30, 'B'],
  ['APPLE-AIRPODSPRO2', 'Apple AirPods Pro 2 (USB-C)', 'earbuds', 229.99, 25, 'A'],
  ['SONY-WF1000XM5', 'Sony WF-1000XM5 Wireless Earbuds', 'earbuds', 299.99, 0, 'A'],
  ['LOGI-MXMASTER3S', 'Logitech MX Master 3S Wireless Mouse', 'accessories', 99.99, 40, 'B'],
  ['LOGI-MXKEYS-S', 'Logitech MX Keys S Wireless Keyboard', 'keyboards', 109.99, 18, 'B'],
  ['KEYCHRON-K8PRO', 'Keychron K8 Pro Mechanical Keyboard', 'keyboards', 99.99, 7, 'A'],
  ['DELL-U2723QE', 'Dell UltraSharp U2723QE 27" 4K Monitor', 'monitors', 619.99, 4, 'B'],
  ['LG-27UP850N', 'LG 27UP850N 27" 4K UHD Monitor', 'monitors', 449.99, 9, 'B'],
  ['SAMSUNG-T7-1TB', 'Samsung T7 Portable SSD 1TB', 'storage', 109.99, 50, 'A'],
  ['SANDISK-EXT-2TB', 'SanDisk Extreme Portable SSD 2TB', 'storage', 159.99, 22, 'A'],
  ['ANKER-737-PB', 'Anker 737 Power Bank 24,000mAh', 'charging', 109.99, 35, 'B'],
  ['ANKER-NANO-65W', 'Anker Nano II 65W USB-C Charger', 'charging', 35.99, 60, 'B'],
  ['RPI-5-8GB', 'Raspberry Pi 5 8GB', 'computers', 79.99, 15, 'A'],
  ['STREAMDECK-MK2', 'Elgato Stream Deck MK.2', 'accessories', 149.99, 11, 'A'],
  ['SHURE-MV7PLUS', 'Shure MV7+ USB/XLR Podcast Microphone', 'audio', 279.99, 6, 'B'],
  ['BLUE-YETI', 'Logitech Blue Yeti USB Microphone', 'audio', 129.99, 14, 'B'],
  ['SONY-ZVE10II', 'Sony ZV-E10 II Vlog Camera (Body)', 'cameras', 998.0, 2, 'A'],
];

// [id, name, email]
const CUSTOMERS: [number, string, string][] = [
  [1001, 'Maria Petrosyan', 'maria.petrosyan@example.com'],
  [1002, 'David Chen', 'david.chen@example.com'],
  [1003, 'Anna Kovacs', 'anna.kovacs@example.com'],
  [1004, 'Tigran Sargsyan', 'tigran.sargsyan@example.com'],
  [1005, 'Sophie Laurent', 'sophie.laurent@example.com'],
  [1006, 'James Okafor', 'james.okafor@example.com'],
  [1007, 'Lena Fischer', 'lena.fischer@example.com'],
  [1008, 'Omar Haddad', 'omar.haddad@example.com'],
  [1009, 'Priya Sharma', 'priya.sharma@example.com'],
  [1042, 'Alex Morgan', 'alex.morgan@example.com'],
];

// [id, customer_id, sku, quantity, status, ordered_days_ago, delivered_days_ago | null]
const ORDERS: [number, number, string, number, string, number, number | null][] = [
  // Flagship demo order: just barely return-eligible (30-day policy, delivered 21 days ago)
  [88231, 1042, 'SONY-WH1000XM5', 1, 'delivered', 24, 21],
  [88102, 1042, 'ANKER-NANO-65W', 2, 'delivered', 60, 56],
  [88240, 1042, 'SAMSUNG-T7-1TB', 1, 'shipped', 3, null],
  [88105, 1001, 'DELL-U2723QE', 1, 'delivered', 45, 41],
  [88110, 1001, 'LOGI-MXMASTER3S', 1, 'delivered', 44, 41],
  [88133, 1002, 'KEYCHRON-K8PRO', 1, 'delivered', 35, 31], // just past the 30-day window
  [88150, 1002, 'BLUE-YETI', 1, 'returned', 50, 47],
  [88161, 1003, 'APPLE-AIRPODSPRO2', 1, 'delivered', 28, 25],
  [88170, 1003, 'ANKER-737-PB', 1, 'processing', 1, null],
  [88180, 1004, 'RPI-5-8GB', 3, 'delivered', 18, 14],
  [88188, 1004, 'SANDISK-EXT-2TB', 1, 'delivered', 18, 14],
  [88195, 1005, 'BOSE-QC-ULTRA', 1, 'delivered', 10, 6],
  [88201, 1005, 'STREAMDECK-MK2', 1, 'cancelled', 9, null],
  [88210, 1006, 'SONY-ZVE10II', 1, 'delivered', 90, 85],
  [88215, 1006, 'SHURE-MV7PLUS', 1, 'delivered', 12, 8],
  [88220, 1007, 'LG-27UP850N', 2, 'delivered', 22, 17],
  [88225, 1007, 'LOGI-MXKEYS-S', 1, 'shipped', 2, null],
  [88228, 1008, 'JBL-TUNE770NC', 1, 'delivered', 7, 4],
  [88233, 1009, 'SONY-WH1000XM4', 1, 'delivered', 65, 61],
  [88236, 1009, 'SAMSUNG-T7-1TB', 2, 'processing', 1, null],
];

export function seed(): void {
  const file = dbPath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS products;
    CREATE TABLE products (
      sku TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
      price REAL NOT NULL, stock INTEGER NOT NULL, warehouse TEXT NOT NULL
    );
    CREATE TABLE customers (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      sku TEXT NOT NULL REFERENCES products(sku),
      quantity INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('processing','shipped','delivered','returned','cancelled')),
      order_date TEXT NOT NULL,
      delivered_date TEXT
    );
  `);

  const insProduct = db.prepare('INSERT INTO products VALUES (?, ?, ?, ?, ?, ?)');
  for (const p of PRODUCTS) insProduct.run(...p);

  const insCustomer = db.prepare('INSERT INTO customers VALUES (?, ?, ?)');
  for (const c of CUSTOMERS) insCustomer.run(...c);

  const priceOf = new Map(PRODUCTS.map((p) => [p[0], p[3]]));
  const insOrder = db.prepare('INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const [id, customerId, sku, qty, status, orderedDaysAgo, deliveredDaysAgo] of ORDERS) {
    insOrder.run(
      id, customerId, sku, qty,
      Math.round(priceOf.get(sku)! * qty * 100) / 100,
      status, daysAgo(orderedDaysAgo),
      deliveredDaysAgo === null ? null : daysAgo(deliveredDaysAgo),
    );
  }
  db.close();
  console.log(`Seeded ${PRODUCTS.length} products, ${CUSTOMERS.length} customers, ${ORDERS.length} orders -> ${file}`);
}

// Runs when executed directly via `npm run seed`
if (process.argv[1]?.replace(/\\/g, '/').endsWith('shared/src/seed.ts')) {
  seed();
}
