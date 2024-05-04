'use client'
import React, { useState, useRef, useEffect } from "react";
import { ImageModel } from 'react-teachable-machine';
import { DB } from "./firebase";
import { addDoc, collection } from "firebase/firestore";

export default function Home() {
  const [isDay, setIsDay] = useState(true);
  const [isNear, setIsNear] = useState(false);
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

  // Callback function to handle prediction
  const handlePredict = async (predictions) => {
    setIsDay(predictions[0].probability > 0.5);
    setIsNear(predictions[0].probability > 0.5);

    const nightPrediction = predictions.find(p => p.className === "Push-up: Down");
    if (nightPrediction && nightPrediction.probability > 0.5) {
      const currentTimestamp = new Date().toISOString();
      setTimestamp(currentTimestamp);
      console.log("Timestamp for 야간 with probability > 0.8:", currentTimestamp);

      // Push the timestamp to Firestore
      try {
        await addDoc(collection(DB, "exercise123"), {
          timestamp: currentTimestamp
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
        fontSize: isNear ? '1rem' : '4rem'
      }}>
        <ImageModel
          preview={false}
          size={200}
          interval={500}
          onPredict={handlePredict}
          model_url="https://teachablemachine.withgoogle.com/models/Hg31uICu-/"
        />
      </div>
      {timestamp && <p>Last 야간 alert: {timestamp}</p>}
    </div>
  );
}