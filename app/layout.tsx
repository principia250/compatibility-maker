import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compatibility Maker",
  description: "Create and manage compatibility charts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 my-8">
          <div className="max-w-[900px] mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
