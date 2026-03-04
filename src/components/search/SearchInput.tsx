'use client';

import { useEffect, useRef, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from '@/constants/pokemon';
import { createSearchQuery, type SearchQuery } from '@/domain/pokemon/value-objects';
import { useDebounce } from '@/hooks/use-debounce';

type SearchInputProps = {
  onSearch: (query: SearchQuery) => void;
};

export function SearchInput({ onSearch }: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, SEARCH_DEBOUNCE_MS);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => {
    onSearchRef.current(createSearchQuery(debouncedValue));
  }, [debouncedValue]);

  return (
    <div className="w-full">
      <label htmlFor="pokemon-search" className="sr-only">
        Search Pokémon
      </label>
      <input
        id="pokemon-search"
        data-testid="search-input"
        type="search"
        placeholder="Search Pokémon by name..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
      />
    </div>
  );
}
