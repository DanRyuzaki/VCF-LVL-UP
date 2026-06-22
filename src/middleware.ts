// src/middleware.ts
//
// VCF: LVL UP! — Edge route guard (Option B: cookie-based role routing)
//
// This middleware is a UX-layer guard, not a cryptographic security boundary.
// It reads a plain (non-httpOnly, client-settable) cookie — `vcf_role` — to
// decide whether a request to a role-scoped dashboard route should be allowed
// through, redirected to the correct dashboard, or bounced to /login.
//
// The real security boundary is Firestore Security Rules (confirmed live in
// the Firebase console for this project). Firestore rules are what actually
// prevent a user from reading/writing data they aren't authorized for, no
// matter what this middleware does or doesn't catch. This file exists purely
// to stop signed-out or wrong-role users from loading a dashboard's React
// tree and seeing role-specific layout/UI before client-side guards kick in.
//
// Why cookie-based instead of Firebase Admin SDK verification (Option A):
// Verifying a Firebase ID token requires the Node.js runtime; doing so on the
// Edge runtime needs extra workarounds (jose-based JWT verification, a public
// key fetch, etc.) for marginal benefit here, since Firestore rules already
// enforce real authorization server-side. Option B keeps middleware
// Edge-compatible with zero new dependencies and is honest about what it is:
// a fast, cheap routing convenience — not a token-verified gate.
//
// Cookie contract (set in login-form.tsx, cleared in sidebar.tsx / navbar.tsx):
//   name:      vcf_role
//   value:     one of "developer" | "admin" | "organizer" | "gamer"
//   set when:  immediately after a successful login, using the role read
//              from the user's Firestore document (never a client choice)
//   lifetime:  persistent (7 days) if the user checked "Remember me" at
//              login, otherwise a session cookie — mirrors whichever
//              Firebase Auth persistence (local vs session) was set for
//              that sign-in, so the cookie and the Firebase session expire
//              together.
//   cleared:   immediately on sign-out, before/alongside auth.signOut()
//
// NOTE: This middleware intentionally has no knowledge of Firebase Auth
// session state. A cleared browser cache or a cookie deleted out-of-band
// from the Firebase session is treated identically to "signed out" — i.e.
// redirected to /login — which is the safe default.

import { NextRequest, NextResponse } from "next/server";

const ROLE_COOKIE_NAME = "vcf_role";

/** Mirrors `UserRole` from src/types/user.ts. Duplicated (not imported) so
 *  this file has zero runtime dependencies beyond next/server, keeping it
 *  safe and fast on the Edge runtime. Keep in sync with src/types/user.ts. */
type UserRole = "developer" | "admin" | "organizer" | "gamer";

const VALID_ROLES: readonly UserRole[] = ["developer", "admin", "organizer", "gamer"];

/** Route prefix → role that is allowed to access it. */
const PROTECTED_ROUTES: ReadonlyArray<{ prefix: string; role: UserRole }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/developer", role: "developer" },
  { prefix: "/organizer", role: "organizer" },
  { prefix: "/gamer", role: "gamer" },
];

const LOGIN_PATH = "/login";

function isValidRole(value: string | undefined): value is UserRole {
  return !!value && (VALID_ROLES as readonly string[]).includes(value);
}

/** Returns the matching protected-route entry for a path, if any. */
function matchProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.find(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawCookie = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const cookieRole = isValidRole(rawCookie) ? rawCookie : undefined;

  // If the cookie exists but holds garbage (tampered, stale, or malformed),
  // treat the request as signed-out rather than trusting an unrecognized
  // value — fail closed, not open.
  const isAuthenticated = cookieRole !== undefined;

  const protectedRoute = matchProtectedRoute(pathname);

  // ── Rule 3: authenticated user hits /login → redirect to their dashboard ──
  if (pathname === LOGIN_PATH && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${cookieRole}`, request.url));
  }

  // ── Public routes (/, /login, /login/reset-password, everything else
  //    outside the protected prefixes) pass through untouched. ──
  if (!protectedRoute) {
    return NextResponse.next();
  }

  // ── Rule 1: no cookie (or an invalid one) on a protected route → /login ──
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  // ── Rule 2: cookie role doesn't match the route's required role →
  //    redirect to the dashboard the cookie role actually owns. ──
  if (cookieRole !== protectedRoute.role) {
    return NextResponse.redirect(new URL(`/${cookieRole}`, request.url));
  }

  // Cookie present, valid, and matches the route's required role.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on every request EXCEPT:
     *  - Next.js internals (_next/static, _next/image)
     *  - favicon.ico
     *  - common static asset extensions
     * This keeps the middleware on the page-routing hot path only.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};