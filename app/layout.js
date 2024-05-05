import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation";
import Profile from "@/components/profile";
import AuthProvider from "./auth/AuthProvider";
import { icon } from "@fortawesome/fontawesome-svg-core";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HotDaddy",
  description:
    "Your one-stop solution to all your competitive fitness problems",
  icon: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?" type="image/x-icon" />
      </head>
      <body
        className={`${inter.className} bg-base-100 h-screen w-screen overflow-hidden`}
      >
        <AuthProvider>
          {children}
          <Navbar />
        </AuthProvider>
      </body>
    </html>
  );
}
