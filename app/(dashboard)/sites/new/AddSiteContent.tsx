import { getSites, getProfile } from '@/lib/supabase/queries';
import AddSiteForm from './AddSiteForm';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

interface AddSiteContentProps {
  userId: string;
}

export default async function AddSiteContent({
  userId,
}: AddSiteContentProps) {
  const [sitesResult, profileResult] = await Promise.all([
    getSites(userId),
    getProfile(userId),
  ]);

  if (sitesResult.error || profileResult.error) {
    console.error('[AddSiteContent] Failed to load data:', {
      sitesError: sitesResult.error,
      profileError: profileResult.error,
    });
    throw new Error('Failed to load site data');
  }

  const sites = sitesResult.data;
  const profile = profileResult.data;
  const sitesLimit = profile?.sites_limit ?? 1;
  const sitesCount = sites.length;
  const atLimit = sitesCount >= sitesLimit;

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/dashboard/sites"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sites
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900">Add a New Site</h1>
      <p className="mt-1 text-sm text-gray-500">
        Adding site {sitesCount + 1} of {sitesLimit}
      </p>

      {atLimit ? (
        <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-6 text-center">
          <Zap className="mx-auto h-8 w-8 text-orange-500" />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            Plan Limit Reached
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            You&apos;ve reached your limit of {sitesLimit} site
            {sitesLimit === 1 ? '' : 's'}. Upgrade your plan to monitor more
            websites.
          </p>
          <Link
            href="/dashboard/upgrade"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            <Zap className="h-4 w-4" />
            Upgrade Now
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <AddSiteForm />
        </div>
      )}
    </div>
  );
}
