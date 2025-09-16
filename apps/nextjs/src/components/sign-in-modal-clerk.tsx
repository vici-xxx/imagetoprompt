"use client";

import Link from "next/link";

export function SignInClerkModal() {
  return (
    <Link href="/api/auth/signin" className="hidden" aria-hidden="true">
      Sign in
    </Link>
  );
}
