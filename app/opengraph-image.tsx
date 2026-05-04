import { ImageResponse } from "next/og";

// Open Graph + Twitter card preview image. Auto-discovered by Next.js
// metadata when this file lives at app/opengraph-image.tsx.
export const alt = "Guitar Course — beginner to George Strait";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F1E9D6",
          color: "#2A1F18",
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "70px 80px",
          position: "relative",
        }}
      >
        {/* Top hairline rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 18,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#5C4A3D",
            fontFamily: "monospace",
          }}
        >
          <span>Guitar Course</span>
          <span style={{ flex: 1, borderTop: "1px solid #C5B69E" }} />
          <span>A country track · est. 2026</span>
        </div>

        {/* Headline block */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 30,
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 600,
              lineHeight: 0.96,
              letterSpacing: "-0.035em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>From your first chord</span>
            <span>
              to your first
              <span style={{ color: "#8E2A26", fontStyle: "italic" }}>
                {" "}
                George Strait{" "}
              </span>
              song.
            </span>
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 26,
              lineHeight: 1.4,
              color: "#5C4A3D",
              maxWidth: 900,
            }}
          >
            A free, single-instructor curriculum. Three open chords, three
            transitions, one real song you can play start to finish.
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            fontSize: 16,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#5C4A3D",
            fontFamily: "monospace",
            borderTop: "1px solid #C5B69E",
            paddingTop: 20,
          }}
        >
          <span>9 lessons · 2 songs · Free forever</span>
          <span style={{ color: "#8E2A26", fontWeight: 700 }}>Signed, Jeremiah</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
