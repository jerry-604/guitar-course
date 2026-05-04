import { ImageResponse } from "next/og";

// Next.js auto-generates favicon at this path on every request (cached).
// Editorial monogram — capital "G" in Fraunces-style serif on the brand
// cream paper background, oxblood color so it reads even at 16x16.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F1E9D6",
          color: "#8E2A26",
          fontSize: 50,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          fontStyle: "italic",
          lineHeight: 1,
          paddingBottom: 6,
        }}
      >
        G
      </div>
    ),
    { ...size },
  );
}
