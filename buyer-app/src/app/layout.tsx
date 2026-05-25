import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildNow Buyer",
  description: "Buyer application",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/buildnow-logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
    apple: "/buildnow-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-[#FFF4E8] text-stone-900">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
