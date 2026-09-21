import { BuyerOrderList } from "@/components/profile/BuyerOrderList";
import { PhoneOtpForm } from "@/components/profile/PhoneOtpForm";
import { getOrdersByPhone } from "@/lib/data";
import { getBuyerSession } from "@/lib/profile-session";
import { signOut } from "./actions";

function HowItWorksPanel() {
  return (
    <aside className="hidden rounded-xl bg-cobble/35 p-6 lg:block">
      <h2 className="display-md text-ink">How it works</h2>
      <ol className="mt-5 flex flex-col gap-4">
        {[
          "Enter your number",
          "Enter the 4-digit code",
          "See every order placed with that number",
        ].map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-awning text-xs font-semibold text-paper tabular-nums">
              {i + 1}
            </span>
            <span className="text-lede pt-0.5 text-ink/80">{step}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone: prefillPhone } = await searchParams;
  const session = await getBuyerSession();

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-[40rem] px-4 pt-8 pb-10 lg:max-w-[75rem]">
        <div className="lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="space-y-6">
            <div>
              <h1 className="display-lg text-ink">Your orders</h1>
              <p className="text-lede max-w-[48ch] pt-3 text-ink/70">
                See your orders. Enter the phone number you used at checkout and
                we&apos;ll send you a four-digit code.
              </p>
            </div>
            <PhoneOtpForm initialPhone={prefillPhone ?? ""} />
          </div>
          <HowItWorksPanel />
        </div>
      </div>
    );
  }

  const orders = await getOrdersByPhone(session.phone);

  return (
    <div className="mx-auto w-full max-w-[40rem] space-y-6 px-4 pt-8 pb-10 lg:max-w-[75rem]">
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="display-lg text-ink">Your orders</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-ink/55 underline-offset-2 hover:text-awning hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
        <p className="text-lede max-w-[48ch] text-ink/70">
          Signed in with {session.display}. Open this page again on the same
          phone and the code stays skipped for a week.
        </p>
      </div>
      <BuyerOrderList orders={orders} />
    </div>
  );
}
