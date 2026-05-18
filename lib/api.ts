/* Utility functions for API calls */
import { store } from "@/store/redux/store";
import { recordRequest } from "@/store/redux/apiMetricsSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const REQUEST_CACHE_TTL_MS = 60_000;

const responseCache = new Map<string, { data: unknown; expiresAt: number }>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const makeCacheKey = (endpoint: string, options: RequestInit) =>
  JSON.stringify({
    endpoint,
    method: (options.method || "GET").toUpperCase(),
    body: typeof options.body === "string" ? options.body : null,
  });

const reportRequest = (payload: { cacheHit: boolean; networkRequest: boolean; batched: boolean }) => {
  store.dispatch(recordRequest(payload));
};

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();
  const cacheKey = makeCacheKey(endpoint, options);
  const now = Date.now();

  if (method === "GET") {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      reportRequest({ cacheHit: true, networkRequest: false, batched: false });
      return cached.data;
    }

    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      reportRequest({ cacheHit: true, networkRequest: false, batched: false });
      return inFlight;
    }
  }

  const url = `${API_URL}${endpoint}`;
  const request = (async () => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (method === "GET") {
      responseCache.set(cacheKey, {
        data,
        expiresAt: now + REQUEST_CACHE_TTL_MS,
      });
    }
    reportRequest({ cacheHit: false, networkRequest: true, batched: false });
    return data;
  })();

  if (method === "GET") {
    inFlightRequests.set(cacheKey, request);
    request.finally(() => {
      inFlightRequests.delete(cacheKey);
    });
  }

  return request;
}

export const apiClient = {
  get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) =>
    apiCall(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) =>
    apiCall(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
  batchGet: async (endpoints: string[]) => {
    const uniqueEndpoints = Array.from(new Set(endpoints));
    const requests = uniqueEndpoints.map((endpoint) => apiClient.get(endpoint));
    const responses = await Promise.all(requests);
    uniqueEndpoints.forEach(() =>
      reportRequest({ cacheHit: false, networkRequest: false, batched: true })
    );
    return responses;
  },
  clearCache: () => {
    responseCache.clear();
    inFlightRequests.clear();
  },
};
