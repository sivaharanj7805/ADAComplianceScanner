'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

interface PlanOption {
  id: string;
  name: string;
  price: number;
  features: string[];
  segment: 'ecommerce' | 'municipal' | 'agency';
}

const UPGRADE_PLANS: PlanOption[] = [
  {
    id: 'ecom_shield',
    name: 'E-Commerce Shield',
    price: 79,
    segment: 'ecommerce',
    features: ['1 site', '500 pages', 'Weekly scans', 'PDF reports'],
  },
  {
    id: 'ecom_guard',
    name: 'E-Commerce Guard',
    price: 149,
    segment: 'ecommerce',
    features: ['3 sites', '2,000 pages/site', 'Weekly scans', 'Priority support'],
  },
  {
    id: 'municipal_starter',
    name: 'Municipal Starter',
    price: 99,
    segment: 'municipal',
    features: ['1 site', '500 pages', 'Weekly scans', 'Title II tracking'],
  },
  {
    id: 'municipal_pro',
    name: 'Municipal Pro',
    price: 199,
    segment: 'municipal',
    features: ['3 sites', '2,000 pages/site', 'Weekly scans', 'Priority support'],
  },
  {
    id: 'agency_starter',
    name: 'Agency Starter',
    price: 149,
    segment: 'agency',
    features: ['10 client sites', '500 pages/site', 'White-label reports', 'PDF export'],
  },
  {
    id: 'agency_growth',
    name: 'Agency Growth',
    price: 299,
    segment: 'agency',
    features: ['25 client sites', '500 pages/site', 'White-label reports', 'Priority support'],
  },
];

const SEGMENT_LABELS: Record<string, string> = {
  ecommerce: 'E-Commerce',
  municipal: 'Municipal',
  agency: 'Agency',
};

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UpgradePlanModal({ open, onClose }: UpgradePlanModalProps) {
  const [segment, setSegment] = useState<'ecommerce' | 'municipal' | 'agency'>('ecommerce');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const filteredPlans = UPGRADE_PLANS.filter((p) => p.segment === segment);

  async function handleSelectPlan(planId: string) {
    setLoading(planId);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to start checkout');
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Choose a Plan</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Segment tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(['ecommerce', 'municipal', 'agency'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                segment === s
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {SEGMENT_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-gray-200 p-5 flex flex-col"
            >
              <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                ${plan.price}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>

              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading !== null}
                className="mt-4 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  'Start 14-Day Free Trial'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-4">
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          </div>
        )}

        {/* Footer note */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-gray-400">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
