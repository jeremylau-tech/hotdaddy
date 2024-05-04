import { FIREBASE_AUTH, DB } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request) {
  const { email, password, name } = request.body;

  const userCredential = await createUserWithEmailAndPassword(
    FIREBASE_AUTH,
    email,
    password
  );
  await setDoc(doc(collection(DB, "users"), email), {
    userId: userCredential.user.uid,
    email,
    name,
  });

  return new NextResponse({ user: userCredential.user }, { status: 201 });
}
