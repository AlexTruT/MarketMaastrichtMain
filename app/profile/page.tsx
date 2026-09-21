import { BuyerOrderList } from "@/components/profile/BuyerOrderList";
import { PhoneOtpForm } from "@/components/profile/PhoneOtpForm";
import { getOrdersByPhone } from "@/lib/data";
import { getBuyerSession } from "@/lib/profile-session";
import { signOut } from "./actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone: prefillPhone } = await searchParams;
  const session = await getBuyerSession();

  if (!session) {
    return (
      <div className="page-narrow space-y-6 px-4 pt-8 pb-10">
        <div>
          <h1 className="display-lg text-ink">Your orders</h1>
          <p className="text-lede max-w-[48ch] pt-3 text-ink/70">
            Confirm the number from your pickup ticket. We show a code on this
            page, then every order on that phone.
          </p>
        </div>
        <PhoneOtpForm initialPhone={prefillPhone ?? ""} />
      </div>
    );
  }

  const orders = await getOrdersByPhone(session.phone);

  return (
    <div className="page-narrow space-y-6 px-4 pt-8 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="display-lg text-ink">Your orders</h1>
          <p className="text-lede max-w-[48ch] pt-3 text-ink/70">
            Signed in with {session.display}. Open this page again on the same
            phone and the code stays skipped for a week.
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="h-11 shrink-0 rounded-md border border-cobble px-3 text-sm text-ink/80 hover:border-awning hover:text-awning"
          >
            Sign out
          </button>
        </form>
      </div>
      <BuyerOrderList orders={orders} />
    </div>
  );
}
