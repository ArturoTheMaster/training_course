# Authentication Coding Standards

## Provider

**This app uses [Clerk](https://clerk.com/) for all authentication.** Do not introduce any other auth library (e.g. NextAuth, Auth.js, Supabase Auth, custom JWT handling).

---

## Setup

### Root Layout

`ClerkProvider` must wrap the entire app in `app/layout.tsx`. All Clerk UI components (`SignInButton`, `SignUpButton`, `UserButton`, `Show`, etc.) must be imported from `@clerk/nextjs`.

```tsx
// app/layout.tsx
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          <header>
            <Show when="signed-out">
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### Middleware

Route protection is handled by `clerkMiddleware()` in `middleware.ts`. This must remain in place so Clerk can process auth state on every request.

```ts
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

---

## Getting the Current User

### In Server Components and Pages

Use `auth()` from `@clerk/nextjs/server` to get the current user's `userId`. Always `await` it — it is async in Clerk v5+.

```tsx
// ✅ Correct — Server Component
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // pass userId to data helpers
}
```

- **Always redirect to `/sign-in`** if `userId` is `null` on a protected page.
- **Do not** use `currentUser()` when you only need the `userId` — `auth()` is cheaper as it does not make an additional network request to Clerk.

### In Client Components

Use the `useUser()` or `useAuth()` hooks from `@clerk/nextjs` for read-only access to auth state in Client Components. Never use these hooks to fetch or mutate data — data access must stay in Server Components (see [`docs/data-fetching.md`](data-fetching.md)).

```tsx
"use client";
import { useAuth } from "@clerk/nextjs";

export function NavBar() {
  const { isSignedIn } = useAuth();
  // use for conditional rendering only
}
```

---

## Route Protection Rules

| Route type | Protection method |
|---|---|
| Protected page | `auth()` + `redirect('/sign-in')` if no `userId` |
| Public page | No `auth()` call needed |
| API Route Handler | `auth()` from `@clerk/nextjs/server`, return `401` if no `userId` |

Do **not** implement manual session cookie handling, JWT verification, or any custom auth guards — Clerk middleware handles all of this.

---

## `userId` and Data Isolation

The `userId` returned by `auth()` is a Clerk user ID string (e.g. `user_2abc...`). This is the value stored in the database as the owner of all user-owned records.

- The Server Component is responsible for calling `auth()` and obtaining `userId`.
- `userId` must be passed as an explicit parameter to all `/data` helper functions — helpers never call `auth()` themselves.
- Every database query for user-owned data must be filtered by `userId`. See [`docs/data-fetching.md`](data-fetching.md) for the full data isolation rules.

```tsx
// ✅ Correct — page calls auth(), passes userId to data helper
import { auth } from '@clerk/nextjs/server';
import { getWorkoutsForUser } from '@/data/workouts';

export default async function WorkoutsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}
```

---

## What NOT to Do

- Do **not** call `auth()` inside `/data` helper functions.
- Do **not** store auth tokens or session data manually (cookies, localStorage, DB).
- Do **not** use any Clerk component or hook outside of a `ClerkProvider` tree.
- Do **not** gate routes using custom middleware logic — use `clerkMiddleware()` only.
- Do **not** import Clerk server utilities (`auth`, `currentUser`) in Client Components — they are server-only.
