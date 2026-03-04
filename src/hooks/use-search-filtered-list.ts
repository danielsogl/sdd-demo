import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { POKEMON_PAGE_SIZE } from '@/constants/pokemon';
import type { PokemonNameEntry, PokemonSummary } from '@/domain/pokemon/entities';
import type { SearchQuery } from '@/domain/pokemon/value-objects';
import { QUERY_KEYS } from '@/domain/pokemon/value-objects';
import { fetchPokemonDetail } from '@/infrastructure/pokeapi/client';
import { mapRawDetailToPokemonSummary } from '@/infrastructure/pokeapi/mappers';
import { usePokemonFullList } from './use-pokemon-full-list';

export function useSearchFilteredList(searchQuery: SearchQuery, pageIndex = 0) {
  const { data: fullList, isSuccess } = usePokemonFullList();

  const isSearchActive = searchQuery.normalised !== '';

  const filteredNames: PokemonNameEntry[] = useMemo(() => {
    if (!isSearchActive || !fullList) return [];
    return fullList.filter((entry) => entry.name.includes(searchQuery.normalised));
  }, [fullList, searchQuery.normalised, isSearchActive]);

  const pageSlice = useMemo(() => {
    const start = pageIndex * POKEMON_PAGE_SIZE;
    return filteredNames.slice(start, start + POKEMON_PAGE_SIZE);
  }, [filteredNames, pageIndex]);

  const totalFilteredCount = filteredNames.length;
  const hasNextPage = (pageIndex + 1) * POKEMON_PAGE_SIZE < totalFilteredCount;

  const detailQueries = useQueries({
    queries:
      isSearchActive && isSuccess
        ? pageSlice.map((entry) => ({
            queryKey: [...QUERY_KEYS.pokemonSummary(entry.name)],
            queryFn: async () => {
              const raw = await fetchPokemonDetail(entry.name);
              return mapRawDetailToPokemonSummary(raw);
            },
            staleTime: Number.POSITIVE_INFINITY,
            enabled: isSearchActive,
          }))
        : [],
  });

  const items: PokemonSummary[] = detailQueries
    .filter((q): q is typeof q & { data: PokemonSummary } => q.isSuccess && !!q.data)
    .map((q) => q.data);

  const isLoading = detailQueries.some((q) => q.isLoading);
  const isError = detailQueries.some((q) => q.isError);

  return {
    items,
    filteredNames,
    totalFilteredCount,
    hasNextPage,
    isSearchActive,
    isLoading,
    isError,
  };
}
