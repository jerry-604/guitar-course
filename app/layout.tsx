import type { Metadata } from "next";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";

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

export const metadata: Metadata = {
  title: "Guitar Course — Beginner to George Strait",
  description:
    "A free, single-instructor curriculum that takes you from your first guitar lesson to playing a complete George Strait song.",
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
            enableSystem={false}
            disableTransitionOnChange
          >
            <Header />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
