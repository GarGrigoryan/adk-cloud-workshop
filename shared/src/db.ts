import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEFAULT_DB_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'data',
  'techparts.db',
);

export function dbPath(): string {
  return process.env.TECHPARTS_DB ?? DEFAULT_DB_PATH;
}

export function openDb(): DatabaseSync {
  return new DatabaseSync(dbPath());
}
