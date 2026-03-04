import { POKEMON_FULL_LIST_LIMIT, POKEMON_PAGE_SIZE } from '@/constants/pokemon';
import type { PokemonListPage, PokemonNameEntry } from '@/domain/pokemon/entities';
import type { RawPokemonDetailResponse, RawPokemonListResponse } from './types';

export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export async function fetchPokemonPage(offset: number): Promise<PokemonListPage> {
  const url = `${POKEAPI_BASE_URL}/pokemon?limit=${POKEMON_PAGE_SIZE}&offset=${encodeURIComponent(String(offset))}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon list: ${response.status} ${response.statusText}`);
  }

  const data: RawPokemonListResponse = await response.json();

  let nextOffset: number | null = null;
  if (data.next) {
    const nextUrl = new URL(data.next);
    const offsetParam = nextUrl.searchParams.get('offset');
    nextOffset = offsetParam ? Number.parseInt(offsetParam, 10) : null;
  }

  return {
    items: data.results,
    nextOffset,
    totalCount: data.count,
  };
}

export async function fetchPokemonFullList(): Promise<PokemonNameEntry[]> {
  const url = `${POKEAPI_BASE_URL}/pokemon?limit=${POKEMON_FULL_LIST_LIMIT}&offset=0`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch full Pokémon list: ${response.status} ${response.statusText}`);
  }

  const data: RawPokemonListResponse = await response.json();
  return data.results;
}

export async function fetchPokemonDetail(name: string): Promise<RawPokemonDetailResponse> {
  const url = `${POKEAPI_BASE_URL}/pokemon/${encodeURIComponent(name)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Pokémon detail for "${name}": ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
