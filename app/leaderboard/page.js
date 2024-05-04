"use client";

import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  query,
  setDoc,
  getDoc,
  getDocs
} from "firebase/firestore";
import { useAuth } from "@/auth/AuthProvider";
import {firestore} from "@/firebase";
import { useRouter } from "next/navigation";
// import { getFirestore } from "firebase/firestore"; // adjust the path as needed

const GroupComponent = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [userExercises, setUserExercises] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [action, setAction] = useState("create"); // create or join
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const firestore = getFirestore();

  const fetchUserExercises = async () => {
    try {
      const exerciseCollection = collection(firestore, "exercise");
      const exerciseQuery = query(exerciseCollection);
      const exerciseSnapshot = await getDocs(exerciseQuery);

      // Count exercises for each user
      const exerciseCounts = {};
      exerciseSnapshot.forEach((doc) => {
        const data = doc.data();
        const userId = data.userId;

        if (userId in exerciseCounts) {
          exerciseCounts[userId] += 1;
        } else {
          exerciseCounts[userId] = 1;
        }
      });

      // Convert to an array of objects and sort in ascending order
      const exerciseArray = Object.keys(exerciseCounts).map((userId) => ({
        userId,
        count: exerciseCounts[userId],
      }));

      exerciseArray.sort((a, b) => a.count - b.count);

      // Update state with sorted data
      setUserExercises(exerciseArray);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserExercises();
    } else {
      router.push("/login");
    }
  }, [currentUser]);

  const handleAction = async () => {
    try {
        if (roomId.trim() === "") {
            setError("Room ID cannot be empty");
            return;
        }

        const userId = currentUser?.uid;
        const roomDocRef = doc(collection(firestore, "group"), roomId);
        const roomDoc = await getDoc(roomDocRef);
        const userDocRef = doc(collection(firestore, "users"));
        
        const userDoc = await getDoc(userDocRef);
 
        if (action === "create") {
            if (roomDoc.exists()) {
                setError("Room ID already exists. Please choose a different ID or join the room.");
                setSuccess(null);
            } else {
                // Create a new room with the current user
                await setDoc(roomDocRef, { user_ids: [userId] });

                // Add the room to the user's record
                await setDoc(userDocRef, { room: roomId }, { merge: true });

                setSuccess("Room created successfully!");
                setError(null);
            }
            
        } else if (action === "join") {
            if (!roomDoc.exists()) {
                setError("Room ID does not exist. Please create a new room or join an existing one.");
                setSuccess(null);
            } else {
                // Update the room to include the current user
                const userIds = roomDoc.data().user_ids || [];
                if (!userIds.includes(userId)) {
                    userIds.push(userId);
                    await setDoc(roomDocRef, { user_ids: userIds }, { merge: true });
                }

                // Add the room to the user's record
                await setDoc(userDocRef, { room: roomId }, { merge: true });

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

      <div>
        <h2>Exercise Rankings</h2>
        {userExercises.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Total Exercises</th>
              </tr>
            </thead>
            <tbody>
              {userExercises.map(({ userId, count }) => (
                <tr key={userId}>
                  <td>{userId}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No exercise data available.</p>
        )}
      </div>
    </div>
  );
};

export default GroupComponent;
