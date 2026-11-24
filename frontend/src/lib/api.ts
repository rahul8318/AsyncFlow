const API_BASE = '/api/v1';

export class ApiError extends Error {
  public statusCode: number;
  public errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

let currentOrgId: string | null = null;
let accessToken: string | null = localStorage.getItem('asyncflow_token');

export const setApiAuth = (token: string | null, orgId?: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('asyncflow_token', token);
  } else {
    localStorage.removeItem('asyncflow_token');
  }

  if (orgId !== undefined) {
    currentOrgId = orgId;
    if (orgId) {
      localStorage.setItem('asyncflow_org_id', orgId);
    } else {
      localStorage.removeItem('asyncflow_org_id');
    }
  }
};

export const getStoredOrgId = () => {
  return currentOrgId || localStorage.getItem('asyncflow_org_id');
};

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!accessToken) {
    accessToken = localStorage.getItem('asyncflow_token');
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const activeOrg = getStoredOrgId();
  if (activeOrg && !headers['x-organization-id']) {
    headers['x-organization-id'] = activeOrg;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle file downloads or non-json responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    const text = await response.text();
    return text as unknown as T;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: 'Unexpected server response' };
  }

  if (!response.ok) {
    // If 401 and we have a refresh token attempt, we could refresh, or throw
    throw new ApiError(data.message || 'Request failed', response.status, data.errors);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
