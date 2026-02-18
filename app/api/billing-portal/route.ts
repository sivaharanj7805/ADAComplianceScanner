import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/queries';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(key);
}

export async function POST() {
  try {
    // Authenticate
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch profile to get Stripe customer ID
    const { data: profile, error: profileError } = await getProfile(user.id);
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to load profile' },
        { status: 500 }
      );
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing information found. Please subscribe to a plan first.' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('[POST /api/billing-portal] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Failed to open billing portal. Please try again later.' },
      { status: 500 }
    );
  }
}
