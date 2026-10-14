import type { ChatResponse, DatabaseOverview } from '../types/index.js';

const API_BASE = '/api';

export async function askQuestion(question: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${res.statusText} (${res.status})`);
  }

  return res.json();
}

export async function fetchDatabaseOverview(): Promise<DatabaseOverview> {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  if (!res.ok) {
    throw new Error(`Failed to fetch database overview: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function checkHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    return { status: 'unhealthy', database: 'disconnected' };
  }
  return res.json();
}
