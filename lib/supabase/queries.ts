import { createClient } from './server';
import type {
  Profile,
  ProfileUpdate,
  Site,
  SiteInsert,
  Scan,
  Violation,
} from '@/lib/types/database';

// ============================================================================
// Profiles
// ============================================================================

export async function getProfile(
  userId: string
): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

// ============================================================================
// Sites
// ============================================================================

export async function getSites(
  userId: string
): Promise<{ data: Site[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

export async function createSite(
  userId: string,
  site: Omit<SiteInsert, 'user_id'>
): Promise<{ data: Site | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sites')
    .insert({ ...site, user_id: userId })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function deleteSite(
  siteId: string,
  userId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', siteId)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

// ============================================================================
// Scans
// ============================================================================

export async function getScans(
  siteId: string,
  userId: string,
  limit = 20
): Promise<{ data: Scan[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('site_id', siteId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

export async function getLatestScan(
  siteId: string
): Promise<{ data: Scan | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // PGRST116 = no rows returned, which is expected for sites with no scans
    if (error.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

// ============================================================================
// Violations
// ============================================================================

export async function getViolations(
  scanId: string,
  userId: string
): Promise<{ data: Violation[]; error: string | null }> {
  const supabase = await createClient();

  // First verify the scan belongs to this user (RLS handles this, but
  // we also get a clean error message if it doesn't)
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('id')
    .eq('id', scanId)
    .eq('user_id', userId)
    .single();

  if (scanError || !scan) {
    return { data: [], error: scanError?.message ?? 'Scan not found' };
  }

  const { data, error } = await supabase
    .from('violations')
    .select('*')
    .eq('scan_id', scanId)
    .order('severity', { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

export async function getScanWithViolations(
  scanId: string,
  userId: string
): Promise<{
  data: { scan: Scan; violations: Violation[] } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .eq('user_id', userId)
    .single();

  if (scanError || !scan) {
    return { data: null, error: scanError?.message ?? 'Scan not found' };
  }

  const { data: violations, error: violationsError } = await supabase
    .from('violations')
    .select('*')
    .eq('scan_id', scanId)
    .order('severity', { ascending: true });

  if (violationsError) {
    return { data: null, error: violationsError.message };
  }

  return {
    data: { scan, violations: violations ?? [] },
    error: null,
  };
}
