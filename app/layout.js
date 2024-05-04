import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation";
import Profile from "@/components/profile";
import AuthProvider from "./auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HotDaddy",
  description:
    "Your one-stop solution to all your competitive fitness problems",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body className={inter.className}>

        <AuthProvider>
          <header> 
          <Profile /> 
          </header>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
