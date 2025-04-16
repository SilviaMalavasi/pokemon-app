import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "../styles/base/reset.scss";
import "../styles/base/media-queries.scss";
import "../styles/base/variables.scss";
import "../styles/base/mixins.scss";
import "../styles/base/typography.scss";

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
});

export const metadata: Metadata = {
  title: "Pokeomn App",
  description: "Pokemon App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${redHatDisplay.variable}`}>{children}</body>
    </html>
  );
}
