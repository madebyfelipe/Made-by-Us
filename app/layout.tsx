import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Made by Felipe",
  description: "Sistema interno de produção de conteúdo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Inline script runs before paint — prevents theme flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)})()` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <AppHeader />
          <div className="flex flex-1 flex-col pt-14">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
