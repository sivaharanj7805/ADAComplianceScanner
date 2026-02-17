import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import ScanDetailContent from './ScanDetailContent';

export const metadata = {
  title: 'Scan Details - AccessAudit',
};

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ siteId: string; scanId: string }>;
}) {
  const { siteId, scanId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <Suspense fallback={<ScanDetailSkeleton />}>
      <ScanDetailContent
        siteId={siteId}
        scanId={scanId}
        userId={user.id}
      />
    </Suspense>
  );
}

function ScanDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="h-4 w-16 rounded bg-gray-200 mb-2" />
            <div className="h-8 w-10 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-gray-200" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="space-y-2">
            <div className="h-5 w-64 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
