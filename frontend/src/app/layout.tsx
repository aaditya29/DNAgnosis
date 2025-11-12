import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google"; 

export const metadata: Metadata = {
  title: "DNAGnosis",
  description: "AI-powered DNA sequence analysis and insights.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({  
  subsets: ["latin"],
  variable: "--font-inter-sans", 
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>  {/* Use new variable */}
      <body>{children}</body>
    </html>
  );
}