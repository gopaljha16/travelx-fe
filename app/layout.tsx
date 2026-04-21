import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { WishlistProvider } from "@/context/WishlistContext";
import AuthModal from "@/components/LoginModal";
import ForcePasswordChangeModal from "@/components/ForcePasswordChangeModal";

export const metadata: Metadata = {
  title: "TravelX - Your Digital Concierge",
  description: "Find and book hotels and buses across India",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`font-body transition-colors duration-500`}>
        <ThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <main className="flex-1 pt-20">
                {children}
              </main>
              <AuthModal />
              <ForcePasswordChangeModal />
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
