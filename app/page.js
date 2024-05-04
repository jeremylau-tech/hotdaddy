'use client'
import React, { useState, useRef, useEffect } from "react";
import { ImageModel } from 'react-teachable-machine';
import { DB } from "./firebase";
import { addDoc, collection, query, getDocs } from "firebase/firestore";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();
  const [isDay, setIsDay] = useState(true);
  const { currentUser } = useAuth();

  if (!currentUser) {
    router.push("/login");
  }
  const [timestamp, setTimestamp] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Access the user's webcam stream
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(error => {
        console.error('Error accessing webcam:', error);
      });
  }, []);

  // Function to capture the current frame of the video
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      return imageData;
    }
    return null;
  };

  

  useEffect(() => {
    fetchUserExercises();
  }, []);

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
    <div>
      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', maxWidth: '600px' }}
        />
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
          width="640"
          height="480"
        />
        <button onClick={() => {
          const imageData = captureFrame();
          // Handle the captured image data (e.g., send it to the model)
          console.log('Captured image data:', imageData);
        }}>Capture Image</button>
      </div>
      <div style={{
        backgroundColor: isDay ? 'white' : 'black',
        color: isDay ? 'black' : 'white',
        // fontSize: isNear ? '1rem' : '4rem'
      }}>
        <ImageModel
          preview={false}
          size={200}
          interval={500}
          onPredict={handlePredict}
          model_url="https://teachablemachine.withgoogle.com/models/qNic7uOOY/"
        />
      </div>
      {timestamp && <p>Last 야간 alert: {timestamp}</p>}

    
    </div>
  );
}