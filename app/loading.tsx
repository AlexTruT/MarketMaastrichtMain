export default function Loading() {
  return (
    <div className="page-enter page-narrow space-y-4 px-4 pt-8 pb-10" aria-hidden>
      <div className="h-9 w-48 animate-pulse rounded bg-cobble" />
      <div className="h-4 w-full max-w-[36ch] animate-pulse rounded bg-cobble/70" />
      <div className="h-4 w-3/4 max-w-[28ch] animate-pulse rounded bg-cobble/70" />
      <div className="mt-6 space-y-3">
        <div className="h-16 animate-pulse rounded bg-cobble/60" />
        <div className="h-16 animate-pulse rounded bg-cobble/60" />
        <div className="h-16 animate-pulse rounded bg-cobble/60" />
      </div>
    </div>
  );
}
