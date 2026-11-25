import type { Metadata } from "next";
import { LaserCursor } from "@/components/LaserCursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZenVQ Production Platform",
  description: "Next.js App Router with Silicon-Valley Precision Laser Cursor"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090B] text-zinc-50 antialiased selection:bg-[#00E599]/20">
        {/* 1-Line Drop-in Precision Laser Cursor */}
        <LaserCursor
          theme="auto"
          sparksEnabled={true}
          shockwavesEnabled={true}
          reticleEnabled={true}
          ribbonEnabled={true}
          bloomIntensity={1.0}
        />
        {children}
      </body>
    </html>
  );
}
