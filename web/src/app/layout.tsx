import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://inkofjatayu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Aditya Singh — Digital Marketing, Analytics & AI",
  description:
    "Portfolio of Aditya Singh — digital marketing, brand strategy, business analytics and AI-powered creative workflows.",
  keywords: [
    "Aditya Singh",
    "InkOfJatayu",
    "Digital Marketing",
    "Business Analytics",
    "Brand Strategy",
    "AI Creative Technology",
    "Power BI",
  ],
  authors: [{ name: "Aditya Singh" }],
  openGraph: {
    title: "Aditya Singh — Digital Marketing, Analytics & AI",
    description:
      "Portfolio of Aditya Singh — digital marketing, brand strategy, business analytics and AI-powered creative workflows.",
    url: siteUrl,
    siteName: "InkOfJatayu",
    images: ["/assets/hero-1280.webp"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aditya Singh — Digital Marketing, Analytics & AI",
    description:
      "Portfolio of Aditya Singh — digital marketing, brand strategy, business analytics and AI-powered creative workflows.",
    images: ["/assets/hero-1280.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
