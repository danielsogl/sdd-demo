'use client';

import { useQueries } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PokemonDetailModal } from '@/components/pokemon/PokemonDetailModal';
import { PokemonGrid } from '@/components/pokemon/PokemonGrid';
import { SearchInput } from '@/components/search/SearchInput';
import type { PokemonSummary } from '@/domain/pokemon/entities';
import {
  createSearchQuery,
  type PokemonId,
  QUERY_KEYS,
  type SearchQuery,
} from '@/domain/pokemon/value-objects';
import { usePokemonList } from '@/hooks/use-pokemon-list';
import { useSearchFilteredList } from '@/hooks/use-search-filtered-list';
import { fetchPokemonDetail } from '@/infrastructure/pokeapi/client';
import { mapRawDetailToPokemonSummary } from '@/infrastructure/pokeapi/mappers';

export default function PokemonDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(createSearchQuery(''));
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonId | null>(null);
  const [searchPageIndex, setSearchPageIndex] = useState(0);

  const isSearchActive = searchQuery.normalised !== '';

  // Browse mode: infinite scroll through paginated list
  const browseQuery = usePokemonList(!isSearchActive);

  // Search mode: filtered list from full name cache
  const searchResult = useSearchFilteredList(searchQuery, searchPageIndex);

  // Browse mode: fetch detail for each name entry to get PokemonSummary
  const browseNames = useMemo(() => {
    if (isSearchActive || !browseQuery.data) return [];
    return browseQuery.data.pages.flatMap((page) => page.items);
  }, [browseQuery.data, isSearchActive]);

  const browseDetailQueries = useQueries({
    queries: browseNames.map((entry) => ({
      queryKey: [...QUERY_KEYS.pokemonSummary(entry.name)],
      queryFn: async () => {
        const raw = await fetchPokemonDetail(entry.name);
        return mapRawDetailToPokemonSummary(raw);
      },
      staleTime: Number.POSITIVE_INFINITY,
    })),
  });

  const browseItems: PokemonSummary[] = browseDetailQueries
    .filter((q): q is typeof q & { data: PokemonSummary } => q.isSuccess && !!q.data)
    .map((q) => q.data);

  const items = isSearchActive ? searchResult.items : browseItems;
  const isLoading = isSearchActive
    ? searchResult.isLoading
    : browseQuery.isLoading || browseDetailQueries.some((q) => q.isLoading);
  const isError = isSearchActive ? searchResult.isError : browseQuery.isError;
  const hasNextPage = isSearchActive
    ? searchResult.hasNextPage
    : (browseQuery.hasNextPage ?? false);
  const isFetchingNextPage = isSearchActive ? false : (browseQuery.isFetchingNextPage ?? false);

  const handleSearch = useCallback((query: SearchQuery) => {
    setSearchQuery(query);
    setSearchPageIndex(0);
  }, []);

  const handleFetchNextPage = useCallback(() => {
    if (isSearchActive) {
      setSearchPageIndex((prev) => prev + 1);
    } else {
      browseQuery.fetchNextPage();
    }
  }, [isSearchActive, browseQuery]);

  const handleRefetch = useCallback(() => {
    browseQuery.refetch();
  }, [browseQuery]);

  // Derive selected Pokémon name from the items list
  const selectedPokemonName = useMemo(() => {
    if (!selectedPokemon) return null;
    const found = items.find((p) => p.id.value === selectedPokemon.value);
    return found?.name ?? null;
  }, [selectedPokemon, items]);

  const handleSelectPokemon = useCallback((id: PokemonId) => {
    setSelectedPokemon(id);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pokémon Search &amp; Explorer</h1>
        <ThemeToggle />
      </div>

      <div className="mb-8">
        <SearchInput onSearch={handleSearch} />
      </div>

      <PokemonGrid
        items={items}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        searchTerm={searchQuery.raw}
        isSearchActive={isSearchActive}
        onFetchNextPage={handleFetchNextPage}
        onRefetch={handleRefetch}
        onSelectPokemon={handleSelectPokemon}
      />

      <PokemonDetailModal
        open={selectedPokemon !== null}
        pokemonName={selectedPokemonName}
        onClose={() => setSelectedPokemon(null)}
      />
    </main>
  );
}
