---
title: "Building TestFlow: what a real exam backend taught me about users"
excerpt: "1,500+ questions, 1,300+ students, and a lecture timetable that does not care about my deploy schedule. The backend decisions that made TestFlow survive contact with real students."
date: 2026-11-06
tags: ["Journey","Building"]
featured: false
draft: false
---

I'm the backend developer on TestFlow, a CBT practice platform for Obafemi Awolowo University students. It now carries 1,500+ questions across 50+ courses, and over 1,300 students have practised on it.

I'm a Computer Science student. I have a lecture timetable that treats my deploy schedule as a suggestion. Here's what building for real students taught me that no tutorial could.

> [!NOTE]
> This is a personal build log, not an official product post. Numbers are from the platform's own landing page at the time of writing.

## Scope is the whole game

When you have maybe fifteen hours a week, the difference between shipping and not shipping is the feature list. My rule was simple: **if a feature doesn't make the first user say "this is useful", it doesn't exist yet.**

That meant:

- One core loop, done completely: pick a course → practise questions → see what you got wrong.
- Practice mode and timed CBT mode as two thin views over *the same* question engine.
- No admin panel for the first month. A script and the database were the admin panel.
- Landing copy written after the product worked, because copy is easier when the thing is real.

## The backend decisions that mattered

### 1. Questions are not "content", they're data with a contract

The tempting version is a giant JSON blob per course. It breaks the moment you want to know *which* question a student keeps failing. So every question has a stable id, a course, a topic, a type, options, the correct answer, and an explanation:

```typescript
type Question = {
  id: string;
  courseId: string;
  topic: string;
  prompt: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  answer: "A" | "B" | "C" | "D";
  explanation: string;      // the whole point of the product
};
```

That contract is why progress, streaks and per-topic accuracy are all just queries instead of new features.

### 2. Score on the server, always

The client never sees the answer key. A practice session sends answers up, the server grades them and returns the result *with* the explanation. It also means a student can't open devtools and give themselves a 100.

> [!WARNING]
> Shipping the answer key to the browser is the single easiest way to make a study product worthless. It's also the easiest mistake to make, because it's the shortest code path.

### 3. Index for the question the app actually asks

The hot path isn't "get all questions", it's "give me the next N questions for this course and topic that this student hasn't recently answered". Two composite indexes turned the slowest page from a few seconds into something that feels instant:

```sql
-- the practice feed
CREATE INDEX idx_q_feed ON questions (course_id, topic, id);

-- what has this student already seen?
CREATE INDEX idx_attempts_recent ON attempts (user_id, question_id, created_at DESC);
```

> [!TIP]
> Write the query you need, then index for *that*. A schema that "feels normalised" and a schema that answers your hot path in one index read are different schemas.

### 4. Explanations are part of the answer, not a nice-to-have

The promise on the landing page is "a little better, every day". That only works if a wrong answer teaches something. Explanations are returned with the grade in the same response, so the feedback loop is one round trip, not two.

### 5. Streaks are cheap if you store days, not counters

A streak counter gets corrupted the first time a timezone or a missed midnight job shows up. Storing the distinct days a student was active and deriving the streak is boring, self-healing, and correct after a timezone change.

```typescript
function streak(activeDays: string[]): number {
  const days = new Set(activeDays);
  let n = 0;
  const cursor = new Date();
  // count back from today (or yesterday, if today hasn't started yet)
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      n++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (n === 0) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      if (n > 1) break;
      break;
    } else break;
  }
  return n;
}
```

## What went wrong

- **I shipped a study plan before I shipped enough questions.** Students wanted to practise; the grand plan was scaffolding. Questions first.
- **I underestimated mobile.** Most students study on a phone in a lecture hall. Every layout decision after that has to start from a 360px screen.
- **I let a wrong assumption about my own users sit for a week.** Watching five people use it for ten minutes taught me more than a month of guessing.

## What I'd tell anyone building for students

1. **Meet the exam, not the ideal of studying.** Timed CBT practice is the feature people come for.
2. **Make the wrong answer the useful part.** Explanations are the product.
3. **Ship to five real users early.** Your friends will lie politely; a form's analytics won't.
4. **Say no with a number.** "Not this week, we're fixing question loading" is a complete answer.

TestFlow is live at [testflow.com.ng](https://testflow.com.ng). I built the exam and practice backend: question delivery, scoring, study-plan progress, and the data behind the streaks.
