import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { FontSizeProvider } from "@/lib/font-size-context";
import { AccessibilityProvider } from "@/lib/accessibility-context";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "VCF-LVL-UP — Youth eSports Management",
  description: "Faith-Based Youth eSports Management System — Word Baptist Church, Inc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-contrast="normal">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem("vcf-lvl-up-theme");
                  var theme = savedTheme || "dark";
                  document.documentElement.setAttribute("data-theme", theme);

                  var savedContrast = localStorage.getItem("vcf-lvl-up-contrast");
                  if (savedContrast === "true") {
                    document.documentElement.setAttribute("data-contrast", "high");
                  } else {
                    document.documentElement.setAttribute("data-contrast", "normal");
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <AccessibilityProvider>
              <FontSizeProvider>
                {children}
              </FontSizeProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
