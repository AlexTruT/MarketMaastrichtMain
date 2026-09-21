import { ImageResponse } from "next/og";

function Tomato({ size }: { size: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#E24B32"
          d="M16 9.5c2.8-2.3 7.2-1.4 9.6 1.8 2.8 3.9 2.9 9.1 1 13.1C24.6 28.8 20.4 31 16 31S7.4 28.8 5.4 24.4C3.5 20.4 3.6 15.2 6.4 11.3 8.8 8.1 13.2 7.2 16 9.5z"
        />
        <path
          fill="#C63A26"
          d="M5.5 22.8c2.7 5 6.7 8 10.5 8s7.8-3 10.5-8c-3.1 2.8-6.7 4-10.5 4s-7.4-1.2-10.5-4z"
        />
        <ellipse
          cx="11.4"
          cy="15.2"
          rx="3.2"
          ry="1.85"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />
        <path
          fill="#1E5B3F"
          d="M16 3.2 18.09 8.03 23.32 8.52 19.38 12 20.53 17.13 16 14.45 11.47 17.13 12.62 12 8.68 8.52 13.91 8.03Z"
        />
      </svg>
    </div>
  );
}

export async function GET() {
  return new ImageResponse(<Tomato size={158} />, {
    width: 192,
    height: 192,
  });
}
