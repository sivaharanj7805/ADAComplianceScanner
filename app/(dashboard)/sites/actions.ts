'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';
import {
  createSite as dbCreateSite,
  deleteSite as dbDeleteSite,
  getSites,
  getProfile,
  getSite,
  getLastScanTime,
} from '@/lib/supabase/queries';

// ============================================================================
// Types
// ============================================================================

interface ActionResult {
  error?: string;
  success?: boolean;
}

interface CreateSiteResult extends ActionResult {
  siteId?: string;
}

// ============================================================================
// Schemas
// ============================================================================

const createSiteSchema = z.object({
  url: z
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
  name: z.string().max(100).optional(),
});

// ============================================================================
// Actions
// ============================================================================

export async function createSiteAction(
  formData: FormData
): Promise<CreateSiteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to add a site.' };
  }

  let rawUrl = (formData.get('url') as string)?.trim() ?? '';

  // Auto-prepend https:// if no protocol
  if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  const parsed = createSiteSchema.safeParse({
    url: rawUrl,
    name: (formData.get('name') as string)?.trim() || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
    return { error: firstError };
  }

  const { url, name } = parsed.data;

  // Check plan limits
  const [{ data: profile }, { data: sites }] = await Promise.all([
    getProfile(user.id),
    getSites(user.id),
  ]);

  if (!profile) {
    return { error: 'Profile not found.' };
  }

  if (sites.length >= profile.sites_limit) {
    return {
      error: `You've reached your plan limit of ${profile.sites_limit} sites. Upgrade to add more.`,
    };
  }

  // Check for duplicate URL
  const normalizedUrl = url.replace(/\/+$/, '');
  const duplicate = sites.find(
    (s) => s.url.replace(/\/+$/, '') === normalizedUrl
  );
  if (duplicate) {
    return { error: 'You already have this site added.' };
  }

  // Generate name from URL domain if not provided
  const siteName =
    name ||
    (() => {
      try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
      } catch {
        return url;
      }
    })();

  const { data: site, error } = await dbCreateSite(user.id, {
    url: normalizedUrl,
    name: siteName,
  });

  if (error || !site) {
    return { error: error ?? 'Failed to create site.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/sites');
  return { success: true, siteId: site.id };
}

export async function deleteSiteAction(
  siteId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in.' };
  }

  const { error } = await dbDeleteSite(siteId, user.id);

  if (error) {
    return { error };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/sites');
  redirect('/dashboard/sites');
}

export async function triggerScanAction(
  siteId: string
): Promise<ActionResult & { scanId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in.' };
  }

  // Verify user owns the site
  const { data: site } = await getSite(siteId, user.id);
  if (!site) {
    return { error: 'Site not found.' };
  }

  // Check rate limits: free plan = 1 scan per site per hour
  const { data: profile } = await getProfile(user.id);
  if (profile?.plan === 'free') {
    const { data: lastScanTime } = await getLastScanTime(siteId, user.id);
    if (lastScanTime) {
      const elapsed = Date.now() - new Date(lastScanTime).getTime();
      const oneHour = 60 * 60 * 1000;
      if (elapsed < oneHour) {
        const minutesLeft = Math.ceil((oneHour - elapsed) / 60000);
        return {
          error: `Free plan: 1 scan per site per hour. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
        };
      }
    }
  }

  // Trigger scan via API
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cookieStore = await import('next/headers').then((m) => m.cookies());
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  try {
    const response = await fetch(`${appUrl}/api/scan/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ siteId }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error ?? 'Scan failed to start.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/sites');
    revalidatePath(`/dashboard/sites/${siteId}`);
    return { success: true, scanId: result.data?.scanId };
  } catch {
    return { error: 'Failed to connect to scan service.' };
  }
}
