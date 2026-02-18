'use client';

import { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import UpgradePlanModal from './UpgradePlanModal';

interface ManageBillingButtonProps {
  isFree: boolean;
}

export default function ManageBillingButton({ isFree }: ManageBillingButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  if (!isFree) {
    return (
      <button
        onClick={handleManageBilling}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Manage Billing
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
      >
        Upgrade Plan
        <ChevronRight className="h-4 w-4" />
      </button>

      <UpgradePlanModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
