---
title: "Building Calder: why I started a developer-first email API"
excerpt: "Every project I shipped needed transactional email, and every time I wired up a provider I rebuilt the same three things. Calder is my attempt to build them once, properly."
date: 2026-11-10
tags: ["Building","TypeScript","APIs"]
featured: true
draft: false
---

Calder started as an annoyance. Every project I shipped needed transactional email, password resets, receipts, notifications, and every time I wired up a provider I ended up rebuilding the same three things: templates, delivery tracking, and a dashboard that tells me what actually happened to the email I sent.


## Email as an afterthought

Email is the only feature users judge by its absence. A broken checkout page gets reported. A password reset that never arrives just becomes a user who never comes back. Yet in most codebases email is the last thing wired up, usually with a provider SDK copy-pasted from a tutorial and a prayer.

I wanted the opposite: email as a first-class primitive, designed the way I'd design any other API. One call in, a predictable event stream out.

## The first primitive

Calder's first primitive is a single POST: a template, a recipient, and variables. Everything else, rendering, sending, retries, webhooks, hangs off that one shape.

The system behind it is deliberately boring, too: an API app, a dashboard app, an async worker for sending and retries, and shared packages for the database, queue, providers and observability. Example `curl` first, so nothing depends on a published SDK:

```bash
curl -X POST https://api.calder.dev/v1/emails \
  -H "Authorization: Bearer $CALDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "password-reset",
    "to": "user@example.com",
    "variables": { "name": "Ada", "resetUrl": "https://…" }
  }'
```

One call. Rendering, retries and delivery events hang off it, and the events come back as webhooks, `sent`, `delivered`, `bounced`, `complained`.

> [!TIP]
Start with the boring primitive. If the core call feels inevitable, the rest of the product designs itself.

## What I learned

- Idempotency keys are not optional. Retries happen; double-sending a password reset is a bug users can see.
- Webhooks need signatures and replay protection from day one, retrofitting trust is painful.
- The dashboard is the product. Developers don't buy email sending; they buy knowing what happened.
- TypeScript end to end pays for itself the first time a template variable changes shape.

## Where it honestly stands

Calder is not "done", and I'd rather tell you that than pretend:

- The API, dashboard, durable queue, drain loop, worker and SES integration are implemented and were manually verified end to end.
- Billing isn't configured yet.
- The SDK source exists, but I'm not claiming a published package, the HTTP quickstart is the path that works today.
- SMTP is specified, not deployed.

> [!NOTE]
> When your README has a "launch availability" section, keep it honest. The fastest way to lose a developer's trust is a feature list that's really a roadmap.

The bet is settled though: email deserves the same engineering respect as payments. Build it once, build it properly.
