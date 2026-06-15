import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eFaith Connect — Youth eSports Management",
  description: "Faith-Based Youth eSports Management System — Word Baptist Church, Inc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
