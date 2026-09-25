import type {
  ApiError,
  Campaign,
  CampaignCreate,
  CampaignFromTemplate,
  CampaignListItem,
  CampaignTemplate,
  CampaignUpdate,
  CharacterSheet,
  CharacterSheetSave,
  Location,
  LoginRequest,
  MeResponse,
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
    const body = (await res.json().catch(() => null)) as (ApiError & { details?: { path: string; message: string }[] }) | null;
    throw new ApiRequestError(body?.error ?? `Request failed (${res.status})`, res.status, body?.details);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

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
};
