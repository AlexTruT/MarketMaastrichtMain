import React from "react";

/**
 * The courier app is a full screen tool, not a page inside the shop.
 *
 * The root layout wraps every route in the customer header and a 640px
 * column. Rather than change that shared file, the courier screens break out
 * of it with a fixed overlay that covers the viewport, including the sticky
 * shop header at z-40.
 */
export default function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-paper">
      {children}
    </div>
  );
}
