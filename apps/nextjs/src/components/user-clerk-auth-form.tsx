"use client";

import Link from "next/link";

export function UserClerkAuthForm({
  lang,
  dict,
}: {
  lang: string;
  dict: Record<string, string>;
}) {
  return (
    <div className="grid gap-4">
      <Link href="/api/auth/signin" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
        {dict?.continue_with_github ?? "Sign in"}
      </Link>
    </div>
  );
}
