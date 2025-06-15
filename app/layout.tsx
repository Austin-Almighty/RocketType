import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { unstable_ViewTransition as ViewTransition } from "react";

import { GameProvider } from "./_lib/gameContext";
import { UserProvider } from "./_lib/userContext";

import Header from "./_components/Header";
import Footer from "./_components/Footer";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

// const roboto = Roboto({
//   variable: "--font-roboto",
//   subsets: ["latin"],
// });
const JetBrainsMono = JetBrains_Mono({
  variable: "--font-JetBrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RocketType",
  description: "Type Away at your Heart's Content!",
  icons: {
    icon: "/favicon.svg"
  }
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

      <html lang="en" className={JetBrainsMono.className} data-theme="sunset">
        <body className="min-h-dvh flex flex-col">
          <ViewTransition name="page">
            <UserProvider>
              <GameProvider>
                <Header>
                </Header>
                <main className="flex-1 bg-base-100">
                {children}
                </main>
                <Footer>
                </Footer>
              </GameProvider>
            </UserProvider>
          </ViewTransition>
        </body>
      </html>

  );
}

