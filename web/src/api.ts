import type {
  ApiError,
  Campaign,
  CampaignCreate,
  CampaignFromTemplate,
  CampaignListItem,
  CampaignState,
  CampaignTemplate,
  CampaignUpdate,
  CharacterSheet,
  CharacterSheetSave,
  Location,
  LoginRequest,
  MeResponse,
  Message,
  Page,
  StateEvent,
  TurnDebug,
  TurnStreamEvent,
  UndoResult,
} from '@narrator/shared';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

type ErrorBody = ApiError & { details?: { path: string; message: string }[] };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
  });
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    // Session expired or password changed: bounce to the login screen.
    window.dispatchEvent(new Event('narrator:unauthorized'));
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ErrorBody | null;
    throw new ApiRequestError(body?.error ?? `Request failed (${res.status})`, res.status, body?.details);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });
const page = (before?: number) => (before ? `&before=${before}` : '');

export const api = {
  me: () => request<MeResponse>('/api/auth/me'),
  login: (body: LoginRequest) => request<MeResponse>('/api/auth/login', json('POST', body)),
  logout: () => request<MeResponse>('/api/auth/logout', { method: 'POST' }),

  campaigns: () => request<CampaignListItem[]>('/api/campaigns'),
  templates: () => request<CampaignTemplate[]>('/api/campaigns/templates'),
  createCampaign: (body: CampaignCreate) => request<Campaign>('/api/campaigns', json('POST', body)),
  createFromTemplate: (body: CampaignFromTemplate) => request<Campaign>('/api/campaigns/from-template', json('POST', body)),
  campaign: (id: string) => request<Campaign>(`/api/campaigns/${id}`),
  updateCampaign: (id: string, body: CampaignUpdate) => request<Campaign>(`/api/campaigns/${id}`, json('PATCH', body)),
  deleteCampaign: (id: string) => request<void>(`/api/campaigns/${id}`, { method: 'DELETE' }),

  locations: (id: string) => request<Location[]>(`/api/campaigns/${id}/locations`),
  sheet: (id: string) => request<CharacterSheet>(`/api/campaigns/${id}/character/sheet`),
  saveSheet: (id: string, body: CharacterSheetSave) =>
    request<CharacterSheet>(`/api/campaigns/${id}/character/sheet`, json('PUT', body)),

  state: (id: string) => request<CampaignState>(`/api/campaigns/${id}/state`),
  messages: (id: string, before?: number) => request<Page<Message>>(`/api/campaigns/${id}/messages?limit=30${page(before)}`),
  events: (id: string, before?: number) => request<Page<StateEvent>>(`/api/campaigns/${id}/events?limit=60${page(before)}`),
  turnDebug: (id: string, turn: number) => request<TurnDebug>(`/api/campaigns/${id}/turns/${turn}/debug`),
  undo: (id: string) => request<UndoResult>(`/api/campaigns/${id}/turns/undo`, { method: 'POST' }),
  playTurn,
};

/**
 * Play a turn. The server answers with Server-Sent Events over a POST, which EventSource can't send,
 * so the body is read and split into events here. Rejects with ApiRequestError if the turn can't
 * start (e.g. no character); once it has started, failures arrive as an `error` event.
 */
async function playTurn(id: string, content: string, onEvent: (event: TurnStreamEvent) => void): Promise<void> {
  const res = await fetch(`/api/campaigns/${id}/turns`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok || !res.body) {
    if (res.status === 401) window.dispatchEvent(new Event('narrator:unauthorized'));
    const body = (await res.json().catch(() => null)) as ErrorBody | null;
    throw new ApiRequestError(body?.error ?? `Request failed (${res.status})`, res.status);
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    // Events are separated by a blank line; keep a trailing partial event in the buffer.
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const data = frame.split('\n').find((line) => line.startsWith('data: '));
      if (data) onEvent(JSON.parse(data.slice(6)) as TurnStreamEvent);
    }
  }
}
