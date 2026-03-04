'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { POKEMON_PAGE_SIZE } from '@/constants/pokemon';
import type { PokemonSummary } from '@/domain/pokemon/entities';
import type { PokemonId } from '@/domain/pokemon/value-objects';
import { PokemonCard } from './PokemonCard';
import { PokemonSkeletonCard } from './PokemonSkeletonCard';

type PokemonGridProps = {
  items: PokemonSummary[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  searchTerm?: string;
  isSearchActive: boolean;
  onFetchNextPage: () => void;
  onRefetch: () => void;
  onSelectPokemon: (id: PokemonId) => void;
};

export function PokemonGrid({
  items,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  searchTerm,
  isSearchActive,
  onFetchNextPage,
  onRefetch,
  onSelectPokemon,
}: PokemonGridProps) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onFetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onFetchNextPage]);

  if (isError) {
    return (
      <div data-testid="error-state" className="py-12 text-center">
        <p className="mb-4 text-lg text-red-600 dark:text-red-400">
          Something went wrong while loading Pokémon. Please try again.
        </p>
        <Button variant="outline" onClick={onRefetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (!isLoading && isSearchActive && items.length === 0) {
    return (
      <div data-testid="empty-state" className="py-12 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          No Pokémon matched your search
          {searchTerm ? ` for "${searchTerm}"` : ''}.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="pokemon-grid">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {isLoading &&
          items.length === 0 &&
          Array.from({ length: POKEMON_PAGE_SIZE }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <PokemonSkeletonCard key={`skeleton-${i}`} />
          ))}

        {items.map((pokemon) => (
          <PokemonCard key={pokemon.id.value} pokemon={pokemon} onClick={onSelectPokemon} />
        ))}

        {isFetchingNextPage &&
          Array.from({ length: POKEMON_PAGE_SIZE }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <PokemonSkeletonCard key={`next-skeleton-${i}`} />
          ))}
      </div>

      <div ref={ref} data-testid="scroll-sentinel" className="h-4" />
    </div>
  );
}
