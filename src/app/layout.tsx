import type { Metadata } from "next";
import { Inter, Raleway, Poppins } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "CSS Apply",
    template: "%s | CSS Apply",
  },
  description: "CSS Apply Recruitment 101 Portal",
  icons: {
    icon: "https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/logos/Logo_CSS Apply.svg",
    shortcut: "https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/logos/Logo_CSS Apply.svg",
    apple: "https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/logos/Logo_CSS Apply.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${raleway.variable} ${poppins.variable}`}
    >
      <SessionWrapper>
        <body suppressHydrationWarning={true}>{children}</body>
      </SessionWrapper>
    </html>
  );
}
