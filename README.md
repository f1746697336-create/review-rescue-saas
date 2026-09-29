# ReviewRescue AI

Micro-SaaS for Amazon / Etsy sellers: paste a negative review, pick a tone, generate a polished English PR reply.

## Stack

- Next.js App Router + Tailwind CSS + Lucide React
- Supabase Auth + `users` credits table
- Stripe Checkout (Pro $15/mo)
- OpenAI-compatible chat API (`AI_API_URL`, default DeepSeek)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env and fill values:

```bash
cp .env.example .env.local
```

3. In Supabase SQL editor, run `supabase/schema.sql`.

4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key routes

| Path | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` `/signup` | Email/password auth |
| `/dashboard` | Generate replies (auth required) |
| `/billing` | Pricing + Stripe checkout |
| `/api/generate` | Consume credit + call AI |
| `/api/checkout` | Create Stripe Checkout session |
| `/api/webhooks/stripe` | Mark user Pro after payment |

## Credits flow

1. New auth user → trigger inserts `users` row with `credits = 3`.
2. Frontend checks credits before generate; empty credits opens Paywall.
3. `/api/generate` re-checks and decrements atomically for free users.
4. Pro users (`is_pro = true`) skip credit consumption.
