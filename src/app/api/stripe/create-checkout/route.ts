import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

const PRICE_MAP: Record<string, string> = {
  // Subscriptions (legacy plan names)
  pro: process.env.STRIPE_PRO_PRICE_ID ?? "",
  business: process.env.STRIPE_BUSINESS_PRICE_ID ?? "",
  // One-time credit packs
  price_starter_pack: process.env.STRIPE_STARTER_PACK_PRICE_ID ?? "price_starter_pack",
  price_pro_export: process.env.STRIPE_PRO_EXPORT_PRICE_ID ?? "price_pro_export",
  price_author_suite: process.env.STRIPE_AUTHOR_SUITE_PRICE_ID ?? "price_author_suite",
  price_marketing_suite: process.env.STRIPE_MARKETING_SUITE_PRICE_ID ?? "price_marketing_suite",
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Support both old { plan } format and new { priceId, mode } format
    let priceId: string;
    let mode: "subscription" | "payment";

    if (body.priceId && body.mode) {
      // New format
      priceId = PRICE_MAP[body.priceId] || body.priceId;
      mode = body.mode;
    } else if (body.plan) {
      // Legacy format
      const legacyPriceId = PRICE_MAP[body.plan];
      if (!legacyPriceId) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      priceId = legacyPriceId;
      mode = "subscription";
    } else {
      return NextResponse.json({ error: "Missing priceId or plan" }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json({ error: "Price ID not configured" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        price_id: priceId,
        mode,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
