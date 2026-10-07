import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Camp Nomination Portal",
  description: "Submit and track student nominations for the science camp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
