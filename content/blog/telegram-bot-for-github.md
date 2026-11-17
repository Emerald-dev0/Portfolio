---
title: "Why my GitHub bot moved from WhatsApp to Telegram"
excerpt: "A bot that pipes GitHub events into a chat I actually read. The WhatsApp version worked; Telegram made it maintainable. Here's the trade, and the architecture underneath."
date: 2026-11-14
tags: ["Bots", "Node.js", "Telegram"]
featured: false
draft: false
cover: "/projects/telegram.webp"
---

I miss GitHub notifications constantly. Not because there are too many, because I don't live on GitHub. So I built a bot that pipes GitHub events into a chat, and shipped the first version on WhatsApp with Baileys.

It worked. Then I moved it to Telegram, and the project stopped being a liability.

> [!NOTE]
> This one is still in development. The architecture below is what's running; the polish (quiet hours, digest mode, per-repo filters) isn't done yet.

## Why chat at all

In Nigeria, WhatsApp is the default notification surface. A webhook that lands in a chat I open fifty times a day beats an email I check twice a week. The lesson generalizes: **meet yourself on the surface you already watch**, not the one you wish you watched.

So the goal was never "a WhatsApp bot". The goal was "GitHub speaks where I already am". That reframing is what made switching clients a weekend job instead of a rewrite.

## Why WhatsApp stopped being the right client

Baileys is an unofficial implementation of the WhatsApp Web protocol. That's the whole problem in one sentence:

- **It can break without warning.** WhatsApp ships, the internals move, and your socket stops authenticating.
- **The session is the product.** Lose the session file and you re-pair by scanning a QR code like it's 2016, every time you redeploy.
- **Hosting is awkward.** A long-lived socket process on a serverless platform is a bad fit; you end up paying for an always-on box to hold a connection.

None of those are fatal. All of them are maintenance debt on a tool whose only job is to save me attention.

## Why Telegram fits

Telegram's Bot API is **official, HTTP-based, and stateless**. A bot is a token you POST to. That single change deletes the entire class of problems above:

| | WhatsApp (Baileys) | Telegram Bot API |
| --- | --- | --- |
| Transport | Long-lived socket | Plain HTTPS request |
| Auth | Paired session (QR) | Static bot token |
| Deploy | Always-on process | Anywhere that can `fetch` |
| Breakage | Protocol can shift | Versioned, documented |

The interesting part isn't that Telegram is nicer. It's that the *shape of the integration* changed what I could build. A stateless sender means I can run it from a cron, a serverless function, or a webhook handler with no coordination.

## The architecture

Three moving parts, same as before:

1. a **GitHub webhook receiver** that verifies the signature,
2. a **queue** so a burst of events doesn't hammer the API,
3. a **sender** that formats one message per event type and POSTs it.

Formatters stay deliberately dumb, one function per event, so adding an event is a five-line diff:

```typescript
type Formatter = (e: GitHubEvent) => string | null;

const FORMATTERS: Record<string, Formatter> = {
  pull_request: (e) =>
    e.action === "opened"
      ? `🔀 PR #${e.number} opened, ${e.title}\n${e.url}`
      : null,
  issues: (e) =>
    e.action === "opened" ? `🐛 Issue #${e.number}, ${e.title}\n${e.url}` : null,
  release: (e) => `🚀 ${e.release.name} is out\n${e.release.url}`,
};

export async function deliver(event: GitHubEvent) {
  const format = FORMATTERS[event.kind];
  if (!format) return;                  // not interesting, say nothing
  const text = format(event);
  if (!text) return;
  await queue.push({ chatId: event.chatId, text });
}
```

The sender is one function, and that's the point:

```typescript
async function send({ chatId, text }: Job) {
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    },
  );
  if (!res.ok) throw new Error(`telegram ${res.status}`);   // let the queue retry
}
```

> [!TIP]
> Throw on failure and let the queue own retries. A sender that quietly swallows errors is how notifications go missing for a week before you notice.

## What I'd tell past me

- **Pick the official API first.** Unofficial clients buy you access today and charge you maintenance forever.
- **One formatter per event, and return `null` for noise.** Most GitHub events are not worth a message. Filtering by event type is cheaper than filtering with your eyes.
- **Idempotency at the edge.** GitHub retries webhooks. Use the delivery ID to drop duplicates before they reach the chat.
- **Keep the sender stateless.** Every hour I spent holding a socket open was an hour not spent on the actual product.

## Where it goes next

The bot is still in development: quiet hours, a daily digest, and per-repo filters are the next three things. The point of moving to an official API was to make those small features instead of structural ones.

The lesson is bigger than bots: **when a tool's job is to save you attention, it must not cost you any.** If maintaining the integration is harder than living without it, the integration is the bug.
