import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import {
  fetchSearchResults,
  setFilters as setFiltersAction,
  setQuery as setQueryAction,
} from "@/store/redux/searchSlice";

export const useSearch = (initialQuery = "", initialFilters = {}) => {
  const dispatch = useAppDispatch();
  const { query, filters, results, loading, error } = useAppSelector(
    (state) => state.search
  );

  const setQuery = (nextQuery: string) => {
    dispatch(setQueryAction(nextQuery));
  };

  const setFilters = (nextFilters: Record<string, string | number | boolean>) => {
    dispatch(setFiltersAction(nextFilters));
  };

  useEffect(() => {
    if (initialQuery) {
      dispatch(setQueryAction(initialQuery));
    }
    if (Object.keys(initialFilters).length > 0) {
      dispatch(setFiltersAction(initialFilters as Record<string, string | number | boolean>));
    }
  }, [dispatch, initialFilters, initialQuery]);

  useEffect(() => {
    const debouncedSearch = window.setTimeout(() => {
      void dispatch(fetchSearchResults({ query, filters }));
    }, 300);

    return () => {
      window.clearTimeout(debouncedSearch);
    };
  }, [dispatch, filters, query]);

  return { query, setQuery, filters, setFilters, results, loading, error };
};
