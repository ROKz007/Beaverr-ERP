import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";

const heading = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });
const body = Geist({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Beaverr — Admin Portal",
  description: "Smart infrastructure for residential communities",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${heading.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
