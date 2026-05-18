import { searchAgents } from '../services/searchService';

jest.mock('algoliasearch', () => {
  const mockSearch = jest.fn();
  const mockInitIndex = jest.fn(() => ({ search: mockSearch }));
  const mockClient = { initIndex: mockInitIndex };
  return jest.fn(() => mockClient);
});

describe('searchService', () => {
  it('should call Algolia search with correct parameters', async () => {
    const mockHits = [{ id: 1, name: 'Agent 1' }];
    const mockSearch = require('algoliasearch')().initIndex().search;
    mockSearch.mockResolvedValueOnce({ hits: mockHits });

    const results = await searchAgents('test', { category: 'DeFi' });

    expect(mockSearch).toHaveBeenCalledWith('test', {
      filters: 'category:DeFi',
    });
    expect(results).toEqual(mockHits);
  });

  it('should throw an error if search fails', async () => {
    const mockSearch = require('algoliasearch')().initIndex().search;
    mockSearch.mockRejectedValueOnce(new Error('Search error'));

    await expect(searchAgents('test', {})).rejects.toThrow('Search error');
  });
});