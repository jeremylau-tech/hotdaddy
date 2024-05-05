"use client";
import { useAuth } from "@/auth/AuthProvider";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { poetsen } from "./fonts";
import FAB from "@/components/FAB";
import Lottie from "react-lottie";
import ani0 from "./sap0.json";
import ani1 from "./sap.json";
import ani2 from "./sap2.json";
import ani3 from "./sap3.json";
import ani4 from "./sap4.json";
import {
  updateDoc,
  doc,
  getFirestore,
  collection,
  setDoc,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";
import { app } from "@/firebase"; // Your Firebase app setup
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons/faArrowRightFromBracket";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const { currentUser, signout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reps, setReps] = useState(0);
  const [exercise, setExercise] = useState("Push Ups");
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

  const handleStartWorkout = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleConfirm = async () => {
    if (reps >= 1) {
      setShowModal(false);
      try {
        const userDocRef = doc(collection(DB, "users"), currentUser.uid);
        await setDoc(
          userDocRef,
          { default_reps: reps, exercise },
          { merge: true }
        );
        console.log("Default reps set to:", reps, "Exercise set to:", exercise);
        router.push(`/workout?reps=${reps}&exercise=${exercise}`);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  return (
    <main className="h-content">
      <div className="flex flex-col items-center justify-evenly h-content overflow-hidden">
        {currentUser ? (
          <>
            <h1 className="ml-16 text-primary text-5xl text-start self-center m-4">
              Get started working out!
            </h1>
            <FAB
              onClick={() =>
                document.getElementById("signoutModal").showModal()
              }
              className={"btn-ghost mt-2 mr-2"}
              position={"topRight"}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </FAB>
            <ThemeToggle />
            <div className="h-[200px] w-[200px]">
              <Lottie options={defaultOptions} height="100%" width="100%" />
            </div>
            <button className="btn btn-primary" onClick={handleStartWorkout}>
              Start Workout
            </button>
          </>
        ) : (
          <>
            <h1
              className={`text-5xl font-bold text-primary ${poetsen.className}`}
            >
              {" "}
              HotDaddy
            </h1>
            <div className="h-[200px] w-[200px]">
              <Lottie
                options={{
                  loop: false,
                  autoplay: true,
                  animationData: ani4,
                  rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                  },
                }}
                height="100%"
                width="100%"
              />
            </div>
            <Link
              href="/login"
              className="btn btn-lg btn-primary rounded-2xl mt-10"
            >
              Get Started
            </Link>
          </>
        )}
        {/* Start of Exercise Modal */}
        <div className={`modal ${showModal ? "modal-open" : ""}`}>
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleModalClose}
            >
              &times;
            </button>
            <p className="text-lg font-semibold mb-4">
              Set your exercise and rep goal:
            </p>

            <select
              className="select select-bordered w-full mb-4"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
            >
              <option value="Push Ups">Push Ups</option>
              {/* Add more options here as needed */}
            </select>

            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value))}
              min="1"
              className="input input-bordered w-full mb-4"
            />
            <button className="btn btn-primary w-full" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
        {/* End of Exercise Modal */}
        {/* Start of Signout Modal */}
        <dialog id="signoutModal" className="modal">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signout();
            }}
            className="modal-box"
          >
            <h3 className="font-bold text-lg">You are about to sign out!</h3>
            <p className="py-4">
              Are you sure you want to leave{" "}
              <span className={`${poetsen.className} text-primary font-bold`}>
                HotDaddy?
              </span>
            </p>
            <div className="w-full flex" role="group">
              <button
                type="button"
                className="btn basis-1/2 bg-error"
                onClick={() => document.getElementById("signoutModal").close()}
              >
                No
              </button>
              <button className="btn basis-1/2 bg-success" type="submit">
                Yes
              </button>
            </div>
          </form>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        {/* End of Signout Modal */}
      </div>
    </main>
  );
}
