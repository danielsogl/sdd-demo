import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { usePokemonDetail } from '@/hooks/use-pokemon-detail';

vi.mock('@/infrastructure/pokeapi/client', () => ({
  fetchPokemonDetail: vi.fn().mockResolvedValue({
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    sprites: { front_default: 'https://example.com/1.png' },
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
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePokemonDetail', () => {
  it('fetches detail when name is provided', async () => {
    const { result } = renderHook(() => usePokemonDetail('bulbasaur'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('bulbasaur');
    expect(result.current.data?.types).toEqual(['grass']);
  });

  it('uses the correct query key', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => usePokemonDetail('bulbasaur'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const queryState = queryClient.getQueryState(['pokemon', 'detail', 'bulbasaur']);
    expect(queryState).toBeDefined();
  });

  it('is disabled when name is null', () => {
    const { result } = renderHook(() => usePokemonDetail(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
