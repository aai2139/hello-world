import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import SiteHeader from "@/app/site-header";

const sans = Nunito({ subsets: ["latin"], variable: "--font-playful" });

export const metadata: Metadata = {
  title: {
    default: "NYC Sidequests",
    template: "%s · NYC Sidequests",
  },
  description: "AI-planned New York micro-adventures, rated by the community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <span>NYC Sidequests</span>
        </footer>
      </body>
    </html>
  );
}
