import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-24">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-6 inline-block rounded bg-primary px-3 py-2 text-primary-foreground">
        Go Home
      </Link>
    </div>
  );
}


