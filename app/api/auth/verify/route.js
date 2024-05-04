import { FIREBASE_AUTH } from "@/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request) {
  // Doesn't work all the time, look into fixing
  // if (!FIREBASE_AUTH.currentUser) {
  //   return new NextResponse(
  //     {},
  //     {
  //       status: 401,
  //     }
  //   );
  // }
  return new NextResponse({}, { status: 200 });
}
