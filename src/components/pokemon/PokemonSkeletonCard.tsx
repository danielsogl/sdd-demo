import { Skeleton } from '@/components/ui/skeleton';

export function PokemonSkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <Skeleton className="mx-auto mb-3 h-24 w-24 rounded-md" />
      <Skeleton className="mx-auto mb-2 h-5 w-24" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}
