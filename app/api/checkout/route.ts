import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/queries';
import { PLAN_CONFIGS } from '@/lib/stripe/products';
import type { PlanType } from '@/lib/types/database';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(key);
}

const checkoutSchema = z.object({
  planId: z.string().refine(
    (val): val is PlanType => val in PLAN_CONFIGS && val !== 'free',
    { message: 'Invalid plan ID' }
  ),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid plan' },
        { status: 400 }
      );
    }

    const { planId } = validation.data;
    const planConfig = PLAN_CONFIGS[planId];

    if (!planConfig.stripePriceId) {
      return NextResponse.json(
        { error: 'This plan is not yet available for purchase. Please contact support.' },
        { status: 400 }
      );
    }

    // Fetch profile to get or create Stripe customer
    const { data: profile, error: profileError } = await getProfile(user.id);
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to load profile' },
        { status: 500 }
      );
    }

    // If user already has an active subscription, redirect to billing portal instead
    if (
      profile.stripe_subscription_id &&
      (profile.subscription_status === 'active' || profile.subscription_status === 'trialing')
    ) {
      if (!profile.stripe_customer_id) {
        return NextResponse.json(
          { error: 'Subscription exists but no Stripe customer ID found. Please contact support.' },
          { status: 400 }
        );
      }

      const portalSession = await getStripe().billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success&plan=${planId}`,
      cancel_url: `${appUrl}/pricing`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id,
          planId,
        },
      },
      metadata: {
        userId: user.id,
        planId,
      },
    };

    // If user already has a Stripe customer, reuse it
    if (profile.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      sessionParams.customer_email = profile.email;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[POST /api/checkout] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again later.' },
      { status: 500 }
    );
  }
}
