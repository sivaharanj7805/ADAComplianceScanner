'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile, updateProfile, getAgencySettings, upsertAgencySettings } from '@/lib/supabase/queries';
import { uploadAgencyLogo } from '@/lib/supabase/storage';
import { z } from 'zod';

// ============================================================================
// Profile actions
// ============================================================================

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  company_name: z.string().max(100).optional(),
});

export async function updateProfileAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const parsed = profileSchema.safeParse({
    full_name: formData.get('full_name'),
    company_name: formData.get('company_name') || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage = Object.values(fieldErrors).flat()[0];
    return { error: (firstMessage as string) ?? 'Invalid input' };
  }

  const { error } = await updateProfile(user.id, {
    full_name: parsed.data.full_name,
    company_name: parsed.data.company_name ?? null,
  });

  if (error) {
    return { error };
  }

  revalidatePath('/settings');
  return { success: true };
}

// ============================================================================
// Agency branding actions
// ============================================================================

const agencySettingsSchema = z.object({
  agency_name: z.string().min(1, 'Agency name is required').max(100),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format'),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format'),
  report_footer_text: z.string().max(500).optional(),
});

export async function updateAgencySettingsAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify user is on an agency plan
  const { data: profile } = await getProfile(user.id);
  if (!profile || !profile.plan.startsWith('agency_')) {
    return { error: 'Agency plan required' };
  }

  const parsed = agencySettingsSchema.safeParse({
    agency_name: formData.get('agency_name'),
    primary_color: formData.get('primary_color'),
    secondary_color: formData.get('secondary_color'),
    report_footer_text: formData.get('report_footer_text') || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage = Object.values(fieldErrors).flat()[0];
    return { error: (firstMessage as string) ?? 'Invalid input' };
  }

  // Check for existing settings
  const { data: existing } = await getAgencySettings(user.id);

  const { error } = await upsertAgencySettings(
    user.id,
    {
      agency_name: parsed.data.agency_name,
      primary_color: parsed.data.primary_color,
      secondary_color: parsed.data.secondary_color,
      report_footer_text: parsed.data.report_footer_text ?? null,
    },
    existing?.id
  );

  if (error) {
    return { error };
  }

  revalidatePath('/settings/agency');
  return { success: true };
}

export async function uploadAgencyLogoAction(
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify user is on an agency plan
  const { data: profile } = await getProfile(user.id);
  if (!profile || !profile.plan.startsWith('agency_')) {
    return { error: 'Agency plan required' };
  }

  const file = formData.get('logo') as File | null;
  if (!file || file.size === 0) {
    return { error: 'No file provided' };
  }

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await uploadAgencyLogo(
    user.id,
    file
  );

  if (uploadError || !uploadData) {
    return { error: uploadError ?? 'Upload failed' };
  }

  // Update agency_settings with the new logo URL
  const { data: existing } = await getAgencySettings(user.id);

  if (existing) {
    await upsertAgencySettings(
      user.id,
      { logo_url: uploadData.url },
      existing.id
    );
  } else {
    // Create settings record with logo and defaults
    await upsertAgencySettings(user.id, {
      agency_name: profile.company_name ?? 'My Agency',
      logo_url: uploadData.url,
      primary_color: '#EA580C',
      secondary_color: '#0F172A',
    });
  }

  revalidatePath('/settings/agency');
  return { url: uploadData.url };
}
