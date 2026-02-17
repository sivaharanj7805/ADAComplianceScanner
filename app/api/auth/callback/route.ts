import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/send';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if this is a new user (profile was just created by trigger)
      // by looking at whether created_at is very recent (within last minute)
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
          // Fire-and-forget: don't block the redirect on email delivery
          sendWelcomeEmail({
            email: profile.email,
            full_name: profile.full_name,
          }).catch(() => {
            // Silently ignore email failures — user still gets access
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
