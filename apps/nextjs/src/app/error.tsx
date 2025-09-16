"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container py-24">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error?.message || "Unknown error"}</p>
      <button className="mt-6 rounded bg-primary px-3 py-2 text-primary-foreground" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
