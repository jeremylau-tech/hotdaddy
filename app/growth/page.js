"use client";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function Growth() {
  const router = useRouter();
  const { currentUser } = useAuth();

  if (!currentUser) {
    router.push("/login");
  }

  return <>TODO: Growth Page</>;
}
