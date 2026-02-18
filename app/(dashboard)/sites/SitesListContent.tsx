import Link from 'next/link';
import { Plus, Zap } from 'lucide-react';
import { getSites, getProfile } from '@/lib/supabase/queries';
import EmptyState from '@/components/dashboard/EmptyState';
import SitesSortFilter from './SitesSortFilter';

interface SitesListContentProps {
  userId: string;
}

export default async function SitesListContent({
  userId,
}: SitesListContentProps) {
  const [sitesResult, profileResult] = await Promise.all([
    getSites(userId),
    getProfile(userId),
  ]);

  if (sitesResult.error || profileResult.error) {
    console.error('[SitesListContent] Failed to load sites data:', {
      sitesError: sitesResult.error,
      profileError: profileResult.error,
    });
    throw new Error('Failed to load sites data');
  }

  const sites = sitesResult.data;
  const profile = profileResult.data;
  const atLimit = profile ? sites.length >= profile.sites_limit : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sites</h1>
          <p className="mt-1 text-sm text-gray-500">
            {sites.length} of {profile?.sites_limit ?? 1} sites used
          </p>
        </div>

        {atLimit ? (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            <Zap className="h-4 w-4" />
            Upgrade to Add More
          </Link>
        ) : (
          <Link
            href="/dashboard/sites/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add Site
          </Link>
        )}
      </div>

      {sites.length === 0 ? (
        <EmptyState />
      ) : (
        <SitesSortFilter sites={sites} />
      )}
    </div>
  );
}
