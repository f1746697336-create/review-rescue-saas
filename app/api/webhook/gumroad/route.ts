import { NextResponse } from "next/server";
import {
  classifyGumroadEvent,
  flattenGumroadBody,
  gumroadEmail,
  gumroadProfileUpdate,
  type GumroadPayload,
} from "@/lib/gumroad";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 });
}

function verifySecret(request: Request) {
  const expected = process.env.GUMROAD_WEBHOOK_SECRET;
  if (!expected) return true;

  const url = new URL(request.url);
  const provided =
    url.searchParams.get("secret") ||
    request.headers.get("x-gumroad-secret") ||
    "";

  return provided === expected;
}

async function parseGumroadRequest(request: Request): Promise<GumroadPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return flattenGumroadBody(await request.json());
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    const payload: GumroadPayload = {};
    form.forEach((value, key) => {
      if (typeof value === "string" && value) payload[key] = value;
    });
    return payload;
  }

  const text = (await request.text()).trim();
  if (!text) return {};

  try {
    return flattenGumroadBody(JSON.parse(text));
  } catch {
    return flattenGumroadBody(Object.fromEntries(new URLSearchParams(text)));
  }
}

async function applyGumroadStatus(
  email: string,
  action: "activate" | "revoke",
) {
  const supabase = createAdminClient();
  const update = gumroadProfileUpdate(action);

  const { data, error } = await supabase
    .from("users")
    .update(update)
    .ilike("email", email)
    .select("id, email, is_pro, free_credits");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function POST(request: Request) {
  if (!verifySecret(request)) {
    return unauthorized();
  }

  try {
    const payload = await parseGumroadRequest(request);
    const email = gumroadEmail(payload);
    const action = classifyGumroadEvent(payload);

    if (!email) {
      return NextResponse.json(
        { error: "Missing buyer email." },
        { status: 400 },
      );
    }

    if (action === "ignore") {
      return NextResponse.json({
        received: true,
        ignored: true,
        email,
        resource_name: payload.resource_name ?? null,
      });
    }

    const users = await applyGumroadStatus(email, action);

    return NextResponse.json({
      received: true,
      action,
      email,
      matched: users.length > 0,
      users,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gumroad webhook failed.",
      },
      { status: 500 },
    );
  }
}
