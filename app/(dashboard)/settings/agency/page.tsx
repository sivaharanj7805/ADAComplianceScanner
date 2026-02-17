import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getAgencySettings } from '@/lib/supabase/queries';
import AgencyBrandingForm from '@/components/dashboard/AgencyBrandingForm';

export const metadata = {
  title: 'Agency Branding — AccessAudit',
};

export default async function AgencySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await getProfile(user.id);

  if (!profile) {
    redirect('/login');
  }

  // Only agency plans can access this page
  if (!profile.plan.startsWith('agency_')) {
    redirect('/settings');
  }

  const { data: agencySettings } = await getAgencySettings(user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Palette className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agency Branding
            </h1>
            <p className="text-sm text-gray-500">
              Customize how your compliance reports look to your clients
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <AgencyBrandingForm initialSettings={agencySettings} />
      </div>
    </div>
  );
}
