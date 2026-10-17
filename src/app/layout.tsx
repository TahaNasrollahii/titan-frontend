import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import "./shell.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
  weight: ["400", "500", "600", "700"],
});
import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ToastContainer } from "@/components/ToastContainer";
import { Rail } from "@/components/Rail";
import { MobileNav } from "@/components/MobileNav";
import { RouteScrollReset } from "@/components/RouteScrollReset";

import { SupportWidgetClient } from "@/components/support/SupportWidgetClient";

import {
  SITE_URL,
  SITE_NAME,
  SITE_DEFAULT_TITLE,
  SITE_DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SOCIAL_TELEGRAM,
  SOCIAL_DISCORD,
} from "@/lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: "%s | تایتان",
  },
  description: SITE_DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [`${SITE_URL}/images/banner-hero.webp`],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/home.webp",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the phone tab bar and app bar respect the notch / home indicator via safe-area insets.
  viewportFit: "cover",
  themeColor: "#2a0b12",
};

const verifiedSocials = [SOCIAL_TELEGRAM, SOCIAL_DISCORD].filter(Boolean);

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/titan-logo.webp`,
      description: SITE_DEFAULT_DESCRIPTION,
      ...(verifiedSocials.length ? { sameAs: verifiedSocials } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DEFAULT_DESCRIPTION,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "fa-IR",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/store?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
        <AuthProvider>
          <AppProvider>
            <div className="frame" id="frame">
              <Sidebar />
              <main className="main">
                <Topbar />
                {children}
              </main>
              <Rail />
              <ToastContainer />
            </div>
            <MobileNav />
            <SupportWidgetClient />
            <RouteScrollReset />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
