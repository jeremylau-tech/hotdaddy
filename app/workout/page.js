"use client";
import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import {
  updateDoc,
  doc,
  getFirestore,
  collection,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { ImageModel } from "react-teachable-machine";
import { DB } from "@/firebase";

export default function Workout() {
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  // const [isDown, setIsDown] = useState(false);

  const { currentUser } = useAuth();
  const videoRef = useRef(null);
  const searchParams = useSearchParams();
  const reps = searchParams.get("reps");
  // const [currentReps, setCurrentReps] = useState(0);
  const DB = getFirestore(); // Initialize Firestore
  const router = useRouter();
  const currentRepsRef = useRef(0);
  const repsDisplayRef = useRef(null);

  let currentReps = 0;

  const updateRepsDisplay = () => {
    if (repsDisplayRef.current) {
      repsDisplayRef.current.textContent = `Current Reps: ${currentRepsRef.current} / ${reps}`;
    }
  };

  useEffect(() => {
    updateRepsDisplay();
    // Automatically start the video with specified resolution and mirrored
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
      });
  });

  if (!currentUser) {
    return null;
  }

  const closeModal = () => {
    router.back();
  };

  let isDown = false;

  // Callback function to handle prediction
  const handlePredict = (prediction) => {
    const isDownProb = (prediction[1].probability > 0.6);
    const isUpProb = (prediction[0].probability > 0.6);
    const isStopProb = (prediction[2].probability > 0.6);
    

    if (isDownProb > 0.6 && !isDown) {
      console.log("DOWN")
      isDown = true;
      console.log("Is Down State", isDown);

    } else if (isUpProb > 0.6 && isDown) {
      console.log("Counted Rep")
      currentRepsRef.current += 1;
      updateRepsDisplay();
      isDown = false;

    } else if (isStopProb > 0.6) {
      console.log("STOP")
    }
  };

  const finishWorkout = async () => {
    setShowModal(true);
    if (currentReps >= reps) {
      // Navigate to the next page
      try {
        // Reference to the user's document in Firestore
        const userDocRef = doc(collection(DB, "users"), currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // Get current number of goals
          const currentGoals = docSnap.data().numGoals || 0; // Default to 0 if undefined
          // Increment the number of goals
          const newGoals = currentGoals + 1;
          

          // Update the document
          await updateDoc(userDocRef, { numGoals: newGoals });
          console.log("Number of goals updated to:", newGoals);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error updating document: ", error);
      }

      // TODO: ADD EXERCISE ENTRY INTO TABLE
    }
  };

  return (
    <>
      <div className="relative w-full h-screen">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-20" // Make video cover full screen
          style={{ transform: "scaleX(-1)" }} // Mirror the video output
        />
        {showModal && (
          <div className="z-30 absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg">
              <h2 className="text-xl font-bold">Workout Summary</h2>
              <p>Total Reps Completed: {currentReps}</p>
              <p>Goal Reps: {reps}</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => closeModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Reps display at the top */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-center z-30">
          <div className="bg-white bg-opacity-50 rounded-full px-8 py-2">
            <h3 className="text-lg font-semibold text-black">
            <div ref={repsDisplayRef}>Current Reps: 0 / ${reps}</div>
            </h3>
          </div>
        </div>

        {/* Buttons centered at the bottom */}
        <div className="absolute bottom-0 left-0 w-full p-4 flex justify-center space-x-4 z-30">
          <button className="btn btn-primary" onClick={finishWorkout}>
            {" "}
            Finish Workout
          </button>
        </div>
        <ImageModel
          preview={false}
          size={200}
          interval={500}
          onPredict={handlePredict}
          model_url="https://teachablemachine.withgoogle.com/models/wj8bkdODz/"
        />
      </div>
    </>
  );
}
