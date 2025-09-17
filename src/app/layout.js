import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider.jsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Aura Finance | Smart Financial Insights",
  description: "Track, analyze, and master your spending with AI-powered insights.",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <main className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}