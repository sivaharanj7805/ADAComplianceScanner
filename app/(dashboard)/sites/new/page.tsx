import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import AddSiteContent from './AddSiteContent';

export const metadata = {
  title: 'Add Site - AccessAudit',
};

export default async function AddSitePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-4 w-64 rounded bg-gray-200" />
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="h-10 w-full rounded-lg bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-200" />
            <div className="h-10 w-32 rounded-lg bg-gray-200" />
          </div>
        </div>
      }
    >
      <AddSiteContent userId={user.id} />
    </Suspense>
  );
}
