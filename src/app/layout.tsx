import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ToastContainer } from "@/components/ToastContainer";
import { Rail } from "@/components/Rail";

export const metadata: Metadata = {
  title: "TITAN — پلتفرم گیمینگ و اسپورت",
  description: "بازی کن. رقابت کن. فتح کن. پلتفرم گیمینگ و مسابقات اسپورت تایتان",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
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
        </AppProvider>
      </body>
    </html>
  );
}

