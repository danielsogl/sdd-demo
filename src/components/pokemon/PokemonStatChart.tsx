import type { BaseStats } from '@/domain/pokemon/value-objects';
import { PokemonStatBar } from './PokemonStatBar';

type PokemonStatChartProps = {
  stats: BaseStats;
};

const STAT_ENTRIES: { key: keyof BaseStats; label: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'specialAttack', label: 'SpA' },
  { key: 'specialDefense', label: 'SpD' },
  { key: 'speed', label: 'SPD' },
];

export function PokemonStatChart({ stats }: PokemonStatChartProps) {
  return (
    <div className="space-y-2">
      {STAT_ENTRIES.map(({ key, label }) => (
        <PokemonStatBar key={key} label={label} value={stats[key]} />
      ))}
    </div>
  );
}
