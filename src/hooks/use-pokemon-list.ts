import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPokemonPage } from '@/infrastructure/pokeapi/client';

export function usePokemonList(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'list'],
    queryFn: ({ pageParam }) => fetchPokemonPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled,
  });
}
