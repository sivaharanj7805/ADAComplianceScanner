import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import {
  getSite,
  getLatestScan,
  getViolations,
  getProfile,
} from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import StatementContent from './StatementContent';

export const metadata = {
  title: 'Accessibility Statement - AccessAudit',
};

async function StatementLoader({
  siteId,
  userId,
}: {
  siteId: string;
  userId: string;
}) {
  const [{ data: site }, { data: profile }, { data: latestScan }] =
    await Promise.all([
      getSite(siteId, userId),
      getProfile(userId),
      getLatestScan(siteId),
    ]);

  if (!site || !profile) {
    return notFound();
  }

  let violations: Awaited<ReturnType<typeof getViolations>>['data'] = [];
  if (latestScan && latestScan.status === 'completed') {
    const { data } = await getViolations(latestScan.id, userId);
    violations = data;
  }

  return (
    <StatementContent
      site={site}
      latestScan={latestScan}
      violations={violations}
      profile={profile}
    />
  );
}

export default async function StatementPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <Suspense fallback={<StatementSkeleton />}>
      <StatementLoader siteId={siteId} userId={user.id} />
    </Suspense>
  );
}

function StatementSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-4 w-96 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-5 w-24 rounded bg-gray-200 mb-4" />
            <div className="space-y-4">
              <div>
                <div className="h-4 w-28 rounded bg-gray-200 mb-1" />
                <div className="h-9 w-full rounded-lg bg-gray-200" />
              </div>
              <div>
                <div className="h-4 w-44 rounded bg-gray-200 mb-1" />
                <div className="h-9 w-full rounded-lg bg-gray-200" />
              </div>
              <div>
                <div className="h-4 w-48 rounded bg-gray-200 mb-1" />
                <div className="h-20 w-full rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-5 w-16 rounded bg-gray-200 mb-4" />
            <div className="space-y-2">
              <div className="h-9 w-full rounded-lg bg-gray-200" />
              <div className="h-9 w-full rounded-lg bg-gray-200" />
              <div className="h-9 w-full rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
            <div className="p-6 space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-6 w-1/3 rounded bg-gray-200 mt-6" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-4/5 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
