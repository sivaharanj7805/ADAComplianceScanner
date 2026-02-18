import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_CONFIGS, getPlanByStripePriceId } from "@/lib/stripe/products";
import type { PlanType } from "@/lib/types/database";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    if (!body) {
      console.warn('[POST /api/webhooks/stripe] Empty request body');
      return NextResponse.json(
        { error: 'Missing request body' },
        { status: 400 }
      );
    }

    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.warn('[POST /api/webhooks/stripe] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[POST /api/webhooks/stripe] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Verify signature BEFORE processing any events
    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[POST /api/webhooks/stripe] Signature verification failed:', message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId as PlanType | undefined;

        if (!userId) {
          console.error('[Stripe] checkout.session.completed: missing userId in metadata');
          break;
        }

        const plan = planId ? PLAN_CONFIGS[planId] : null;

        await supabase
          .from('profiles')
          .update({
            plan: planId ?? 'free',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            sites_limit: plan?.limits.sites ?? 1,
            pages_per_site_limit: plan?.limits.pagesPerSite ?? 1,
          })
          .eq('id', userId);

        console.log(`[Stripe] checkout.session.completed: updated profile ${userId} to plan ${planId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error(`[Stripe] customer.subscription.updated: no profile found for customer ${customerId}`);
          break;
        }

        // Determine new plan from subscription items
        const priceId = subscription.items.data[0]?.price?.id;
        const planMatch = priceId ? getPlanByStripePriceId(priceId) : null;

        const statusMap: Record<string, string> = {
          active: 'active',
          trialing: 'trialing',
          past_due: 'past_due',
          canceled: 'canceled',
          unpaid: 'past_due',
          incomplete: 'inactive',
          incomplete_expired: 'inactive',
          paused: 'inactive',
        };

        const subscriptionStatus = statusMap[subscription.status] ?? 'inactive';

        const updateData: Record<string, unknown> = {
          subscription_status: subscriptionStatus,
        };

        if (planMatch) {
          updateData.plan = planMatch.planType;
          updateData.sites_limit = planMatch.config.limits.sites;
          updateData.pages_per_site_limit = planMatch.config.limits.pagesPerSite;
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id);

        console.log(`[Stripe] customer.subscription.updated: updated profile ${profile.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error(`[Stripe] customer.subscription.deleted: no profile found for customer ${customerId}`);
          break;
        }

        // Reset to free plan
        await supabase
          .from('profiles')
          .update({
            plan: 'free',
            subscription_status: 'inactive',
            stripe_subscription_id: null,
            sites_limit: PLAN_CONFIGS.free.limits.sites,
            pages_per_site_limit: PLAN_CONFIGS.free.limits.pagesPerSite,
          })
          .eq('id', profile.id);

        console.log(`[Stripe] customer.subscription.deleted: reset profile ${profile.id} to free plan`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error(`[Stripe] invoice.payment_failed: no profile found for customer ${customerId}`);
          break;
        }

        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', profile.id);

        console.log(`[Stripe] invoice.payment_failed: set profile ${profile.id} to past_due`);
        break;
      }

      default:
        // Acknowledge unknown events without processing
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[POST /api/webhooks/stripe] Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
