"use client";
import { useAuth } from "@/auth/AuthProvider";
import Link from "next/link";

export default function Home() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
      <Link href="/workout">
          Start Workout
      </Link>
    );
}
