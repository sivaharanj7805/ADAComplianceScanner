import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    if (!body) {
      return NextResponse.json(
        { error: 'Missing request body' },
        { status: 400 }
      );
    }

    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // TODO: Verify signature with Stripe webhook secret and process events
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[POST /api/webhooks/stripe] Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
