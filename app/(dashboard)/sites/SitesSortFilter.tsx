'use client';

import { useState, useMemo } from 'react';
import type { Site } from '@/lib/types/database';
import SiteCard from '@/components/dashboard/SiteCard';

type SortOption = 'score-asc' | 'score-desc' | 'last-scanned' | 'name' | 'violations';

const SORT_LABELS: Record<SortOption, string> = {
  'score-asc': 'Worst Score First',
  'score-desc': 'Best Score First',
  'last-scanned': 'Last Scanned',
  name: 'Name (A-Z)',
  violations: 'Most Violations',
};

interface SitesSortFilterProps {
  sites: Site[];
}

export default function SitesSortFilter({ sites }: SitesSortFilterProps) {
  const [sort, setSort] = useState<SortOption>('score-asc');

  const sorted = useMemo(() => {
    const copy = [...sites];
    switch (sort) {
      case 'score-asc':
        return copy.sort(
          (a, b) => (a.current_score ?? 999) - (b.current_score ?? 999)
        );
      case 'score-desc':
        return copy.sort(
          (a, b) => (b.current_score ?? -1) - (a.current_score ?? -1)
        );
      case 'last-scanned':
        return copy.sort((a, b) => {
          if (!a.last_scanned_at) return 1;
          if (!b.last_scanned_at) return -1;
          return (
            new Date(b.last_scanned_at).getTime() -
            new Date(a.last_scanned_at).getTime()
          );
        });
      case 'name':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'violations':
        return copy.sort((a, b) => b.total_violations - a.total_violations);
      default:
        return copy;
    }
  }, [sites, sort]);

  return (
    <div className="space-y-4">
      {/* Sort options */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sort === key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {SORT_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Sites grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  );
}
