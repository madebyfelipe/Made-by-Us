import type { Metadata } from "next";
import { Providers } from "./providers";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Made by Felipe",
  description: "Sistema interno de produção de conteúdo",
  icons: {
    icon: "/logo-white.png",
  },
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
      className="h-full antialiased"
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
