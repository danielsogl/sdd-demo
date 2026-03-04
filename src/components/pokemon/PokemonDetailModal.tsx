'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePokemonDetail } from '@/hooks/use-pokemon-detail';
import { PokemonStatChart } from './PokemonStatChart';

type PokemonDetailModalProps = {
  open: boolean;
  pokemonName: string | null;
  onClose: () => void;
};

export function PokemonDetailModal({ open, pokemonName, onClose }: PokemonDetailModalProps) {
  const { data: pokemon, isLoading, isError } = usePokemonDetail(pokemonName);
  const [imgError, setImgError] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        data-testid="pokemon-detail-modal"
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle data-testid="detail-name">
            {isLoading ? <Skeleton className="h-7 w-40" /> : pokemon?.displayName}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="mx-auto h-32 w-32 rounded-md" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}

        {isError && (
          <div className="py-8 text-center">
            <p className="text-red-600 dark:text-red-400">
              Failed to load Pokémon details. Please try again.
            </p>
          </div>
        )}

        {pokemon && (
          <div className="space-y-4">
            <div className="flex justify-center">
              {pokemon.imageUrl && !imgError ? (
                <Image
                  src={pokemon.imageUrl}
                  alt={pokemon.displayName}
                  width={128}
                  height={128}
                  className="h-32 w-32 object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-md bg-gray-100 text-gray-400 dark:bg-gray-700">
                  ?
                </div>
              )}
            </div>

            <div data-testid="detail-types" className="flex justify-center gap-2">
              {pokemon.types.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>

            <div data-testid="detail-abilities">
              <h3 className="mb-1 text-sm font-semibold text-gray-500">Abilities</h3>
              <div className="flex flex-wrap gap-1">
                {pokemon.abilities.map((ability) => (
                  <Badge key={ability.name} variant={ability.isHidden ? 'outline' : 'default'}>
                    {ability.name}
                    {ability.isHidden && ' (hidden)'}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div data-testid="detail-height">
                <span className="text-gray-500">Height</span>
                <p className="font-medium">{(pokemon.heightDecimetres / 10).toFixed(1)} m</p>
              </div>
              <div data-testid="detail-weight">
                <span className="text-gray-500">Weight</span>
                <p className="font-medium">{(pokemon.weightHectograms / 10).toFixed(1)} kg</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-500">Base Stats</h3>
              <PokemonStatChart stats={pokemon.baseStats} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
