import { FIREBASE_AUTH, DB } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request) {
  const data = await request.json();
  const { email, password, name } = data;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );
    const userId = userCredential.user.uid;
    await setDoc(doc(collection(DB, "users"), userId), {
      userId: userCredential.user.uid,
      email,
      name,
    });
    return new NextResponse(JSON.stringify({ user: userCredential.user }), {
      status: 201,
    });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: err }), { status: 409 });
  }
}
