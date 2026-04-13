# Routing Coding Standards

## Route Structure

**All application routes must live under `/dashboard`.** The root `/` route is public (e.g. landing/marketing page). Every feature page is a sub-route of `/dashboard`.

```
/                          ← public
/dashboard                 ← protected, main app entry point
/dashboard/workout/[id]    ← protected sub-page
/dashboard/...             ← all other app pages
```

Do not create top-level routes for app features (e.g. `/workouts`, `/profile`). Use `/dashboard/workouts`, `/dashboard/profile`, etc.

---

## Route Protection

**All `/dashboard` routes must be protected via Next.js middleware.** Do not implement route protection inside individual page components (e.g. no `auth()` redirects in `page.tsx`).

### Middleware Setup

Use Clerk's `clerkMiddleware` with `createRouteMatcher` to protect `/dashboard` and all sub-routes:

```ts
// middleware.ts  (project root, next to app/)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

### Rules

- **Never** redirect unauthenticated users inside a `page.tsx` or layout — middleware handles this.
- **Never** use `auth()` from `@clerk/nextjs/server` to gate rendering of an entire page — that is middleware's job. `auth()` in pages is only for reading the user's identity (e.g. `userId`).
- Unauthenticated users hitting any `/dashboard` route are automatically redirected to Clerk's sign-in page.

---

## Adding New Routes

1. Create the route directory under `app/dashboard/`.
2. No extra protection code needed in the page — middleware covers it.
3. Link to the new route using Next.js `<Link href="/dashboard/...">`.
