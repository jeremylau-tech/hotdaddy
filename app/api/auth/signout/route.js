  import { FIREBASE_AUTH } from "@/firebase";
import { signOut } from "firebase/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request) {
  await signOut(FIREBASE_AUTH);

  return new NextResponse({}, { status: 200 });
}
