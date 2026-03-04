import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/domain/pokemon/value-objects';
import { fetchPokemonDetail } from '@/infrastructure/pokeapi/client';
import { mapRawDetailToPokemonDetail } from '@/infrastructure/pokeapi/mappers';

export function usePokemonDetail(name: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.pokemonDetail(name ?? '')],
    queryFn: async () => {
      const raw = await fetchPokemonDetail(name as string);
      return mapRawDetailToPokemonDetail(raw);
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: !!name,
  });
}
