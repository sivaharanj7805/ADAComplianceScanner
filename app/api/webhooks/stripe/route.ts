import { NextRequest, NextResponse } from "next/server";

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

    // TODO: Verify signature with Stripe webhook secret and process events
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    //
    // switch (event.type) {
    //   case 'customer.subscription.created':
    //   case 'customer.subscription.updated':
    //   case 'customer.subscription.deleted':
    //     // Update profile plan/subscription status
    //     break;
    //   case 'invoice.payment_succeeded':
    //     // Confirm payment
    //     break;
    //   case 'invoice.payment_failed':
    //     // Mark subscription as past_due
    //     break;
    //   default:
    //     console.log(`[POST /api/webhooks/stripe] Unhandled event type: ${event.type}`);
    // }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Distinguish signature verification failures from other errors
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('signature') || message.includes('Signature')) {
      console.error('[POST /api/webhooks/stripe] Signature verification failed:', message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.error('[POST /api/webhooks/stripe] Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
