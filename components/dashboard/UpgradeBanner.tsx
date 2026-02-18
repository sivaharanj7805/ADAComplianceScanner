'use client';

import { useState } from 'react';
import UpgradePlanModal from './UpgradePlanModal';

export default function UpgradeBanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-700">
          Upgrade to unlock multi-page scanning, automated monitoring, and PDF reports
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 text-white rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap hover:bg-orange-600 transition-colors"
        >
          Upgrade
        </button>
      </div>

      <UpgradePlanModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
