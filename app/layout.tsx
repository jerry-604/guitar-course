import type { Metadata } from "next";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";
import { JeremiahAI } from "@/components/jeremiah-ai/JeremiahAI";

// Display: characterful contemporary serif
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Body: readable serif, designed for long-form (Production Type)
const newsreader = Newsreader({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Mono accent: small caps labels, counters, technical
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_DESCRIPTION =
  "A free, single-instructor curriculum that takes you from your first guitar lesson to playing a complete George Strait song. Three open chords, three transitions, one real song.";

// Resolve the canonical site URL for absolute OG image links and similar.
// Priority: explicit NEXT_PUBLIC_SITE_URL → Vercel-injected VERCEL_URL →
// localhost. Without this, social-link previews would fail to find the
// auto-generated /opengraph-image.png.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Guitar Course · Beginner to George Strait",
    template: "%s · Guitar Course",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Guitar Course",
  authors: [{ name: "Jeremiah Omolewa" }],
  keywords: [
    "guitar lessons",
    "beginner guitar",
    "country guitar",
    "George Strait",
    "free guitar course",
    "open chords",
  ],
  openGraph: {
    type: "website",
    title: "Guitar Course · Beginner to George Strait",
    description: SITE_DESCRIPTION,
    siteName: "Guitar Course",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Guitar Course · Beginner to George Strait",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <body className="font-body antialiased">
        <ClerkProvider
          appearance={{
            elements: {
              // Hide Clerk branding in our UI — keeps the editorial aesthetic
              // intact. The dev-instance "Development mode" pill is a Clerk
              // platform fixture; CSS in globals.css handles what's reachable.
              footer: { display: "none" },
              footerAction: { display: "none" },
              userButtonPopoverFooter: { display: "none" },
              logoBox: { display: "none" },
            },
            layout: {
              socialButtonsPlacement: "bottom",
              showOptionalFields: false,
            },
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            storageKey="guitar-course-theme"
          >
            <Header />
            {children}
            <JeremiahAI />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
