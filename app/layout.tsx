import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock LP Radar | Robinhood Chain",
  description: "Researchdashboard voor Stock Token-liquiditeit tegen USDG en WETH.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className="dark">
      <body>{children}</body>
    </html>
  );
}
