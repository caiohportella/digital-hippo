import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn, constructMetadata } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn("relative h-full antialiased bg-white dark:bg-[#796C4A]", inter.className)}
      >
        <main className="relative flex flex-col min-h-screen">
          <Providers>
            <Navbar />
            <Toaster position="bottom-center" expand={false} richColors />;
            <div className="flex-grow flex-1">{children}</div>
          </Providers>
        </main>
      </body>
    </html>
  );
}
