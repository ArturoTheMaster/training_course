# Data Mutation

## Core Rules

1. **ALL data mutations MUST go through helper functions in the `/data` directory.** Never call the database directly from a Server Action or component.
2. **Helper functions MUST use Drizzle ORM.** Never write raw SQL.
3. **ALL data mutations MUST be performed via Server Actions** defined in colocated `actions.ts` files.
4. **Server Action parameters MUST be typed.** Never use `FormData` as a parameter type.
5. **ALL Server Actions MUST validate their arguments using Zod** before performing any mutation.

---

## `/data` Directory — Mutation Helpers

Mutation helpers live alongside query helpers in the `/data` directory, grouped by domain (e.g., `workouts.ts`, `exercises.ts`).

### Rules for mutation helpers

- Accept `userId: string` as a required parameter — never rely on ambient user context.
- Always scope writes to the authenticated user's ID (e.g. insert with `userId`, update/delete with a `where` clause filtering by both record ID and `userId`).
- Use Drizzle ORM query builders exclusively — no `db.execute(sql\`...\`)`.
- Return the mutated record(s) where useful — let Drizzle infer the return type.

```ts
// ✅ Correct — /data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

// ❌ Wrong — raw SQL
export async function createWorkout(userId: string, name: string) {
  return db.execute(sql`INSERT INTO workouts (user_id, name) VALUES (${userId}, ${name})`);
}

// ❌ Wrong — no userId scope on delete (any user's record could be deleted)
export async function deleteWorkout(workoutId: string) {
  await db.delete(workouts).where(eq(workouts.id, workoutId));
}
```

---

## Server Actions — `actions.ts`

All Server Actions are defined in `actions.ts` files colocated with the route or feature they belong to.

### File placement

```
app/
  workouts/
    page.tsx
    actions.ts       ← Server Actions for this route
    new/
      page.tsx
      actions.ts     ← Server Actions for this sub-route
```

### Rules for Server Actions

- Mark the file with `"use server"` at the top.
- Each action function must have fully typed parameters — **never** `FormData`.
- Validate all parameters with a Zod schema before touching the database.
- Obtain the authenticated `userId` inside the action via `auth()` — never accept `userId` as a caller-supplied parameter.
- Call `/data` helpers to perform the actual mutation — never call `db` directly.
- Return a typed result object (e.g. `{ success: true, data: workout }` or `{ success: false, error: string }`) so the caller can handle outcomes.

```ts
// ✅ Correct — app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name: string;
  date: Date;
}) {
  const session = await auth();

  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const workout = await createWorkout(session.user.id, parsed.data.name, parsed.data.date);
  return { success: true, data: workout };
}

// ❌ Wrong — FormData parameter
export async function createWorkoutAction(formData: FormData) { ... }

// ❌ Wrong — no Zod validation
export async function createWorkoutAction(params: { name: string; date: Date }) {
  const session = await auth();
  const workout = await createWorkout(session.user.id, params.name, params.date);
  return workout;
}

// ❌ Wrong — calling db directly instead of a /data helper
export async function createWorkoutAction(params: { name: string; date: Date }) {
  const session = await auth();
  await db.insert(workouts).values({ ...params, userId: session.user.id });
}
```

---

## Checklist

Before shipping any mutation:

- [ ] Does the `/data` helper accept `userId` and scope the write to that user?
- [ ] Does the `/data` helper use Drizzle ORM (no raw SQL)?
- [ ] Is the Server Action defined in a colocated `actions.ts` file with `"use server"`?
- [ ] Are all action parameters typed (no `FormData`)?
- [ ] Does the action validate params with Zod before mutating?
- [ ] Does the action obtain `userId` from `auth()` (not from the caller)?
- [ ] Does the action delegate to a `/data` helper rather than calling `db` directly?
