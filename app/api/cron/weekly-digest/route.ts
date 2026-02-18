import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWeeklyDigest } from '@/lib/email/send';
import type { Profile } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  // ── Authorize with CRON_SECRET ──
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[CRON /api/cron/weekly-digest] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 });
  }

  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Fetch all active paid users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, plan, subscription_status')
      .neq('plan', 'free')
      .in('subscription_status', ['active', 'trialing']);

    if (profilesError) {
      console.error('[CRON weekly-digest] Failed to fetch profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No active users to send digests to', sent: 0 });
    }

    // Calculate week range
    const now = new Date();
    const weekEnd = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekStart = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekAgoIso = weekAgo.toISOString();

    let sent = 0;
    let failed = 0;

    for (const profile of profiles) {
      try {
        // Fetch user's sites with their current stats
        const { data: sites } = await supabase
          .from('sites')
          .select('id, name, url, current_score, total_violations')
          .eq('user_id', profile.id)
          .eq('is_active', true);

        if (!sites || sites.length === 0) continue;

        // For each site, get scans from the past week to calculate changes
        const siteSummaries = await Promise.all(
          sites.map(async (site) => {
            const { data: recentScans } = await supabase
              .from('scans')
              .select('score, total_violations, resolved_count, created_at')
              .eq('site_id', site.id)
              .eq('status', 'completed')
              .gte('created_at', weekAgoIso)
              .order('created_at', { ascending: false });

            // Get previous score from the scan before this week
            const { data: prevScans } = await supabase
              .from('scans')
              .select('score')
              .eq('site_id', site.id)
              .eq('status', 'completed')
              .lt('created_at', weekAgoIso)
              .order('created_at', { ascending: false })
              .limit(1);

            const newViolations = recentScans?.reduce(
              (sum, s) => sum + (s.total_violations ?? 0),
              0
            ) ?? 0;
            const resolvedViolations = recentScans?.reduce(
              (sum, s) => sum + (s.resolved_count ?? 0),
              0
            ) ?? 0;

            return {
              name: site.name,
              url: site.url,
              score: site.current_score,
              previousScore: prevScans?.[0]?.score ?? null,
              totalViolations: site.total_violations,
              newViolations,
              resolvedViolations,
            };
          })
        );

        const { error: sendError } = await sendWeeklyDigest(
          profile as Pick<Profile, 'email' | 'full_name'>,
          siteSummaries,
          weekStart,
          weekEnd
        );

        if (sendError) {
          console.warn(`[CRON weekly-digest] Failed to send to ${profile.email}:`, sendError);
          failed++;
        } else {
          sent++;
        }
      } catch (err) {
        console.warn(`[CRON weekly-digest] Error processing user ${profile.id}:`, err);
        failed++;
      }
    }

    console.log(`[CRON weekly-digest] Sent ${sent}, failed ${failed}`);
    return NextResponse.json({ message: `Sent ${sent} weekly digests`, sent, failed });
  } catch (err) {
    console.error('[CRON weekly-digest] Unhandled error:', err);
    return NextResponse.json({ error: 'Weekly digest cron failed' }, { status: 500 });
  }
}
