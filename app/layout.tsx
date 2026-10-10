import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import SiteHeader from "@/app/site-header";

export const metadata: Metadata = {
  title: {
    default: "NYC Sidequests",
    template: "%s · NYC Sidequests",
  },
  description: "AI-planned New York micro-adventures, rated by the community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
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
