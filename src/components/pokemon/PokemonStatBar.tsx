import { POKEMON_MAX_STAT_VALUE } from '@/constants/pokemon';

type PokemonStatBarProps = {
  label: string;
  value: number;
};

export function PokemonStatBar({ label, value }: PokemonStatBarProps) {
  const percentage = (value / POKEMON_MAX_STAT_VALUE) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      {/* biome-ignore lint/a11y/useSemanticElements: using div for cross-browser styling of progress bar */}
      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={POKEMON_MAX_STAT_VALUE}
        aria-label={`${label}: ${value}`}
        className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm text-gray-600 dark:text-gray-400">
        {value}
      </span>
    </div>
  );
}
