import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Hanken_Grotesk, Space_Grotesk } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VTI Kaizen Journey | 9-Year Adventure Runner",
  description: "Chinh phục hành trình Kaizen cùng VTI qua 3 chặng đường lịch sử Hà Nội, Tokyo và Đà Nẵng. Vượt chướng ngại vật, chinh phục deadline và tích luỹ điểm thưởng.",
  keywords: "VTI, Kaizen Journey, VTI Group, D5 Delivery, Endless Runner, Game, 9 years",
  authors: [{ name: "Kaizen Delivery Squad" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakartaSans.variable} ${hankenGrotesk.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy-dark text-slate-100">
        {children}
      </body>
    </html>
  );
}
