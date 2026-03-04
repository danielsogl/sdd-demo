import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createSearchQuery } from '@/domain/pokemon/value-objects';
import { useSearchFilteredList } from '@/hooks/use-search-filtered-list';

vi.mock('@/hooks/use-pokemon-full-list', () => ({
  usePokemonFullList: vi.fn().mockReturnValue({
    data: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
      { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' },
      { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
      { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' },
    ],
    isSuccess: true,
  }),
}));

vi.mock('@/infrastructure/pokeapi/client', () => ({
  fetchPokemonDetail: vi.fn().mockImplementation((name: string) =>
    Promise.resolve({
      id: 1,
      name,
      height: 7,
      weight: 69,
      sprites: { front_default: `https://example.com/${name}.png` },
      types: [{ slot: 1, type: { name: 'grass' } }],
      abilities: [{ ability: { name: 'overgrow' }, is_hidden: false, slot: 1 }],
      stats: [
        { base_stat: 45, stat: { name: 'hp' } },
        { base_stat: 49, stat: { name: 'attack' } },
        { base_stat: 49, stat: { name: 'defense' } },
        { base_stat: 65, stat: { name: 'special-attack' } },
        { base_stat: 65, stat: { name: 'special-defense' } },
        { base_stat: 45, stat: { name: 'speed' } },
      ],
    }),
  ),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSearchFilteredList', () => {
  it('returns empty results when search query is empty (browse mode)', () => {
    const emptyQuery = createSearchQuery('');
    const { result } = renderHook(() => useSearchFilteredList(emptyQuery), {
      wrapper: createWrapper(),
    });

    expect(result.current.isSearchActive).toBe(false);
  });

  it('filters the full list by substring match', async () => {
    const query = createSearchQuery('char');
    const { result } = renderHook(() => useSearchFilteredList(query), { wrapper: createWrapper() });

    expect(result.current.isSearchActive).toBe(true);
    expect(result.current.filteredNames).toHaveLength(3);
    expect(result.current.filteredNames.map((e) => e.name)).toEqual([
      'charmander',
      'charmeleon',
      'charizard',
    ]);
  });

  it('returns empty list when no Pokémon match', () => {
    const query = createSearchQuery('zzzzz');
    const { result } = renderHook(() => useSearchFilteredList(query), { wrapper: createWrapper() });

    expect(result.current.filteredNames).toHaveLength(0);
  });
});
