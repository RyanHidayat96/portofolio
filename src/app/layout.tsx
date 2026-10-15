import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getAbsoluteUrl, siteConfig } from "@/config/site";
import { StructuredData } from "./StructuredData";
import "./globals.css";

const portfolioSans = localFont({
  src: "./fonts/vt323-latin.woff2",
  variable: "--font-portfolio-sans",
  display: "swap",
  fallback: ["VT323", "Courier New", "Courier", "monospace"]
});

const portfolioMono = localFont({
  src: "./fonts/vt323-latin.woff2",
  variable: "--font-portfolio-mono",
  display: "swap",
  fallback: ["VT323", "Courier New", "Courier", "monospace"]
});

export const metadata: Metadata = {
  metadataBase: siteConfig.siteUrl,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.ownerName }],
  creator: siteConfig.ownerName,
  publisher: siteConfig.ownerName,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg?v=retro-amber-1",
        type: "image/svg+xml"
      },
      {
        url: "/icon",
        type: "image/png",
        sizes: "32x32"
      }
    ],
    apple: [
      {
        url: "/apple-icon",
        type: "image/png",
        sizes: "180x180"
      }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/portfolio-mark.svg?v=retro-amber-1"
      }
    ]
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [
      {
        url: siteConfig.ogImagePath,
        width: 1200,
        height: 630,
        alt: `${siteConfig.ownerName} portfolio preview`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [getAbsoluteUrl(siteConfig.twitterImagePath)]
  },
  category: "technology"
};

export const viewport: Viewport = {
  themeColor: "#0b0703",
  colorScheme: "dark"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" className={`${portfolioSans.variable} ${portfolioMono.variable}`}>
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
