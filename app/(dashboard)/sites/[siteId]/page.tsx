import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import SiteDetailContent from './SiteDetailContent';

export const metadata = {
  title: 'Site Details - AccessAudit',
};

export default async function SiteDetailPage({
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
    <Suspense fallback={<SiteDetailSkeleton />}>
      <SiteDetailContent siteId={siteId} userId={user.id} />
    </Suspense>
  );
}

function SiteDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-4 w-64 rounded bg-gray-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-lg bg-gray-200" />
          <div className="h-10 w-28 rounded-lg bg-gray-200" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-20 rounded bg-gray-200 mb-2" />
            <div className="h-8 w-12 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-72" />
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-48" />
    </div>
  );
}
