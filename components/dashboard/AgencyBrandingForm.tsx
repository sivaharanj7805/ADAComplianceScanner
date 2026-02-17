'use client';

import { useState, useRef, useTransition } from 'react';
import { Upload, Check, Loader2, X } from 'lucide-react';
import type { AgencySettings } from '@/lib/types/database';
import { updateAgencySettingsAction, uploadAgencyLogoAction } from '@/app/(dashboard)/settings/actions';
import ReportPreview from './ReportPreview';

interface AgencyBrandingFormProps {
  initialSettings: AgencySettings | null;
}

export default function AgencyBrandingForm({ initialSettings }: AgencyBrandingFormProps) {
  const [agencyName, setAgencyName] = useState(initialSettings?.agency_name ?? '');
  const [primaryColor, setPrimaryColor] = useState(initialSettings?.primary_color ?? '#EA580C');
  const [secondaryColor, setSecondaryColor] = useState(initialSettings?.secondary_color ?? '#0F172A');
  const [footerText, setFooterText] = useState(initialSettings?.report_footer_text ?? '');
  const [logoUrl, setLogoUrl] = useState(initialSettings?.logo_url ?? '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    setSaveStatus('saving');
    setErrorMessage('');

    const formData = new FormData();
    formData.set('agency_name', agencyName);
    formData.set('primary_color', primaryColor);
    formData.set('secondary_color', secondaryColor);
    formData.set('report_footer_text', footerText);

    startTransition(async () => {
      const result = await updateAgencySettingsAction(formData);
      if (result.error) {
        setSaveStatus('error');
        setErrorMessage(result.error);
      } else {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.set('logo', file);

    const result = await uploadAgencyLogoAction(formData);
    if (result.error) {
      setErrorMessage(result.error);
    } else if (result.url) {
      setLogoUrl(result.url);
    }

    setUploadingLogo(false);
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleRemoveLogo() {
    setLogoUrl('');
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Settings Form */}
      <div className="space-y-6">
        {/* Agency Name */}
        <div>
          <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 mb-1">
            Agency Name
          </label>
          <input
            id="agency_name"
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            placeholder="Your Agency Name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Shown on report cover pages and headers
          </p>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency Logo
          </label>
          <div className="flex items-start gap-4">
            {/* Logo preview */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
              {logoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Agency logo"
                    className="h-full w-full object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white shadow-sm hover:bg-red-600"
                    aria-label="Remove logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {uploadingLogo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {logoUrl ? 'Replace Logo' : 'Upload Logo'}
                  </>
                )}
              </button>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPEG, SVG, or WebP. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primary_color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-gray-300 p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                    setPrimaryColor(val);
                  }
                }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                maxLength={7}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Used for accents and highlights
            </p>
          </div>
          <div>
            <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Brand Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="secondary_color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-gray-300 p-0.5"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                    setSecondaryColor(val);
                  }
                }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                maxLength={7}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Used for headers and text
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <div>
          <label htmlFor="report_footer_text" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Report Footer Text
          </label>
          <textarea
            id="report_footer_text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="e.g., Confidential — Prepared by Your Agency Name"
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {footerText.length}/500 characters. Shown at the bottom of every report page.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || saveStatus === 'saving' || !agencyName.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveStatus === 'saving' || isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              'Save Branding Settings'
            )}
          </button>
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600">Changes saved successfully</span>
          )}
        </div>
      </div>

      {/* Report Preview Panel */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Report Cover Preview
        </h3>
        <ReportPreview
          agencyName={agencyName || 'Your Agency'}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          logoUrl={logoUrl}
          footerText={footerText}
        />
      </div>
    </div>
  );
}
