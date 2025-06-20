"use client";
import Profile from "./_components/Profile";
import Summary from "./_components/Summary";
import Table from "./_components/Table";
import Earth from "@/components/svgs/earth";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSummaryStats } from "../_lib/getResults";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../_lib/Firebase";

export default function User() {
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const [stats, setStats] = useState<null | {
    DaysSinceCreation: number,
    highestWPM: number,
    averageWPM: number,
    completed: number,
    timeTyping: number,
    averageWPMLast10: number,
    highestRAW: number,
    averageRAW: number,
    averageRAWLast10: number,
    highestAccuracy: number,
    averageAccuracy: number,
    averageAccuracyLast10: number,
  }>(null);

  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    setLoading(true);
    const minDelay = 1000;
    const start = Date.now();

    async function loadData() {
      const data = await getSummaryStats();
      setStats(data);
      const elapsed = Date.now() - start;
      const wait = minDelay - elapsed;
      if (wait > 0) {
        setTimeout(()=> setLoading(false), wait);
      } else {
        setLoading(false);
      }
    }
    loadData()
  }, []);

 

  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/user");
      } else {
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="animate-fade-in w-screen min-h-dvh flex justify-center items-center bg-base-100">
        <span className="text-lg">Checking for credentials...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 w-full h-dvh py-8 text-center align-middle">
        {/* <span className="loading loading-infinity loading-xl text-warning"></span> */}
        <Earth />
        <div>Loading...</div>
      </div>
    )
  }


  
    return (
      <>
        <div className="bg-base-100 flex flex-col items-center gap-y-6">

          {authChecked && (
            <>
              <Profile stats={stats}/>
              <Summary stats={stats}/>
              <Table />
              {/* <button className="btn">
                <span className="loading loading-spinner"></span>
                loading
              </button> */}
            </>
          )}
        </div>
      </>
    );
  }

