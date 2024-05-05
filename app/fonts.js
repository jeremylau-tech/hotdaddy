import { Inter, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";

// Font files can be colocated inside of `app`
export const poetsen = localFont({
  src: "./PoetsenOne-Regular.ttf",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});
