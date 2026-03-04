'use client';

import Image from 'next/image';
import { useState } from 'react';
import { POKEMON_MAX_STAT_VALUE } from '@/constants/pokemon';
import type { PokemonSummary } from '@/domain/pokemon/entities';
import type { PokemonId } from '@/domain/pokemon/value-objects';

type PokemonCardProps = {
  pokemon: PokemonSummary;
  onClick: (id: PokemonId) => void;
};

const STAT_LABELS: { key: keyof PokemonSummary['baseStats']; label: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'specialAttack', label: 'SpA' },
  { key: 'specialDefense', label: 'SpD' },
  { key: 'speed', label: 'SPD' },
];

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      data-testid="pokemon-card"
      onClick={() => onClick(pokemon.id)}
      className="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mb-2 flex justify-center">
        {pokemon.imageUrl && !imgError ? (
          <Image
            src={pokemon.imageUrl}
            alt={pokemon.displayName}
            width={96}
            height={96}
            className="h-24 w-24 object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-md bg-gray-100 text-gray-400 dark:bg-gray-700">
            ?
          </div>
        )}
      </div>

      <p data-testid="pokemon-name" className="mb-2 text-center font-medium">
        {pokemon.displayName}
      </p>

      <div className="space-y-1">
        {STAT_LABELS.map(({ key, label }) => {
          const value = pokemon.baseStats[key];
          const percentage = (value / POKEMON_MAX_STAT_VALUE) * 100;
          return (
            <div key={key} className="flex items-center gap-1 text-xs">
              <span data-testid="stat-label" className="w-7 shrink-0 text-gray-500">
                {label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-gray-600 dark:text-gray-400">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </button>
  );
}
