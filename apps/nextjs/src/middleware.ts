import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "~/config/i18n-config";

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") || "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0] || "";
  const locales = new Set(i18n.locales);
  if (preferred && locales.has(preferred as (typeof i18n)["locales"][number])) {
    return preferred;
  }
  return i18n.defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.[^/]+$/)
  ) {
    return NextResponse.next();
  }

  // Bypass locale handling for API/TRPC routes
  if (pathname.startsWith("/api") || pathname.startsWith("/trpc")) {
    return NextResponse.next();
  }

  // Already has locale prefix
  const hasLocalePrefix = i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // Redirect to default/matched locale
  const locale = getLocale(request);
  const redirectURL = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(redirectURL);
}
