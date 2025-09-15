import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/layout/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ExpenseTracker | Smart Financial Insights",
  description: "Track, analyze, and master your spending with AI-powered insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex w-full">
            {/* The sidebar will be shown on medium screens and up */}
            <Sidebar />
            <main className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen">
              {/* You can add a mobile header here if needed */}
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}