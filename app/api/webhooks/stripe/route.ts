import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, stripeId } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function applyProStatus(params: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  isPro: boolean;
}) {
  const supabase = createAdminClient();
  const payload = {
    is_pro: params.isPro,
    stripe_customer_id: params.customerId,
    stripe_subscription_id: params.isPro ? params.subscriptionId : null,
  };

  if (params.userId) {
    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", params.userId);
    if (error) throw new Error(error.message);
    return;
  }

  if (params.subscriptionId) {
    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("stripe_subscription_id", params.subscriptionId)
      .select("id");
    if (error) throw new Error(error.message);
    if (data && data.length > 0) return;
  }

  if (params.customerId) {
    const { error } = await supabase
      .from("users")
      .update({
        is_pro: params.isPro,
        stripe_subscription_id: params.isPro ? params.subscriptionId : null,
      })
      .eq("stripe_customer_id", params.customerId);
    if (error) throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook config." },
      { status: 400 },
    );
  }

  const body = await request.text();

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.metadata?.user_id ?? session.client_reference_id ?? null;
      if (session.mode === "subscription" && session.status === "complete") {
        await applyProStatus({
          userId,
          customerId: stripeId(session.customer),
          subscriptionId: stripeId(session.subscription),
          isPro: true,
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const active =
        subscription.status === "active" || subscription.status === "trialing";
      const revoked =
        subscription.status === "canceled" ||
        subscription.status === "unpaid" ||
        subscription.status === "incomplete_expired";

      if (active || revoked) {
        await applyProStatus({
          userId: subscription.metadata?.user_id ?? null,
          customerId: stripeId(subscription.customer),
          subscriptionId: subscription.id,
          isPro: active,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await applyProStatus({
        userId: subscription.metadata?.user_id ?? null,
        customerId: stripeId(subscription.customer),
        subscriptionId: subscription.id,
        isPro: false,
      });
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: unknown;
        subscription_details?: { metadata?: { user_id?: string } | null } | null;
        parent?: {
          subscription_details?: {
            subscription?: unknown;
            metadata?: { user_id?: string } | null;
          } | null;
        } | null;
      };
      const userId =
        invoice.subscription_details?.metadata?.user_id ??
        invoice.parent?.subscription_details?.metadata?.user_id ??
        null;
      await applyProStatus({
        userId,
        customerId: stripeId(invoice.customer),
        subscriptionId:
          stripeId(invoice.subscription) ??
          stripeId(invoice.parent?.subscription_details?.subscription),
        isPro: true,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook verification failed.",
      },
      { status: 400 },
    );
  }
}
