import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://danryuzaki.is-a.dev"),
  title: "Dan Ryuzaki — Soon",
  description:
    "Daniel Ryuzaki Adan. Freelance software & ML engineer. Soli Deo Code. Building soon.",
  openGraph: {
    title: "Dan Ryuzaki — Soon",
    description:
      "Daniel Ryuzaki Adan. Freelance software & ML engineer. Soli Deo Code. Building soon.",
    url: "https://danryuzaki.is-a.dev",
    siteName: "danryuzaki.is-a.dev",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dan Ryuzaki — Soon",
    description: "Freelance software & ML engineer. Soli Deo Code.",
  },
  icons: {
    icon: "/favicon.ico",
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
      className={`${jetbrainsMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0b] text-[#ededec]">
        {children}
      </body>
    </html>
  );
}
