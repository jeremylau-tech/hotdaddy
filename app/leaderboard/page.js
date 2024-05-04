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
    const [roomExercises, setRoomExercises] = useState([]); // ADDED: State for room exercises
    const [roomId, setRoomId] = useState(""); // ADDED: Room ID state
    const [action, setAction] = useState("create"); // create or join
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
    const [isRoomView, setIsRoomView] = useState(false); // false for universal, true for room-based

    const roomIds = ['123456', '1234567']; // Example room IDs

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

        // Fetch user names from "users" collection
        const userDetailsPromises = Object.keys(exerciseCounts).map(async (userId) => {
          const userDocRef = doc(firestore, "users", userId);
          const userDoc = await getDoc(userDocRef);
          const userName = userDoc.exists() ? userDoc.data().name : "Unknown";
          return {
              userId,
              userName,
              count: exerciseCounts[userId],
          };
      });

         // Resolve all promises
         const userDetails = await Promise.all(userDetailsPromises);
         userDetails.sort((a, b) => a.count - b.count);
 

        // Update state with sorted data
        setUserExercises(userDetails);
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

    const handleNextRoom = () => {
      let nextIndex = currentRoomIndex + 1;
      if (nextIndex >= roomIds.length) {
        nextIndex = 0; // Loop back to the first index
      }
      setCurrentRoomIndex(nextIndex);
      setRoomId(roomIds[nextIndex]);
      filterByRoom(roomIds[nextIndex]);
      setIsRoomView(true); // Enable room view only when navigating
    };
    
    const handlePreviousRoom = () => {
      let prevIndex = currentRoomIndex - 1;
      if (prevIndex < 0) {
        prevIndex = roomIds.length - 1; // Loop to the last index
        setIsRoomView(false); // Disable room view and show global view when navigating back past the first room
        setCurrentRoomIndex(-1); // Reset room index to show no room selected
      } else {
        setCurrentRoomIndex(prevIndex);
        setRoomId(roomIds[prevIndex]);
        filterByRoom(roomIds[prevIndex]);
        setIsRoomView(true);
      }
    };
    
  const filterByRoom = async (roomId) => {
    try {
        const roomDocRef = doc(firestore, "room", roomId);
        const roomDoc = await getDoc(roomDocRef);

        if (!roomDoc.exists()) {
            setError(`Room ID ${roomId} does not exist.`);
            setRoomExercises([]);
            return;
        }

        const roomData = roomDoc.data();
        const userIdsInRoom = roomData.user_ids || [];

        const exercisesPromises = userIdsInRoom.map(async userId => {
            const userDocRef = doc(firestore, "users", userId);
            const userDoc = await getDoc(userDocRef);
            const userName = userDoc.exists() ? userDoc.data().name : "Unknown";

            // Find exercise count for the user
            const exerciseCount = userExercises.find(exercise => exercise.userId === userId)?.count || 0;
            return { userName, count: exerciseCount };
        });

        const exercisesDetails = await Promise.all(exercisesPromises);
        setRoomExercises(exercisesDetails); // Update room-based exercises
        setError(null);
        setSuccess(`Displaying exercises for room ID ${roomId}.`);
    } catch (error) {
        console.error("Error fetching exercises for room:", error);
        setError("Error fetching exercises for room.");
        setRoomExercises([]);
        setSuccess(null);
    }
};

    useEffect(() => {
      if (currentUser) {
        fetchUserExercises();
      } else {
        router.push("/login");
      }
    }, [currentUser]);
    
    // UI elements

    const handleAction = async () => {
      try {
          if (roomId.trim() === "") {
              setError("Room ID cannot be empty");
              return;
          }

          const userId = currentUser?.uid;
          const roomDocRef = doc(collection(firestore, "room"), roomId);
          const roomDoc = await getDoc(roomDocRef);
          const userDocRef = doc(collection(firestore, "users"), userId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data() || {}; // Handle case where no data exists
          let userRooms = userData.room || [];  

          if (action === "create") {
              if (roomDoc.exists()) {
                  setError("Room ID already exists. Please choose a different ID or join the room.");
                  setSuccess(null);
              } else {
                  // Create a new room with the current user
                  await setDoc(roomDocRef, { user_ids: [userId] });

                  // Add the room to the user's record
                  userRooms.push(roomId);
                  await setDoc(userDocRef, { room: userRooms }, { merge: true });

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
                  if (!userRooms.includes(roomId)) {
                      userRooms.push(roomId);
                  }
                  await setDoc(userDocRef, { room: userRooms }, { merge: true });

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
<div className="flex items-center justify-center">
    <button onClick={handlePreviousRoom} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l">
      &lt;
    </button>
    <span>{roomId}</span>
    <button onClick={handleNextRoom} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r">
      &gt;
    </button>
  </div>

    {/* Universal Table View */}
    {!isRoomView && (
        <div>
        <div className="font-bold text-center pt-8">
        <text className="py-8 text-center text-bold text-3xl text-blue-900 uppercase tracking-wider">
          Global 
        <text className="text-yellow-400"> Hot </text> 
        Daddies 👑
        </text>
        </div>
        {userExercises.length > 0 ? (
          <table className="table table-zebra table-auto text-center">
            <thead>
            <tr>
              <th className="px-6 py-3 text-lg font-medium text-blue-900 uppercase tracking-wider w-1/12">
                  Rank
              </th>
              <th className="px-1 py-3 text-lg font-medium text-blue-900 uppercase tracking-wider w-4/12">
                Hotties
              </th>
              <th className="px-1 py-3 text-lg font-medium text-blue-900 uppercase tracking-wider w-7/12">
                Push-ups
              </th>
            </tr>
            </thead>
            <tbody>
            {userExercises.map(({ userName, count }, index) => (
      <tr
      key={userName}
      className={index === 0 ? "bg-yellow-400" : index % 2 === 0 ? "bg-blue-100" : "bg-white"}
      >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                      {index === 0 ? "🥇" : index + 1}
                  </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm font-medium text-blue-900">
        {userName}
      </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm text-blue-900">
        {count}
      </td>
    </tr>
  ))}
  </tbody>
          </table>
        ) : (
          <span className="loading loading-dots loading-lg items-center justify-center"><p>No exercise data available.</p></span>
          
        )}
        </div>
    )}

    {/* Room-based Table View */}
    {isRoomView && (
        <div>
        <div className="font-bold text-center pt-8">
            <text className="py-8 text-center text-bold text-3xl text-blue-900 uppercase tracking-wider">
                
                <text className="text-yellow-400"> Hot </text> 
                Friends 👑
            </text>
        </div>
        {roomExercises.length > 0 ? (
            <table className="table table-zebra table-auto text-center">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-lg font-medium text-blue-900 uppercase tracking-wider w-1/12">Rank</th>
                        <th className="px-1 py-3 text-lg font-medium text-blue-900 uppercase tracking-wider w-4/12">Hotties</th>
                        <th className="px-1 py-3 text-lg font-medium text-blue-900 uppercase tracking-wider w-7/12">Total Exercises</th>
                    </tr>
                </thead>
                <tbody>
                {roomExercises.map(({ userName, count }, index) => (
                    <tr key={userName} className={index % 2 === 0 ? "bg-blue-100" : "bg-white"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{index + 1}</td>
                        <td className="px-1 py-1 whitespace-nowrap text-sm font-medium text-blue-900">{userName}</td>
                        <td className="px-1 py-1 whitespace-nowrap text-sm text-blue-900">{count}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        ) : (
            <span className="loading"><p>No exercise data available for room {roomId}.</p></span>
        )}
    </div>
    )}
</div>

<div className="flex items-center justify-center">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-500 text-white font-bold py-2 px-4 m-10 justified rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 transition duration-300 ease-in-out"
      >
          Join Your Peers
      </button>


            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="relative m-4 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
                            <div className="bg-white m-4 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Room Options
                                        </h3>
                                        <div className="mt-2">
                                            <div>
                                                <label className="px-4 py-4">
                                                    <input
                                                        type="radio"
                                                        value="create"
                                                        checked={action === "create"}
                                                        onChange={() => setAction("create")}
                                                    /> Create Room
                                                </label>
                                                <label className="ml-4">
                                                    <input
                                                        type="radio"
                                                        value="join"
                                                        checked={action === "join"}
                                                        onChange={() => setAction("join")}
                                                    /> Join Room
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                value={roomId}
                                                onChange={(e) => setRoomId(e.target.value)}
                                                placeholder="Room ID"
                                                className="border rounded px-2 py-1 mt-2 w-full"
                                            />
                                            <button
                                                onClick={handleAction}
                                                className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-2"
                                            >
                                                {action === "create" ? "Create Room" : "Join Room"}
                                            </button>
                                            {error && <p style={{ color: "red" }}>{error}</p>}
                                            {success && <p style={{ color: "green" }}>{success}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                
            )}
        </div>
      </div>
    );
  };

  export default GroupComponent;
