"use client"

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faArrowUpRightDots, faCertificate } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/auth/AuthProvider"; // Assuming this hook provides user auth info
import { collection, doc, getDoc, query, where, getDocs, getFirestore } from "firebase/firestore";
import {firestore} from "@/firebase";

function Achievement({ children }) {
  return (
    <li className="carousel-item card text-center flex flex-col">{children}</li>
  );
}

export default function Growth() {
  const { currentUser } = useAuth(); // Get current user from context
  const [totalPushups, setTotalPushups] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [percentageAchieved, setPercentageAchieved] = useState(0);
  const [goalReached, setGoalReached] = useState(528); // Placeholder for goal reached count

  useEffect(() => {
    async function fetchTotalPushups() {
      if (currentUser) {
        console.log("Current user UID:", currentUser.uid);
        try {
          // Assuming 'exercises' is the collection where user exercises are stored
          const firestore = getFirestore();

          const exercisesRef = collection(firestore, "exercise");
          const userDocRef = doc(firestore, "users", currentUser.uid);

          getDoc(userDocRef).then((docSnap) => {
            if (docSnap.exists()) {
              const numGoals = docSnap.data().numGoals;
              console.log("Number of Goals:", numGoals);
              setTotalPushups(numGoals);
              setTotalGoals(numGoals);

            } else {
              console.log("No such document!");
            }
          }).catch((error) => {
            console.error("Error getting document:", error);
          });

          const q = query(exercisesRef, where("userId", "==", currentUser.uid));
          
          const querySnapshot = await getDocs(q);
          console.log("QuerySnapshot size:", querySnapshot.size); 

        } catch (error) {
          console.error('Failed to fetch exercises:', error);
        }
      }
    }

    fetchTotalPushups();
  }, [currentUser]);

  useEffect(() => {
    console.log('Updated totalPushups:', totalPushups);
  }, [totalPushups]); 

  useEffect(() => {
    if (totalGoals > 0) {
      const percentage = (totalPushups / 30) * 100;
      const formattedPercentage = parseFloat(percentage.toFixed(2));
      setPercentageAchieved(formattedPercentage);
    }
  }, [totalPushups, totalGoals]); 

  function getAchievementColor(targetPercentage) {
    return percentageAchieved >= targetPercentage ? 'red' : 'black';
  }

  return (
    <main className="h-content flex flex-col justify-center items-center px-4 gap-y-4 overflow-hidden">
      <div className="w-full ml-3" role="group">
        <h3 className="font-bold text-3xl mt-4">Your Growth</h3>
        <subtitle className="text-slate-300 ml-2 font-semibold">
          Progress to date
        </subtitle>
        <ul className="stats stats-vertical md:stats-horizontal w-full md:max-w-[60%] py-4 shadow-md overflow-hidden">
          <li className="stat">
            <div className="stat-title">Goals Met To Date</div>
            <div className="flex flex-row justify-between stat-value text-primary">
              {totalPushups}
              <div className="stat-figure text-primary">
                <FontAwesomeIcon icon={faDumbbell} className="w-8 h-8" />
              </div>
            </div>
            <div className="stat-desc">have been achieved.</div>
          </li>
          <li className="stat">
            <div className="stat-title">You are currently</div>
            <div className="flex flex-row justify-between stat-value text-primary">
             {percentageAchieved}%
              <div className="stat-figure text-primary">
                <FontAwesomeIcon icon={faArrowUpRightDots} className="w-8 h-8" />
              </div>
            </div>
            <div className="stat-desc">of a full month!</div>
          </li>
        </ul>
      </div>
      <div className="flex flex-col self-start max-w-full rounded-box ml-3" role="group">
        <h3 className="font-bold text-3xl">Your Achievements</h3>
        <subtitle className="text-slate-300 ml-2 font-semibold">
          Accomplishments to date
        </subtitle>
        <ul className="carousel mt-4 font-semibold">
        <Achievement>
<FontAwesomeIcon icon={faCertificate} style={{ color: getAchievementColor(3) }} />
<div className="card-body">
  <p>
    1 Exercise <br /> Streak
  </p>
</div>
</Achievement>
<Achievement>
<FontAwesomeIcon icon={faCertificate} style={{ color: getAchievementColor(6) }} />
<div className="card-body">
  <p>
    2 Exercise <br /> Streak
  </p>
</div>
</Achievement>
<Achievement>
<FontAwesomeIcon icon={faCertificate} style={{ color: getAchievementColor(9) }} />
<div className="card-body">
  <p>
    3 Exercise <br /> Streak
  </p>
</div>
</Achievement>
<Achievement>
<FontAwesomeIcon icon={faCertificate} style={{ color: getAchievementColor(12) }} />
<div className="card-body">
  <p>
    4 Exercise <br /> Streak
  </p>
</div>
</Achievement>
<Achievement>
<FontAwesomeIcon icon={faCertificate} style={{ color: getAchievementColor(15) }} />
<div className="card-body">
  <p>
    5 Exercise <br /> Streak
  </p>
</div>
</Achievement>
        </ul>
      </div>
    </main>
  );
}
