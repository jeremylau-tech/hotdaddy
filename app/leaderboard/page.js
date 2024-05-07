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
  getDocs,
} from "firebase/firestore";
import { useAuth } from "@/auth/AuthProvider";
import { firestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { poetsen } from "@/fonts";
import FAB from "@/components/FAB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faChevronLeft,
  faChevronRight,
  faUserGroup,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
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
  const [roomIds, setRoomIds] = useState([]); // State for storing user's room IDs
  const [toast, setToast] = useState(null);

  const firestore = getFirestore();

  const fetchUserExercises = async () => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(firestore, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setRoomIds(userData.room || []); // Update roomIds from user data
        setCurrentRoomIndex(0); // Reset currentRoomIndex
        setRoomId(
          userData.room && userData.room.length > 0 ? userData.room[0] : ""
        ); // Set initial room ID if available

        // Fetch exercises as per rooms or globally
        const exerciseCollection = collection(firestore, "exercise");
        const exerciseQuery = query(exerciseCollection);
        const exerciseSnapshot = await getDocs(exerciseQuery);

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

        const userDetailsPromises = Object.keys(exerciseCounts).map(
          async (userId) => {
            const userDocRef = doc(firestore, "users", userId);
            const userDoc = await getDoc(userDocRef);
            const userName = userDoc.exists() ? userDoc.data().name : "Unknown";
            return {
              userId,
              userName,
              count: exerciseCounts[userId],
            };
          }
        );

        const userDetails = await Promise.all(userDetailsPromises);
        userDetails.sort((a, b) => b.count - a.count);
        setUserExercises(userDetails);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
        setToast(true);
        setError(`Room ID ${roomId} does not exist.`);
        setRoomExercises([]);
        return;
      }

      const roomData = roomDoc.data();
      const userIdsInRoom = roomData.user_ids || [];

      const exercisesPromises = userIdsInRoom.map(async (userId) => {
        const userDocRef = doc(firestore, "users", userId);
        const userDoc = await getDoc(userDocRef);
        const userName = userDoc.exists() ? userDoc.data().name : "Unknown";

        // Find exercise count for the user
        const exerciseCount =
          userExercises.find((exercise) => exercise.userId === userId)?.count ||
          0;
        return { userName, count: exerciseCount };
      });

      const exercisesDetails = await Promise.all(exercisesPromises);
      setRoomExercises(exercisesDetails); // Update room-based exercises
      setError(null);
      // setSuccess(`Displaying exercises for room ID ${roomId}.`);
    } catch (error) {
      console.error("Error fetching exercises for room:", error);
      setError("Error fetching exercises for room.");
      setToast(true);
      setRoomExercises([]);
      setSuccess(null);
    }
  };

  useEffect(() => {
    if (toast) {
      setTimeout(() => {
        setToast(false);
      }, 3000);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      fetchUserExercises();
    } else {
      router.push("/login");
    }
  }, [currentUser]);

  // UI elements

  const handleAction = async (action) => {
    try {
      if (roomId.trim() === "") {
        setToast(true);
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
          setToast(true);
          setError("Room ID already exists");
          setSuccess(null);
        } else {
          // Create a new room with the current user
          await setDoc(roomDocRef, { user_ids: [userId] });

          // Add the room to the user's record
          userRooms.push(roomId);
          await setDoc(userDocRef, { room: userRooms }, { merge: true });

          setSuccess("Room created successfully!");
          setToast(true);
          setError(null);
        }
      } else if (action === "join") {
        if (!roomDoc.exists()) {
          setToast(true);
          setError("Room ID does not exist. ");
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
          setToast(true);
          setError(null);
        }
      }
    } catch (error) {
      setToast(true);
      setError(error.message);
      setSuccess(null);
    }
  };

  return (
    <div className="max-w-screen-sm h-content">
      <div className="h-full">
        <div className="w-3/4 break-words whitespace-pre-wrap toast toast-start toast-top">
          {toast &&
            (Boolean(success) ? (
              <div className="flex break-words alert alert-success">
                <span>{success}</span>
              </div>
            ) : Boolean(error) ? (
              <div className="flex break-words alert alert-error">
                <span>{error}</span>
              </div>
            ) : null)}
        </div>
        {/* Universal Table View */}
        {!isRoomView && (
          <div>
            <div className="flex justify-evenly font-bold text-center mt-8">
              <button
                onClick={handlePreviousRoom}
                className="font-bold py-2 rounded-l "
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <h1 className="text-center text-bold text-3xl min-w-[260px] text-blue-900 uppercase tracking-wider">
                Global
                <span className={`${poetsen.className} text-primary`}>
                  Daddies
                </span>
              </h1>
              <button
                onClick={handleNextRoom}
                className="font-bold py-2 rounded-r "
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold text-neutral">Group Code</p>
              <p className="text-center basis-1/2 font-bold">{roomId}</p>
            </div>
            {userExercises.length > 0 ? (
              <table className="table table-zebra table-auto text-center">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-lg font-bold text-blue-900 uppercase tracking-wider w-1/12">
                      Rank
                    </th>
                    <th className="px-1 py-3 text-lg font-bold text-blue-900 uppercase tracking-wider w-4/12">
                      Hotties
                    </th>
                    <th className="px-1 py-3 text-lg font-bold text-blue-900 uppercase tracking-wider w-7/12">
                      Push-ups
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userExercises.map(({ userName, count }, index) => (
                    <tr
                      key={userName}
                      className={
                        index === 0
                          ? "bg-primary text-primary-content"
                          : index % 2 === 0
                          ? "bg-base-100 text-base-content"
                          : "bg-base-300 text-base-content"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {index === 0 ? "🥇" : index + 1}
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap text-sm font-medium">
                        {userName}
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap text-sm ">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span className="loading loading-dots loading-lg m-20 text-yellow items-center justify-center"></span>
            )}
                    
          </div>
        )}

        {/* Room-based Table View */}
        {isRoomView && (
          <div>
            <div className="flex justify-evenly font-bold text-center pt-8 ">
              <button
                onClick={handlePreviousRoom}
                className="font-bold py-2 rounded-l "
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <h1 className="text-center min-w-[260px] text-bold text-3xl text-blue-900 uppercase tracking-wider">
                Hot
                <span className={`${poetsen.className} text-primary`}>
                  Friends
                </span>
              </h1>
              <button
                onClick={handleNextRoom}
                className="font-bold py-2 rounded-r "
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="font-bold text-neutral">Group Code</p>
              <p className="basis-1/2 text-center font-bold">{roomId}</p>
            </div>
            {roomExercises.length > 0 ? (
              <table className="table table-zebra table-auto text-center ">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-lg  text-base-content font-bold uppercase tracking-wider w-1/12">
                      Rank
                    </th>
                    <th className="px-1 py-3 text-lg font-bold text-base-content  uppercase tracking-wider w-4/12">
                      Hotties
                    </th>
                    <th className="px-1 py-3 text-lg font-bold text-base-content uppercase tracking-wider w-7/12">
                      Push-ups
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roomExercises.map(({ userName, count }, index) => (
                    <tr
                      key={userName}
                      className={
                        index === 0
                          ? "bg-primary text-primary-content"
                          : index % 2 === 0
                          ? "bg-base-100 text-base-content"
                          : "bg-base-300 text-base-content"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                        {index === 0 ? "🥇" : index + 1}
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap text-sm font-medium ">
                        {userName}
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap text-sm ">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span className="loading">
                <p>No exercise data available for room {roomId}.</p>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <FAB
          onClick={() => document.getElementById("groupModal").showModal()}
          position="bottomRight"
          className="btn-primary mr-4 mb-12"
        >
          <FontAwesomeIcon icon={faBolt} />
          Challenge Now
        </FAB>

        <dialog id="groupModal" className="modal modal-bottom">
          <div className="modal-box flex justify-evenly items-center">
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  document.getElementById("groupModal").close();
                  document.getElementById("joinModal").showModal();
                }}
                className="btn btn-circle"
              >
                <FontAwesomeIcon icon={faUserPlus} />
              </button>
              <p className="text-sm">Join a Group</p>
            </div>
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  document.getElementById("groupModal").close();
                  document.getElementById("createModal").showModal();
                }}
                className="btn btn-circle"
              >
                <FontAwesomeIcon icon={faUserGroup} />
              </button>
              <p className="text-sm">Create a Group</p>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <dialog id="joinModal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Join a Group</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAction("join");
                document.getElementById("joinModal").close();
              }}
              className="form-control gap-y-4"
            >
              <input
                className="input"
                type="text"
                name="joinCode"
                placeholder="Group Code"
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Join
              </button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <dialog id="createModal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create a Group</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAction("create");
                document.getElementById("createModal").close();
              }}
              className="form-control gap-y-4"
            >
              <input
                placeholder="Group Code"
                className="input"
                type="text"
                name="createCode"
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Create
              </button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* {isModalOpen && (
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
                            />{" "}
                            Create Room
                          </label>
                          <label className="ml-4">
                            <input
                              type="radio"
                              value="join"
                              checked={action === "join"}
                              onChange={() => setAction("join")}
                            />{" "}
                            Join Room
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
                        {error && <p className="text-error">{error}</p>}
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
        )} */}
      </div>
    </div>
  );
};

export default GroupComponent;
