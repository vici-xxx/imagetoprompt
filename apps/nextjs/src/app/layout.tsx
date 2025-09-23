import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";

import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn } from "@saasfly/ui";
import { Toaster } from "@saasfly/ui/toaster";

import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ThemeProvider } from "~/components/theme-provider";
import { Providers } from "~/components/providers";
import { i18n } from "~/config/i18n-config";
import { siteConfig } from "~/config/site";

// import { Suspense } from "react";
// import { PostHogPageview } from "~/config/providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: "../styles/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Image to Prompt Generator — turn any image into high‑quality image prompts. Fast image prompt generation, prompt generator tools, and best practices for AI art.",
  keywords: [
    // Primary SEO focus
    "image to prompt",
    "image to prompt generator",
    "image prompt",
    "prompt generator",
    // Secondary/long-tail variations
    "image prompt generator",
    "generate prompts from images",
    "AI image prompt",
    // Existing tech keywords (kept for relevancy)
    "Next.js",
    "Shadcn UI",
    "SaaS",
    "Cloud Native",
  ],
  authors: [
    {
      name: "saasfly",
    },
  ],
  creator: "Saasfly",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — Image to Prompt Generator`,
    description:
      "Convert images into precise AI prompts. Powerful image prompt generator for creators and teams.",
    siteName: siteConfig.name,
  },
  icons: {
    icon: "/logo.svg",
    // shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://show.saasfly.io/"),
  // manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning translate="no">
      <head>
        <meta name="google" content="notranslate" />
        {/* Baidu Tongji */}
        <Script
          id="baidu-tongji"
          strategy="afterInteractive"
        >{`
          var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement('script');
            hm.src = 'https://hm.baidu.com/hm.js?232d18e8efd7986bc04f12ecda421116';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(hm, s);
          })();
        `}</Script>
      </head>
      {/*<Suspense>*/}
      {/*  <PostHogPageview />*/}
      {/*</Suspense>*/}
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
        )}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            {children}
            <Analytics />
            <SpeedInsights />
            <Toaster />
            <TailwindIndicator />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
