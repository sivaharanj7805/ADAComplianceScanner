import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';
import {
  getSite,
  getProfile,
  createScan,
  updateScan,
  updateSite,
  insertViolations,
  insertScanPages,
  getLastScanTime,
  getViolations,
} from '@/lib/supabase/queries';
import { scanPage } from '@/lib/scanner/scan-page';
import { crawlSite } from '@/lib/scanner/crawl-site';
import {
  sendScanCompleteEmail,
  sendNewViolationsEmail,
  sendScoreImprovedEmail,
} from '@/lib/email/send';
import type { ViolationInsert, ScanPageInsert } from '@/lib/types/database';

const triggerScanSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }
    const parsed = triggerScanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

    const { siteId } = parsed.data;

    // Verify user owns the site
    const { data: site, error: siteError } = await getSite(siteId, user.id);
    if (!site || siteError) {
      return NextResponse.json(
        { error: 'Site not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch profile for plan limits
    const { data: profile } = await getProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Rate limit: free plan = 1 scan per site per hour
    if (profile.plan === 'free') {
      const { data: lastScanTime } = await getLastScanTime(siteId, user.id);
      if (lastScanTime) {
        const elapsed = Date.now() - new Date(lastScanTime).getTime();
        const oneHour = 60 * 60 * 1000;
        if (elapsed < oneHour) {
          const minutesLeft = Math.ceil((oneHour - elapsed) / 60000);
          return NextResponse.json(
            {
              error: `Rate limit: 1 scan per hour on free plan. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
            },
            { status: 429 }
          );
        }
      }
    }

    // Create scan record with status 'pending'
    const { data: scan, error: scanError } = await createScan({
      site_id: siteId,
      user_id: user.id,
      status: 'pending',
      started_at: new Date().toISOString(),
      pages_total: 0,
    });

    if (!scan || scanError) {
      return NextResponse.json(
        { error: scanError ?? 'Failed to create scan record' },
        { status: 500 }
      );
    }

    // Update status to 'running'
    await updateScan(scan.id, { status: 'running' });

    try {
      // Crawl the site to find pages (respect pages_per_site_limit)
      const maxPages = profile.pages_per_site_limit;
      const crawlResult = await crawlSite(site.url, maxPages);
      const urls = crawlResult.urls;

      await updateScan(scan.id, { pages_total: urls.length });

      // Scan each page
      const allViolations: ViolationInsert[] = [];
      const scanPages: ScanPageInsert[] = [];
      let pagesScanned = 0;
      let pagesFailed = 0;
      let totalScore = 0;
      let criticalCount = 0;
      let seriousCount = 0;
      let moderateCount = 0;
      let minorCount = 0;

      for (const url of urls) {
        const outcome = await scanPage(url);

        if (outcome.success) {
          pagesScanned++;
          totalScore += outcome.result.score;

          scanPages.push({
            scan_id: scan.id,
            url,
            status: 'scanned',
            violation_count: outcome.result.violations.length,
            score: outcome.result.score,
            scanned_at: new Date().toISOString(),
          });

          // Convert TranslatedViolation to ViolationInsert
          for (const v of outcome.result.violations) {
            const severity = v.severity;
            if (severity === 'critical') criticalCount += v.instanceCount;
            else if (severity === 'serious') seriousCount += v.instanceCount;
            else if (severity === 'moderate') moderateCount += v.instanceCount;
            else if (severity === 'minor') minorCount += v.instanceCount;

            allViolations.push({
              scan_id: scan.id,
              site_id: siteId,
              page_url: url,
              rule_id: v.ruleId,
              severity: v.severity,
              impact: v.impact,
              description: v.description,
              help_text: v.fix,
              html_snippet: v.htmlSnippets[0] ?? null,
              css_selector: v.cssSelectors[0] ?? null,
              wcag_criteria: v.wcagCriteria,
              is_new: true,
            });
          }
        } else {
          pagesFailed++;
          scanPages.push({
            scan_id: scan.id,
            url,
            status: 'failed',
            violation_count: 0,
            score: null,
            scanned_at: new Date().toISOString(),
          });
        }
      }

      // Calculate overall score
      const overallScore =
        pagesScanned > 0 ? Math.round(totalScore / pagesScanned) : 0;
      const totalViolations = allViolations.length;

      // Insert violations and scan pages
      await Promise.all([
        insertViolations(allViolations),
        insertScanPages(scanPages),
      ]);

      // Update scan record
      await updateScan(scan.id, {
        status: 'completed',
        score: overallScore,
        total_violations: totalViolations,
        critical_count: criticalCount,
        serious_count: seriousCount,
        moderate_count: moderateCount,
        minor_count: minorCount,
        pages_scanned: pagesScanned,
        pages_total: urls.length,
        completed_at: new Date().toISOString(),
      });

      // Update the site's current score and violation counts
      await updateSite(siteId, user.id, {
        current_score: overallScore,
        total_violations: totalViolations,
        critical_violations: criticalCount,
        last_scanned_at: new Date().toISOString(),
      });

      // ── Send email notifications (fire-and-forget) ──────────────────
      const completedScan = {
        id: scan.id,
        score: overallScore,
        total_violations: totalViolations,
        critical_count: criticalCount,
        serious_count: seriousCount,
        pages_scanned: pagesScanned,
      };

      // 1. Always send scan-complete email
      sendScanCompleteEmail(profile, completedScan, site, allViolations).catch(
        () => {}
      );

      // 2. Compare with previous scan for new-violations and score-improved emails
      (async () => {
        try {
          // Fetch the last 2 completed scans to compare current vs previous
          const supabaseClient = await createClient();
          const { data: recentScans } = await supabaseClient
            .from('scans')
            .select('id, score')
            .eq('site_id', siteId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(2);

          const prevScan = recentScans && recentScans.length > 1 ? recentScans[1] : null;

          if (prevScan) {
            // Check for new violations by comparing rule_ids
            const { data: prevViolations } = await getViolations(
              prevScan.id,
              user.id
            );
            const prevRuleIds = new Set(
              prevViolations.map((v) => `${v.rule_id}:${v.page_url}`)
            );
            const newViolations = allViolations.filter(
              (v) => !prevRuleIds.has(`${v.rule_id}:${v.page_url}`)
            );

            if (newViolations.length > 0) {
              sendNewViolationsEmail(profile, site, newViolations).catch(
                () => {}
              );
            }

            // Check for score improvement
            if (
              prevScan.score !== null &&
              overallScore > prevScan.score
            ) {
              sendScoreImprovedEmail(
                profile,
                site,
                prevScan.score,
                overallScore
              ).catch(() => {});
            }
          }
        } catch {
          // Silently ignore email comparison failures
        }
      })();

      return NextResponse.json({
        data: {
          scanId: scan.id,
          score: overallScore,
          totalViolations,
          pagesScanned,
          pagesFailed,
        },
      });
    } catch (err) {
      // If scan execution fails, mark it as failed
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error during scan';
      console.error(`[POST /api/scan/trigger] Scan execution failed for site ${siteId}:`, err);
      await updateScan(scan.id, {
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      });

      return NextResponse.json(
        { error: 'The scan failed due to an unexpected error. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('[POST /api/scan/trigger] Unhandled error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
