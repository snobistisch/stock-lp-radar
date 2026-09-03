import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock LP Radar | Robinhood Chain",
  description: "Research dashboard for Stock Token liquidity paired with USDG and WETH.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
