import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import SitesListContent from './SitesListContent';

export const metadata = {
  title: 'Sites - AccessAudit',
};

export default async function SitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <Suspense fallback={<SitesListSkeleton />}>
      <SitesListContent userId={user.id} />
    </Suspense>
  );
}

function SitesListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 rounded bg-gray-200" />
        <div className="h-10 w-28 rounded-lg bg-gray-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-lg bg-gray-200" />
        <div className="h-9 w-32 rounded-lg bg-gray-200" />
        <div className="h-9 w-28 rounded-lg bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="space-y-3">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-3 w-56 rounded bg-gray-200" />
              <div className="flex gap-4 pt-2">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
