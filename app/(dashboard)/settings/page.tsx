import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Settings,
  User,
  CreditCard,
  Palette,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/queries';
import ProfileForm from './ProfileForm';

export const metadata = {
  title: 'Settings — AccessAudit',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  agency_starter: 'Agency Starter',
  agency_growth: 'Agency Growth',
  agency_scale: 'Agency Scale',
  ecom_shield: 'eComm Shield',
  ecom_guard: 'eComm Guard',
  ecom_fortress: 'eComm Fortress',
  municipal_starter: 'Municipal Starter',
  municipal_pro: 'Municipal Pro',
};

export default async function SettingsPage() {
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

  const isAgencyPlan = profile.plan.startsWith('agency_');

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <Settings className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your account, billing, and preferences
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <User className="h-5 w-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="p-6">
          <ProfileForm
            initialName={profile.full_name ?? ''}
            initialCompany={profile.company_name ?? ''}
            email={profile.email}
          />
        </div>
      </section>

      {/* Billing Section */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Billing</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Current Plan:{' '}
                <span className="font-semibold text-orange-600">
                  {PLAN_LABELS[profile.plan] ?? profile.plan}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Status: {profile.subscription_status}
              </p>
            </div>
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage Billing
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Agency Branding Section (agency plans only) */}
      {isAgencyPlan && (
        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
            <Palette className="h-5 w-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">
              Agency Branding
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Customize reports with your agency logo, colors, and branding
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  White-label PDF reports for your clients
                </p>
              </div>
              <Link
                href="/settings/agency"
                className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                Configure Branding
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Account Section */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <Shield className="h-5 w-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Account</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Change Password
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Update your account password
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Change Password
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">
                  Delete Account
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Permanently delete your account and all data
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
