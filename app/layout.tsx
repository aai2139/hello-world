import type { Metadata } from "next";
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
          <p>AI makes the plan. New Yorkers make the call.</p>
        </footer>
      </body>
    </html>
  );
}
