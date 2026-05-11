import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #0f172a 0%, #312e81 42%, #4f46e5 100%)",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontSize: 104,
            fontWeight: 800,
            color: "white",
            letterSpacing: -4,
            fontFamily:
              'ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif',
          }}
        >
          V
        </div>
      </div>
    ),
    { ...size },
  );
}
