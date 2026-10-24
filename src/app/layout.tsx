import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import "./shell.css";

import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { ToastContainer } from "@/components/ToastContainer";
import { Rail } from "@/components/Rail";
import { MobileNav } from "@/components/MobileNav";
import { RouteScrollReset } from "@/components/RouteScrollReset";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { SupportWidgetClient } from "@/components/support/SupportWidgetClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildGlobalGraphSchema } from "@/lib/seo/schema";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DEFAULT_TITLE,
  SITE_DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from "@/lib/siteConfig";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
  weight: ["400", "500", "600", "700"],
});

const isNonProdEnv =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
  process.env.NEXT_PUBLIC_NOINDEX === "true";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const yandexVerification = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_VERIFICATION;

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
    canonical: SITE_URL,
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
    images: [DEFAULT_OG_IMAGE.url],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/home.webp",
  },
  manifest: "/manifest.webmanifest",
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(yandexVerification ? { yandex: yandexVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
  robots: {
    index: !isNonProdEnv,
    follow: !isNonProdEnv,
    googleBot: {
      index: !isNonProdEnv,
      follow: !isNonProdEnv,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2a0b12",
};

const globalJsonLd = buildGlobalGraphSchema();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <JsonLd data={globalJsonLd} />
        <AuthProvider>
          <AppProvider>
            <div className="frame" id="frame">
              <Sidebar />
              <main className="main">
                <Topbar />
                {children}
                <Footer />
              </main>
              <Rail />
              <ToastContainer />
            </div>
            <MobileNav />
            <SupportWidgetClient />
            <RouteScrollReset />
            <WebVitalsReporter />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
