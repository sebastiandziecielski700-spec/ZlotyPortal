import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { DostawcaMotywu } from "./components/DostawcaMotywu";
import OnboardingProvider from "./components/OnboardingProvider";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Złoty Portal",
  description: "Portal edukacyjny Złoty Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${manrope.variable} font-display antialiased`}
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        <DostawcaMotywu>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </DostawcaMotywu>
      </body>
    </html>
  );
}
