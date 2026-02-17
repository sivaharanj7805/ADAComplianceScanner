'use client';

import { useState, useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { updateProfileAction } from './actions';

interface ProfileFormProps {
  initialName: string;
  initialCompany: string;
  email: string;
}

export default function ProfileForm({
  initialName,
  initialCompany,
  email,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialName);
  const [companyName, setCompanyName] = useState(initialCompany);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    setStatus('saving');
    setErrorMessage('');

    const formData = new FormData();
    formData.set('full_name', fullName);
    formData.set('company_name', companyName);

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.error) {
        setStatus('error');
        setErrorMessage(result.error);
      } else {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name
        </label>
        <input
          id="company_name"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Your company name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || status === 'saving' || !fullName.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'saving' || isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : status === 'saved' ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            'Save Profile'
          )}
        </button>
        {status === 'saved' && (
          <span className="text-sm text-green-600">Profile updated</span>
        )}
      </div>
    </div>
  );
}
