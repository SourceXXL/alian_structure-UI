import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID || '',
  process.env.ALGOLIA_API_KEY || ''
);

const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME || '');

const SEARCH_CACHE_TTL_MS = 60_000;
const searchCache = new Map<string, { data: any[]; expiresAt: number }>();
const inFlightSearches = new Map<string, Promise<any[]>>();

const buildCacheKey = (query: string, filters: any) =>
  JSON.stringify({
    query: query.trim().toLowerCase(),
    filters: Object.entries(filters || {}).sort(([a], [b]) => a.localeCompare(b)),
  });

export const searchAgents = async (query: string, filters: any = {}) => {
  const cacheKey = buildCacheKey(query, filters);
  const now = Date.now();
  const cached = searchCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const existingRequest = inFlightSearches.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    try {
      const response = await index.search(query, {
        filters: Object.entries(filters)
          .map(([key, value]) => `${key}:${value}`)
          .join(' AND '),
      });
      const hits = response.hits as any[];
      searchCache.set(cacheKey, { data: hits, expiresAt: now + SEARCH_CACHE_TTL_MS });
      return hits;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    } finally {
      inFlightSearches.delete(cacheKey);
    }
  })();

  inFlightSearches.set(cacheKey, request);
  return request;
};

export const clearSearchCache = () => {
  searchCache.clear();
};