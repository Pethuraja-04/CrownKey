import type {
  Property,
  PropertyFilters,
  PropertyListItem,
  Pagination,
  User,
  Review,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ReqOptions = RequestInit & {
  token?: string | null;
  query?: Record<string, unknown>;
  // Next.js fetch options
  next?: { revalidate?: number; tags?: string[] };
};

const buildQuery = (q?: Record<string, unknown>) => {
  if (!q) return '';
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) v.forEach((x) => usp.append(k, String(x)));
    else usp.append(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
};

export const AUTH_REFRESH_EVENT = 'crownkey_auth_refresh';

async function request<T>(path: string, opts: ReqOptions = {}): Promise<T> {
  const { token, query, headers, next, body, ...rest } = opts;
  const url = `${API_URL}${path}${buildQuery(query)}`;

  // When sending FormData, never set Content-Type — the browser must add the
  // multipart boundary itself.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };
  if (!isFormData) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    ...rest,
    body,
    headers: finalHeaders,
    credentials: 'include',
    ...(next ? { next } : {}),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    // Intercept 401 Unauthorized errors and attempt to refresh the token
    if (
      res.status === 401 &&
      path !== '/api/auth/refresh' &&
      path !== '/api/auth/login' &&
      path !== '/api/auth/register'
    ) {
      try {
        const refreshRes = await apiRefresh();
        const newAuthData = { user: refreshRes.data.user };

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(AUTH_REFRESH_EVENT, { detail: newAuthData }));
        }

        // Retry the request
        const retryRes = await fetch(url, {
          ...rest,
          body,
          headers: finalHeaders,
          credentials: 'include',
          ...(next ? { next } : {}),
        });
        const retryJson = await retryRes.json().catch(() => ({}));
        if (!retryRes.ok || retryJson.success === false) {
          const err = retryJson.error || { message: 'Request failed', code: 'UNKNOWN' };
          throw new ApiError(err.message, retryRes.status, err.code, err.details);
        }
        return retryJson as T;
      } catch (refreshErr) {
        // Refresh failed (token expired/revoked) - clear session
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(AUTH_REFRESH_EVENT, { detail: null }));
        }
        throw refreshErr;
      }
    }

    const err = json.error || { message: 'Request failed', code: 'UNKNOWN' };
    throw new ApiError(err.message, res.status, err.code, err.details);
  }
  return json as T;
}

// --- Auth ---
export const apiRegister = (body: { name: string; email: string; password: string; phone?: string }) =>
  request<{ success: true; data: { user: User } }>(
    '/api/auth/register',
    { method: 'POST', body: JSON.stringify(body) },
  );

export const apiLogin = (body: { email: string; password: string }) =>
  request<{ success: true; data: { user: User } }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify(body) },
  );

export const apiRefresh = () =>
  request<{ success: true; data: { user: User } }>(
    '/api/auth/refresh',
    { method: 'POST' },
  );

export const apiLogout = () =>
  request<{ success: true }>('/api/auth/logout', {
    method: 'POST',
  });

export const apiMe = (token: string) =>
  request<{ success: true; data: User }>('/api/auth/me', { token });

// --- Properties ---
export const apiListProperties = (filters: PropertyFilters = {}, init?: { revalidate?: number }) =>
  request<{ success: true; items: PropertyListItem[]; pagination: Pagination }>('/api/properties', {
    query: filters as Record<string, unknown>,
    next: init?.revalidate !== undefined ? { revalidate: init.revalidate } : undefined,
  });

export const apiGetProperty = (idOrSlug: string, init?: { revalidate?: number }) =>
  request<{ success: true; data: Property }>(`/api/properties/${idOrSlug}`, {
    next: init?.revalidate !== undefined ? { revalidate: init.revalidate } : undefined,
  });

export const apiSimilar = (idOrSlug: string) =>
  request<{ success: true; data: PropertyListItem[] }>(
    `/api/properties/${idOrSlug}/similar`,
    { next: { revalidate: 300 } },
  );

export const apiMyProperties = (token: string, page = 1, limit = 12) =>
  request<{ success: true; items: PropertyListItem[]; pagination: Pagination }>(
    '/api/properties/mine',
    { token, query: { page, limit }, cache: 'no-store' },
  );

// Build a multipart FormData body for property create / update.
// Property fields go through under a single JSON-stringified `payload` field,
// and any image files are appended as `images`. The backend route already
// handles both JSON and multipart shapes.
const buildPropertyFormData = (payload: Record<string, unknown>, files: File[] = []) => {
  const fd = new FormData();
  fd.append('payload', JSON.stringify(payload));
  files.forEach((f) => fd.append('images', f, f.name));
  return fd;
};

export const apiCreateProperty = (
  token: string,
  payload: Record<string, unknown>,
  files: File[] = [],
) => {
  const useMultipart = files.length > 0;
  return request<{ success: true; data: Property }>('/api/properties', {
    method: 'POST',
    body: useMultipart ? buildPropertyFormData(payload, files) : JSON.stringify(payload),
    token,
  });
};

export const apiUpdateProperty = (
  token: string,
  id: string,
  payload: Record<string, unknown>,
  files: File[] = [],
) => {
  const useMultipart = files.length > 0;
  return request<{ success: true; data: Property }>(`/api/properties/${id}`, {
    method: 'PATCH',
    body: useMultipart ? buildPropertyFormData(payload, files) : JSON.stringify(payload),
    token,
  });
};

export const apiDeleteProperty = (token: string, id: string) =>
  request<{ success: true }>(`/api/properties/${id}`, { method: 'DELETE', token });

// --- Wishlist ---
export interface WishlistListItem extends PropertyListItem {
  wishlistId: string;
  addedAt: string;
}

export const apiWishlistIds = (token: string) =>
  request<{ success: true; data: string[] }>('/api/wishlist/ids', {
    token,
    cache: 'no-store',
  });

export const apiWishlistList = (token: string, page = 1, limit = 12) =>
  request<{ success: true; items: WishlistListItem[]; pagination: Pagination }>(
    '/api/wishlist',
    { token, query: { page, limit }, cache: 'no-store' },
  );

export const apiWishlistAdd = (token: string, propertyId: string) =>
  request<{ success: true; data: { id: string; propertyId: string; createdAt: string } }>(
    `/api/wishlist/${propertyId}`,
    { method: 'POST', token },
  );

export const apiWishlistRemove = (token: string, propertyId: string) =>
  request<{ success: true; data: { ok: true } }>(`/api/wishlist/${propertyId}`, {
    method: 'DELETE',
    token,
  });

// --- Inquiries ---
export const apiCreateInquiry = (
  body: { propertyId: string; name: string; email: string; phone: string; message: string },
  token?: string | null,
) =>
  request<{ success: true; data: { id: string } }>('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });

export const apiReceivedInquiries = (token: string) =>
  request<{ success: true; items: unknown[]; pagination: Pagination }>(
    '/api/inquiries/received',
    { token },
  );

// --- Chat ---
export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export const apiChatMessage = (message: string, history: ChatMessage[]) =>
  request<{ success: true; data: { reply: string; model: string } }>(
    '/api/chat/message',
    {
      method: 'POST',
      body: JSON.stringify({ message, history }),
      cache: 'no-store',
    },
  );

// --- Reviews ---
export const apiCreateReview = (
  token: string,
  propertyId: string,
  body: { rating: number; comment: string }
) =>
  request<{ success: true; data: Review }>(`/api/reviews/properties/${propertyId}`, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });

export const apiUpdateReview = (
  token: string,
  id: string,
  body: { rating?: number; comment?: string }
) =>
  request<{ success: true; data: Review }>(`/api/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    token,
  });

export const apiDeleteReview = (token: string, id: string) =>
  request<{ success: true; data: { ok: boolean } }>(`/api/reviews/${id}`, {
    method: 'DELETE',
    token,
  });

export { ApiError, API_URL };
