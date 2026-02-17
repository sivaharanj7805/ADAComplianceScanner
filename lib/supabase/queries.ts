import { createClient } from './server';
import type {
  Profile,
  ProfileUpdate,
  Site,
  SiteInsert,
  SiteUpdate,
  Scan,
  ScanInsert,
  ScanUpdate,
  Violation,
  ViolationInsert,
  ScanPageInsert,
  AgencySettings,
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

// ============================================================================
// Dashboard aggregations
// ============================================================================

export async function getDashboardStats(
  userId: string
): Promise<{
  data: {
    sitesCount: number;
    sitesLimit: number;
    averageScore: number | null;
    totalViolations: number;
    criticalIssues: number;
  } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('sites_limit')
    .eq('id', userId)
    .single();

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('current_score, total_violations, critical_violations')
    .eq('user_id', userId);

  if (sitesError) {
    return { data: null, error: sitesError.message };
  }

  type SiteStats = { current_score: number | null; total_violations: number; critical_violations: number };
  const sitesList: SiteStats[] = sites ?? [];
  const sitesWithScores = sitesList.filter((s: SiteStats) => s.current_score !== null);
  const averageScore =
    sitesWithScores.length > 0
      ? Math.round(
          sitesWithScores.reduce((sum: number, s: SiteStats) => sum + (s.current_score ?? 0), 0) /
            sitesWithScores.length
        )
      : null;
  const totalViolations = sitesList.reduce(
    (sum: number, s: SiteStats) => sum + s.total_violations,
    0
  );
  const criticalIssues = sitesList.reduce(
    (sum: number, s: SiteStats) => sum + s.critical_violations,
    0
  );

  return {
    data: {
      sitesCount: sitesList.length,
      sitesLimit: profile.sites_limit,
      averageScore,
      totalViolations,
      criticalIssues,
    },
    error: null,
  };
}

export async function getRecentScans(
  userId: string,
  limit = 5
): Promise<{ data: (Scan & { site_name: string; site_url: string })[]; error: string | null }> {
  const supabase = await createClient();

  const { data: scans, error: scansError } = await supabase
    .from('scans')
    .select('*, sites(name, url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (scansError) {
    return { data: [], error: scansError.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (scans ?? []).map((scan: any) => {
    const site = scan.sites as { name: string; url: string } | null;
    return {
      id: scan.id,
      site_id: scan.site_id,
      user_id: scan.user_id,
      status: scan.status,
      score: scan.score,
      total_violations: scan.total_violations,
      critical_count: scan.critical_count,
      serious_count: scan.serious_count,
      moderate_count: scan.moderate_count,
      minor_count: scan.minor_count,
      pages_scanned: scan.pages_scanned,
      pages_total: scan.pages_total,
      started_at: scan.started_at,
      completed_at: scan.completed_at,
      error_message: scan.error_message,
      created_at: scan.created_at,
      site_name: site?.name ?? 'Unknown',
      site_url: site?.url ?? '',
    } as Scan & { site_name: string; site_url: string };
  });

  return { data: result, error: null };
}

// ============================================================================
// Site management
// ============================================================================

export async function getSite(
  siteId: string,
  userId: string
): Promise<{ data: Site | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: 'Site not found' };
    }
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateSite(
  siteId: string,
  userId: string,
  updates: SiteUpdate
): Promise<{ data: Site | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sites')
    .update(updates)
    .eq('id', siteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

// ============================================================================
// Scan management
// ============================================================================

export async function createScan(
  scan: ScanInsert
): Promise<{ data: Scan | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scans')
    .insert(scan)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateScan(
  scanId: string,
  updates: ScanUpdate
): Promise<{ data: Scan | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scans')
    .update(updates)
    .eq('id', scanId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function getScan(
  scanId: string,
  userId: string
): Promise<{ data: (Scan & { site_name: string; site_url: string }) | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scans')
    .select('*, sites(name, url)')
    .eq('id', scanId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: 'Scan not found' };
    }
    return { data: null, error: error.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  const site = raw.sites as { name: string; url: string } | null;
  return {
    data: {
      id: raw.id,
      site_id: raw.site_id,
      user_id: raw.user_id,
      status: raw.status,
      score: raw.score,
      total_violations: raw.total_violations,
      critical_count: raw.critical_count,
      serious_count: raw.serious_count,
      moderate_count: raw.moderate_count,
      minor_count: raw.minor_count,
      pages_scanned: raw.pages_scanned,
      pages_total: raw.pages_total,
      started_at: raw.started_at,
      completed_at: raw.completed_at,
      error_message: raw.error_message,
      created_at: raw.created_at,
      site_name: site?.name ?? 'Unknown',
      site_url: site?.url ?? '',
    },
    error: null,
  };
}

// ============================================================================
// Violation management
// ============================================================================

export async function insertViolations(
  violations: ViolationInsert[]
): Promise<{ error: string | null }> {
  if (violations.length === 0) return { error: null };
  const supabase = await createClient();
  const { error } = await supabase.from('violations').insert(violations);
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

// ============================================================================
// Scan pages management
// ============================================================================

export async function insertScanPages(
  pages: ScanPageInsert[]
): Promise<{ error: string | null }> {
  if (pages.length === 0) return { error: null };
  const supabase = await createClient();
  const { error } = await supabase.from('scan_pages').insert(pages);
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function getLastScanTime(
  siteId: string,
  userId: string
): Promise<{ data: string | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scans')
    .select('created_at')
    .eq('site_id', siteId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data: null, error: error.message };
  }
  return { data: data.created_at, error: null };
}

// ============================================================================
// Agency settings
// ============================================================================

export async function getAgencySettings(
  userId: string
): Promise<{ data: AgencySettings | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data: null, error: error.message };
  }
  return { data, error: null };
}
