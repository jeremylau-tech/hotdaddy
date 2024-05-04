import { FIREBASE_AUTH } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request) {
  const data = await request.json();
  const { email, password } = data;

  const userCredential = await signInWithEmailAndPassword(
    FIREBASE_AUTH,
    email,
    password
  );

  return new NextResponse(JSON.stringify({ user: userCredential.user }), {
    status: 200,
  });
}
