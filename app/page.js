"use client";
import { useAuth } from "@/auth/AuthProvider";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie"
import ani1 from "./sap.json"
import ani2 from "./sap2.json"
import ani3 from "./sap3.json"
import ani4 from "./sap4.json"


export default function Home() {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reps, setReps] = useState(0);
  const router = useRouter();
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: ani3,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
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

  const handleConfirm = () => {
    setShowModal(false);
    console.log("Default reps set to:", reps);
    router.push({
      pathname: '/workout',
      query: { reps: reps },
    });
  };

  // Callback function to handle prediction
  const handlePredict = async (predictions) => {
    setIsDay(predictions[0].probability > 0.5);

    const nightPrediction = predictions.find(p => p.className === "야간");

    if (nightPrediction && nightPrediction.probability > 0.5) {
        // Get the current timestamp
        const currentDate = new Date();

        // Convert to EST
        const options = {
            timeZone: "America/Toronto",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        };
        const localTimeString = currentDate.toLocaleString("en-CA", options);
        const [datePart, timePart] = localTimeString.split(", ");
        const [year, month, day] = datePart.split("-");
        const [hour, minute, second] = timePart.split(":");
        
        const estDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        const formattedTimestamp = estDate.toISOString().replace("Z", "-05:00");

        setTimestamp(formattedTimestamp);
        console.log("Timestamp for 야간 with probability > 0.8:", formattedTimestamp);

        // Push the timestamp to Firestore
        try {
            await addDoc(collection(DB, "exercise"), {
                timestamp: formattedTimestamp,
                userId: currentUser?.uid,
            });
            console.log("Timestamp successfully added to Firestore");
        } catch (error) {
            console.error("Error adding timestamp to Firestore:", error);
        }
    }
};

  return (
    <div className="flex flex-col items-center justify-center h-screen">
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
          <p className="text-lg font-semibold mb-4">
            Enter your default number of reps:
          </p>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="input input-bordered w-full mb-4"
          />
          <button className="btn btn-primary w-full" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
      <div>
        <Lottie options = {defaultOptions} height={200} width={200} />
      </div>
    </div>
  );
}
