# Auth

Auth signs a member in to the work app. It is invite-only: Clerk holds the members, and only an invited email can finish sign-up. Every other part of the app reads the session through `@internal/work/features/auth`.

## Sub-features

- provider: `AuthProvider` wraps the router in the Clerk provider when the build has `CLERK_PUBLISHABLE_KEY` (`internal/work/features/auth/provider.tsx`).
- session: `useSession()` returns `'checking' | 'signed-in' | 'signed-out'`, `useMember()` returns `{ id, name, email, imageUrl }` or null, and `useSignOut()` returns a function that forgets the font weight and signs out (`internal/work/features/auth/session.ts`).
- sign-in page: `/login` centres the mark, the h1 "Sign in to The Hack Collective" and the Clerk card. A signed-in visitor goes on to `redirect_url` or `/` (`internal/work/features/auth/page.tsx`).
- dev member: in a dev build with no publishable key, the app is signed in as "Dev member" and `/login` sends you to `/`.

## How to get to it (user POV)

1. Open any work page while signed out. The shell sends you to `/login?redirect_url=<the page>`.
2. Sign in with the email that got the invite. The app opens the page you asked for.
3. Sign out from the sidebar footer, the phone menu or the command palette.

## Driving it with agent-browser

1. Run `./c up work dev-member`. Open `http://localhost:5281/login`. Expect a redirect to `/` and "Dev member" in the sidebar footer.
2. With Clerk keys in the Environment, open `http://localhost:5281/settings` signed out. Expect `/login?redirect_url=%2Fsettings` with the mark, the h1 and the Clerk card.
3. Sign in. Expect `/settings`.
4. Call `fetch('/api/me').then(r => r.json())` in the page. Expect the member with the same id.

## Gotchas

- The publishable key is read at build time from `CLERK_PUBLISHABLE_KEY`. A production build without it throws on boot, so it never opens as the dev member.
- The Worker checks the session on every `/api` route with `CLERK_SECRET_KEY`. Its dev bypass also needs a dev build and no secret key.
- The sign-in card uses hash routing, so Clerk steps change only the hash of `/login`.
