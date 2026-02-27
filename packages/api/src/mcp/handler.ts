import type { IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { authenticateRequest } from '../lib/auth.js';
import { createMcpServer } from './server.js';

function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString());
        resolve(body);
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function jsonError(res: ServerResponse, status: number, code: number, message: string): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id: null }));
}

export async function handleMcpPost(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Authenticate
  const authHeader = req.headers.authorization ?? null;
  const user = await authenticateRequest(authHeader);
  if (!user) {
    jsonError(res, 401, -32000, 'Not authenticated. Provide Authorization: Bearer <ANIMATE_API_KEY>');
    return;
  }

  // Parse body
  let body: unknown;
  try {
    body = await parseBody(req);
  } catch {
    jsonError(res, 400, -32700, 'Invalid JSON');
    return;
  }

  // Create stateless MCP server for this request
  const server = createMcpServer(user);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    if (!res.headersSent) {
      jsonError(res, 500, -32603, 'Internal server error');
    }
  }

  // Cleanup when response finishes
  res.on('close', () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });
}

export function handleMcpMethodNotAllowed(_req: IncomingMessage, res: ServerResponse): void {
  jsonError(res, 405, -32000, 'Method not allowed. Only POST is supported for stateless MCP.');
}
