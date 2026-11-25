import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-narrow flex flex-1 flex-col px-4 pt-10 pb-16">
      <p className="font-price text-2xl text-awning">404</p>
      <h1 className="display-lg max-w-[18ch] pt-2">This stall isn&apos;t on the Markt</h1>
      <p className="text-lede max-w-[44ch] pt-3 text-ink/70">
        The page you followed doesn&apos;t exist, or it moved. Everything our
        shopper can pick this Friday is on the market page.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-md bg-awning px-6 text-sm font-medium text-paper transition-colors hover:bg-awning/90 focus-visible:ring-2 focus-visible:ring-awning focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
        >
          Back to the market
        </Link>
        <Link
          href="/stalls"
          className="inline-flex h-12 items-center justify-center rounded-md px-6 text-sm font-medium ring-1 ring-cobble transition-colors hover:bg-cobble/40 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
        >
          See all stalls
        </Link>
      </div>
    </div>
  );
}
