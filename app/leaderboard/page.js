"use client";

import React, { useState, useEffect } from "react";
import { FIREBASE_AUTH } from "../firebase";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/auth/AuthProvider";

const GroupComponent = () => {
  const { currentUser } = useAuth();

  const [roomId, setRoomId] = useState("");
  const [action, setAction] = useState("create"); // create or join
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const firestore = getFirestore();
  if (!currentUser) {
    return null;
  }

  const handleAction = async () => {
    try {
      if (roomId.trim() === "") {
        setError("Room ID cannot be empty");
        return;
      }

      const roomDocRef = doc(collection(firestore, "group"), roomId);
      const roomDoc = await getDoc(roomDocRef);

      if (action === "create") {
        if (roomDoc.exists()) {
          setError(
            "Room ID already exists. Please choose a different ID or join the room."
          );
          setSuccess(null);
        } else {
          const userIDs = ["user1", "user2"]; // Example user IDs, this could be dynamic based on your needs
          await setDoc(roomDocRef, { user_ids: userIDs });
          setSuccess("Room created successfully!");
          setError(null);
        }
      } else if (action === "join") {
        if (!roomDoc.exists()) {
          setError(
            "Room ID does not exist. Please create a new room or join an existing one."
          );
          setSuccess(null);
        } else {
          setSuccess("Joined room successfully!");
          setError(null);
        }
      }
    } catch (error) {
      setError(error.message);
      setSuccess(null);
    }
  };

  return (
    <div>
      <div>
        <label>
          <input
            type="radio"
            value="create"
            checked={action === "create"}
            onChange={() => setAction("create")}
          />
          Create Room
        </label>
        <label>
          <input
            type="radio"
            value="join"
            checked={action === "join"}
            onChange={() => setAction("join")}
          />
          Join Room
        </label>
      </div>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room ID"
      />
      <button onClick={handleAction}>
        {action === "create" ? "Create Room" : "Join Room"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default GroupComponent;
