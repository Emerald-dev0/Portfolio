---
title: "TypeScript patterns I actually use in production"
excerpt: "No clever type gymnastics, just the handful of patterns that have saved me from real bugs in real codebases."
date: 2026-10-22
tags: ["TypeScript","Code"]
featured: false
draft: false
cover: "/projects/blueprint.webp"
---

I've read the type-level programming books. In production, with a deadline and a codebase that other people (future me included) have to read, I use about five patterns. They've each prevented a class of bug I used to ship regularly.

## Discriminated unions over boolean flags

The moment a type has two booleans that must stay in sync, you have a bug waiting for a tired Tuesday. A discriminated union makes the impossible states unrepresentable:

```typescript
type EmailJob =
  | { kind: "queued"; attempts: number }
  | { kind: "sent"; providerId: string }
  | { kind: "failed"; reason: string; attempts: number };

// Exhaustive switch, add a variant, TypeScript finds every site to update.
function describe(job: EmailJob): string {
  switch (job.kind) {
    case "queued": return `retrying (${job.attempts})`;
    case "sent": return `delivered: ${job.providerId}`;
    case "failed": return `gave up: ${job.reason}`;
  }
}
```

## Result types for fallible operations

Throwing for control flow is fine. Throwing for expected failures, a missing row, a declined card, buries the handling three stack frames deep. A Result makes the failure part of the type:

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function getUser(id: string): Promise<Result<User, "not-found">> {
  const user = await db.user.findUnique({ where: { id } });
  return user ? { ok: true, value: user } : { ok: false, error: "not-found" };
}

// The caller cannot forget to handle the failure case.
const res = await getUser(id);
if (!res.ok) return notFound();
```

## Const assertions for config

For config objects, `as const` turns a string into a literal type, which means typos become compile errors instead of 3 a.m. mysteries:

```typescript
const PLANS = { free: 0, pro: 12, team: 29 } as const;
type Plan = keyof typeof PLANS; // "free" | "pro" | "team"

function price(plan: Plan) {
  return PLANS[plan]; // always a number, never undefined
}
```

> [!TIP]
If a pattern needs a blog post to explain, it's probably too clever for production. The best patterns are the ones a teammate reads once and understands forever.

That's the whole list. Unions, Results, const assertions, and the discipline to reach for them before the clever stuff. TypeScript's job isn't to be impressive, it's to make the wrong thing hard to write.
