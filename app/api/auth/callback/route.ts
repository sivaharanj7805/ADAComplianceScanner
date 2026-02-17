import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/send';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  try {
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.user) {
        // Check if this is a new user (profile was just created by trigger)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name, created_at')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const createdAt = new Date(profile.created_at).getTime();
            const now = Date.now();
            const isNewUser = now - createdAt < 60_000; // within 1 minute

            if (isNewUser) {
              sendWelcomeEmail({
                email: profile.email,
                full_name: profile.full_name,
              }).catch(() => {});
            }
          }
        } catch (profileErr) {
          console.error('[GET /api/auth/callback] Profile check failed:', profileErr);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  } catch (err) {
    console.error('[GET /api/auth/callback] Unhandled error:', err);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }
}
