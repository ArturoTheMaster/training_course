# Data Fetching

## Core Rules

1. **ALL data fetching MUST be done via Server Components.** Never fetch data in Client Components or Route Handlers.
2. **ALL database queries MUST go through helper functions in the `/data` directory.** Never query the database directly from a page or component.
3. **Helper functions MUST use Drizzle ORM.** Never write raw SQL.
4. **A logged-in user can ONLY access their own data.** Every query MUST be scoped to the authenticated user's ID.

---

## Server Components Only

Data fetching happens exclusively in Server Components (files without `"use client"`). This means:

- `page.tsx` and `layout.tsx` files are the primary place to fetch data — they are Server Components by default.
- Pass fetched data down as props to Client Components that need it.
- **Do NOT** use `fetch()`, `useEffect`, or SWR/React Query inside Client Components to load data from the database.
- **Do NOT** create `/app/api/...` Route Handlers for the purpose of reading data to display in the UI.

```tsx
// ✅ Correct — data fetched in a Server Component (page.tsx)
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/lib/auth";

export default async function WorkoutsPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);
  return <WorkoutList workouts={workouts} />;
}

// ❌ Wrong — fetching inside a Client Component
"use client";
useEffect(() => {
  fetch("/api/workouts").then(...);
}, []);
```

---

## `/data` Directory — Query Helpers

All database access is centralized in the `/data` directory. Each file groups queries by domain (e.g., `workouts.ts`, `exercises.ts`).

### Structure

```
/data
  workouts.ts
  exercises.ts
  ...
```

### Rules for helper functions

- Accept `userId: string` (or equivalent) as a required parameter — never rely on a global or ambient user context inside a data function.
- Always filter queries by `userId` so a user can never access another user's records.
- Use Drizzle ORM query builders exclusively — no `db.execute(sql\`...\`)` raw queries.
- Return typed results — let Drizzle infer the return type where possible.

```ts
// ✅ Correct — /data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

// ❌ Wrong — raw SQL
export async function getWorkoutsForUser(userId: string) {
  return db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);
}

// ❌ Wrong — no userId filter (exposes all users' data)
export async function getAllWorkouts() {
  return db.select().from(workouts);
}
```

---

## User Data Isolation

Every query that returns user-owned data **must** include a `where` clause filtering by `userId`. This is a security requirement, not a convention.

Before shipping any data helper:

- [ ] Does the function accept `userId` as a parameter?
- [ ] Is `userId` used in a `.where(eq(...userId...))` clause?
- [ ] Is there any code path that could return rows belonging to a different user?

The calling Server Component is responsible for obtaining the authenticated `userId` (via `auth()` or equivalent) and passing it into the helper. Data helpers themselves do not call `auth()` — they trust the `userId` they receive and apply it as a filter.
