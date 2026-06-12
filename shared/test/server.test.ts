import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LlmAgent } from '@google/adk';
import type { Server } from 'node:http';
import { startAgentServer } from '../src/server.ts';

let server: Server;
const PORT = 8941;

beforeAll(async () => {
  const agent = new LlmAgent({
    name: 'test_agent',
    model: 'gemini-2.5-flash',
    description: 'Test agent for the harness.',
    instruction: 'You are a test agent.',
  });
  server = await startAgentServer({ agent, port: PORT, title: 'Test Agent' });
});

afterAll(() => server?.close());

describe('startAgentServer', () => {
  it('serves the debug console at /', async () => {
    const res = await fetch(`http://localhost:${PORT}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<title>Test Agent</title>');
    expect(html).toContain('/api/chat');
  });

  it('serves the A2A agent card at the well-known path', async () => {
    const res = await fetch(`http://localhost:${PORT}/.well-known/agent-card.json`);
    expect(res.status).toBe(200);
    const card = (await res.json()) as { name: string };
    expect(card.name).toBe('test_agent');
  });
});
