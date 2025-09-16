import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "~/config/i18n-config";

export function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") || "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0] || "";
  if (i18n.locales.includes(preferred as any)) return preferred;
  return i18n.defaultLocale;
}

export const middleware = async (_auth: any, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );
  if (pathnameIsMissingLocale) {
    const locale = getLocale(req);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
  }
  return NextResponse.next();
};
