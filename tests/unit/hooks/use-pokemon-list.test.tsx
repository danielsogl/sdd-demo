import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { usePokemonList } from '@/hooks/use-pokemon-list';

vi.mock('@/infrastructure/pokeapi/client', () => ({
  fetchPokemonPage: vi.fn().mockResolvedValue({
    items: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    ],
    nextOffset: 20,
    totalCount: 1302,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePokemonList', () => {
  it('fetches the first page of Pokémon', async () => {
    const { result } = renderHook(() => usePokemonList(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const items = result.current.data?.pages[0].items;
    expect(items).toHaveLength(2);
    expect(items?.[0].name).toBe('bulbasaur');
  });

  it('provides getNextPageParam returning nextOffset', async () => {
    const { result } = renderHook(() => usePokemonList(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('is disabled when enabled is false', () => {
    const { result } = renderHook(() => usePokemonList(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
  });
});
