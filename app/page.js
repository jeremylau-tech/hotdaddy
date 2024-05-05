"use client";
import { useAuth } from "@/auth/AuthProvider";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
import ani0 from "./sap0.json";
import ani1 from "./sap.json";
import ani2 from "./sap2.json";
import ani3 from "./sap3.json";
import ani4 from "./sap4.json";
import { updateDoc, doc, getFirestore, collection, setDoc, getDoc} from "firebase/firestore";
import { app } from "@/firebase"; // Your Firebase app setup

export default function Home() {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reps, setReps] = useState(0);
  const [selectedAnimation, setSelectedAnimation] = useState(ani0);
  const router = useRouter();
  const DB = getFirestore(); // Initialize Firestore

  const animations = [ani1, ani2, ani3, ani4];

  const queryCount = async () => {
    try {
      // Update the user's document in Firestore
      const userDocRef = doc(collection(DB, "users"), currentUser.uid);
      const goals = await getDoc(userDocRef);
      // Query the user's document in Firestore for the number of goals
      const goalsData = goals.data();
      console.log("Goals Data: ", goalsData.numGoals);

      // Determine the animation index based on goals
      const animationIndex = Math.min(goalsData.numGoals, 3);
      setSelectedAnimation(animations[animationIndex]);

      console.log("Selected Animation Playing ", animationIndex);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      queryCount();
    }
  }, [currentUser]);

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: selectedAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  if (!currentUser) {
    return null;
  }

  const handleStartWorkout = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleConfirm = async () => {
    setShowModal(false);

    try {
      // Update the user's document in Firestore
      const userDocRef = doc(collection(DB, "users"), currentUser.uid);
      await setDoc(userDocRef, { default_reps: reps }, { merge: true });
    } catch (error) {
      console.error("Error updating document: ", error);
    }

    console.log("Default reps set to:", reps);

    // Navigate to the workout page with a query parameter
    router.push(`/workout?reps=${reps}`);
  };

  const treeGrowth = async () => {
    try {
      // Update the user's document in Firestore
      const userDocRef = doc(collection(DB, "users"), currentUser.uid);
      console.log(userDocRef);
    } catch (error) {
      console.error("Error updating document: ", error);
    }

    console.log("Default reps set to:", reps);

    // Navigate to the workout page with a query parameter
    router.push(`/workout?reps=${reps}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-12">
      <div className="h-160 w-96">
        <Lottie options={defaultOptions} height="100%" width="100%" />
      </div>
      <button className="btn btn-primary" onClick={handleStartWorkout}>
        Start Workout
      </button>

      <div className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box">
          <button
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={handleModalClose}
          >
            &times;
          </button>
          <p className="text-lg font-semibold mb-4">Enter your default number of reps:</p>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value))}
            className="input input-bordered w-full mb-4"
          />
          <button className="btn btn-primary w-full" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>

  );
}
