"use client";
import "./globals.css";
import { Poppins as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";

import AsyncLayoutDynamic from "@/containers/async-layout-dynamic";

// export const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });
export const fontSans = FontSans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`h-full bg-[#111] font-sans antialiased ${fontSans.className}`}
      >
        <AsyncLayoutDynamic>{children}</AsyncLayoutDynamic>
      </body>
    </html>
  );
}
