import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELEVATE Investment Group | Premium Management Platform",
  description: "A premium, high-tech dashboard for managing investment portfolio with advanced analytics and modern UI/UX design.",
  keywords: ["investment", "portfolio management", "analytics", "business intelligence", "real estate", "delivery"],
  authors: [{ name: "ELEVATE Investment Group" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}