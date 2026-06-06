import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Pit — Cos",
  description: "Het commandocentrum van Cos: één plek voor werk, agents en tools.",
};

/**
 * Root layout for The Pit.
 *
 * @param props - Component props.
 * @param props.children - The page content.
 * @returns The HTML document shell.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="nl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
