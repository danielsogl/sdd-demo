import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/domain/pokemon/value-objects';
import { fetchPokemonFullList } from '@/infrastructure/pokeapi/client';

export function usePokemonFullList() {
  return useQuery({
    queryKey: [...QUERY_KEYS.pokemonFullList],
    queryFn: fetchPokemonFullList,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
