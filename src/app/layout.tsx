import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./shell.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ToastContainer } from "@/components/ToastContainer";
import { Rail } from "@/components/Rail";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "TITAN — پلتفرم گیمینگ و اسپورت",
  description: "بازی کن. رقابت کن. فتح کن. پلتفرم گیمینگ و مسابقات اسپورت تایتان",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the phone tab bar and app bar respect the notch / home indicator via safe-area insets.
  viewportFit: "cover",
  themeColor: "#2a0b12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
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
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
