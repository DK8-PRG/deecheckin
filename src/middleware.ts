import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
});

// Admin paths that require authentication (relative to /<locale>/)
const protectedPaths = ["/admin"];
// Admin paths that are public (login/register)
const publicAdminPaths = [
  "/admin/login",
  "/admin/register",
  "/admin/auth/callback",
];

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix: /cs/admin/dashboard → /admin/dashboard
  const withoutLocale = pathname.replace(/^\/(cs|en)/, "") || "/";
  // Check if it's under /admin/ but NOT a public admin path
  const isAdmin = protectedPaths.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(p + "/"),
  );
  if (!isAdmin) return false;
  // Exclude public admin paths (login, register, callback)
  return !publicAdminPaths.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(p + "/"),
  );
}

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase auth session (updates cookies)
  const { user, supabaseResponse } = await updateSession(request);

  // 2. Run next-intl middleware for locale detection / redirect
  const intlResponse = intlMiddleware(request);

  // 3. Merge auth cookies into the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  // 4. Protect admin routes — redirect unauthenticated users to login
  const { pathname } = request.nextUrl;
  if (!user && isProtectedPath(pathname)) {
    // Detect locale from pathname or fall back to default
    const localeMatch = /^\/(cs|en)/.exec(pathname);
    const locale = localeMatch ? localeMatch[1] : defaultLocale;
    const loginUrl = new URL(`/${locale}/admin/login`, request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: ["/", "/(cs|en)/:path*"],
};
