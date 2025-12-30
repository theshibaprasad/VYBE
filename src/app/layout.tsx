import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter as requested
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VYBE - Live TV Platform",
  description: "Modern Live TV Streaming Experience",
  other: {
    "referrer": "no-referrer"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased bg-[#0f1419] text-white min-h-screen`}
      >
        <Header />
        <div className="flex pt-16 min-h-screen">
          <Sidebar />
          {/* Main Content Area */}
          <main className="flex-1 transition-all duration-300 min-w-0">
            {/* Sidebar width is dynamic, but we use md:pl-20 as base collapsed width. 
                When expanded it overlays or pushes content. 
                For this design, let's assume it overlays or we handle margin dynamically. 
                Since Sidebar component handles its own width, we need to adjust margin here if we want push behavior.
                But simplest is a fixed margin for collapsed state and overlay for expanded or let CSS grid handle it.
                Given Sidebar is `fixed`, we need padding/margin.
                The Sidebar component toggles between w-20 and w-64 on desktop. 
                Ideally, we should share that state or just use a safe margin.
                I'll use `pl-20` (80px) which matches collapsed width. 
                Expanding sidebar will overlay content or we update margin via CSS variable if we bind state to body.
                But since Sidebar is client component and Layout is server, we can't share state easily without a wrapper.
                I'll wrap content in a Client Component if needed, OR just assume collapsed margin for now and let expanded sidebar float over on top (z-40) which is cleaner for video apps.
            */}
            {/* Actually, user might want push. But "fixed" suggests overlay or fixed layout. 
               Let's stick to safe margin for collapsed state. 
               If sidebar is 64 wide (16rem = 256px), and collapsed 20 (5rem = 80px).
               The content should probably sit to the right of 5rem always.
             */}
            <div className="p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
