import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { searchAgents } from "@/features/agent-discovery/services/searchService";

type SearchFilters = Record<string, string | number | boolean>;

interface SearchState {
  query: string;
  filters: SearchFilters;
  results: any[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: "",
  filters: {},
  results: [],
  loading: false,
  error: null,
};

export const fetchSearchResults = createAsyncThunk<
  any[],
  { query: string; filters: SearchFilters }
>("search/fetchResults", async ({ query, filters }) => {
  return searchAgents(query, filters);
});

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setFilters(state, action: PayloadAction<SearchFilters>) {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "An unknown error occurred";
      });
  },
});

export const { setQuery, setFilters } = searchSlice.actions;
export default searchSlice.reducer;
