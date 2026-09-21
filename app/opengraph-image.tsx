import { ImageResponse } from "next/og";

export const alt = "Merret — You pick, we deliver";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#1E5B3F",
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Merret
          </div>
          <div
            style={{
              display: "flex",
              background: "#F7E84B",
              color: "#161616",
              fontSize: 28,
              fontWeight: 700,
              padding: "10px 18px",
              transform: "rotate(-2deg)",
            }}
          >
            Friday market
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              color: "#161616",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            You pick, we deliver
          </div>
          <div
            style={{
              display: "flex",
              color: "#161616",
              fontSize: 32,
              opacity: 0.7,
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            Order from the Maastricht Friday market. Our shopper walks the
            stalls; couriers bring it to you.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#1E5B3F",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          merret.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
