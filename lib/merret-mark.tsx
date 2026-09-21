/** Merret produce mark — bold Friday-market tomato silhouette. */

export const MARK_COLORS = {
  produce: "#D94732",
  produceShadow: "#B83828",
  awning: "#1E5B3F",
  highlight: "#FFFFFF",
} as const;

type MerretMarkSvgProps = {
  size?: number;
};

export function MerretMarkSvg({ size = 32 }: MerretMarkSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Fat tomato body — wide bottom, shallow top notch, reads at 16px */}
      <path
        fill={MARK_COLORS.produce}
        d="M16 29.5C8.5 29.5 3.5 24 3.5 16.5 3.5 10.5 7.5 6.5 12.5 6.8 13.6 5.2 14.8 4.5 16 4.5s2.4.7 3.5 2.3c5-.3 9 4.7 9 10.2 0 7.5-5 13-12.5 13z"
      />
      {/* Paper-cut shadow on the lower curve */}
      <path
        fill={MARK_COLORS.produceShadow}
        d="M16 29.5c-5.8 0-10.2-3.6-11.8-8.5 2.8 3.8 6.8 5.8 11.8 5.8s9-2 11.8-5.8c-1.6 4.9-6 8.5-11.8 8.5z"
      />
      {/* Soft highlight — no gradients */}
      <ellipse
        cx="11.5"
        cy="14.5"
        rx="3"
        ry="1.75"
        fill={MARK_COLORS.highlight}
        opacity="0.28"
      />
      {/* Short stem */}
      <path
        fill={MARK_COLORS.awning}
        d="M15.1 4.5h1.8v3.2h-1.8z"
      />
      {/* Two simple leaves — clearer than a star calyx at favicon size */}
      <path
        fill={MARK_COLORS.awning}
        d="M16 5.2C13.2 4.8 11 6.2 10.8 8.5c1.8-.9 3.4-1.5 5.2-1.3z"
      />
      <path
        fill={MARK_COLORS.awning}
        d="M16 5.2c2.8-.4 5 1 5.2 3.3-1.8-.9-3.4-1.5-5.2-1.3z"
      />
    </svg>
  );
}
