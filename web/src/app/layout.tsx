import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursorLoader from "@/components/CustomCursorLoader";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

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
    images: ["/images/scene/gate-1280.webp"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aditya Singh — Digital Marketing, Analytics & AI",
    description:
      "Portfolio of Aditya Singh — digital marketing, brand strategy, business analytics and AI-powered creative workflows.",
    images: ["/images/scene/gate-1280.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-ink text-parchment antialiased">
        <SmoothScroll />
        <CustomCursorLoader />
        {children}
      </body>
    </html>
  );
}
