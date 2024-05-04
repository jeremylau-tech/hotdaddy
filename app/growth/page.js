"use client";
import { useAuth } from "@/auth/AuthProvider";

export default function Growth() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return <>TODO: Growth Page</>;
}
