"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, verifyOtp } from "@/app/profile/actions";

export function PhoneOtpForm({ initialPhone = "" }: { initialPhone?: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function sendCode(nextPhone: string) {
    setPhone(nextPhone);
    setError(null);
    startTransition(async () => {
      const result = await requestOtp(nextPhone);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDemoCode(result.demoCode);
      setCode("");
      setStep("code");
    });
  }

  function confirmCode() {
    setError(null);
    startTransition(async () => {
      const result = await verifyOtp(phone, code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (step === "code") {
    return (
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          confirmCode();
        }}
      >
        <p className="text-sm text-ink/70">
          We sent a four-digit code to {phone.trim()}. This demo cannot send a
          real text, so the code is on the card below.
        </p>
        {demoCode ? (
          <div className="price-sign inline-block px-5 py-3">
            <p className="text-xs text-ink/55">Your code</p>
            <p className="font-display text-3xl tabular-nums tracking-[0.2em] text-ink">
              {demoCode}
            </p>
          </div>
        ) : null}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">
            Four-digit code
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={4}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="h-12 w-full rounded-md border border-cobble bg-paper px-3 text-center font-display text-2xl tabular-nums tracking-[0.4em] outline-none focus-visible:border-awning"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "otp-error" : undefined}
          />
        </label>
        {error ? (
          <p id="otp-error" className="text-sm text-awning" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || code.length !== 4}
          className="flex h-12 w-full items-center justify-center rounded-md bg-awning px-4 text-sm font-medium text-paper disabled:opacity-50"
        >
          {pending ? "Checking…" : "Confirm code"}
        </button>
        <button
          type="button"
          className="text-sm text-ink/65 underline-offset-2 hover:text-awning hover:underline"
          onClick={() => {
            setStep("phone");
            setDemoCode(null);
            setCode("");
            setError(null);
          }}
        >
          Use a different number
        </button>
      </form>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const nextPhone = String(
          new FormData(event.currentTarget).get("phone") ?? ""
        );
        sendCode(nextPhone);
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Phone number</span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          defaultValue={phone}
          placeholder="06 1234 5601"
          className="h-12 w-full rounded-md border border-cobble bg-paper px-3 text-base outline-none focus-visible:border-awning"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "otp-error" : undefined}
        />
      </label>
      <p className="text-sm text-ink/70">
        We confirm this number with a four-digit code. No password.
      </p>
      {error ? (
        <p id="otp-error" className="text-sm text-awning" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-md bg-awning px-4 text-sm font-medium text-paper disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send code"}
      </button>
    </form>
  );
}
