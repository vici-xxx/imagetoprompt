import { NextResponse } from "next/server";
import { middleware as clerkMiddleware } from "./utils/clerk";

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};

export default function middleware(req: Request) {
  const hasClerkEnv =
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !!process.env.CLERK_SECRET_KEY;
  if (!hasClerkEnv) {
    return NextResponse.next();
  }
  // @ts-expect-error - Next types differ between edge runtime wrappers
  return clerkMiddleware(req);
}
