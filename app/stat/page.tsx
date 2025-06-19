"use client";
import Profile from "./_components/Profile";
import Summary from "./_components/Summary";
import Table from "./_components/Table";

import { useUser } from "../_lib/userContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getResults } from "../_lib/getResults";

export default function User() {
  const { user, loading } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!user && !loading) {
      router.push("/user");
    }
  }, [user, loading]);

  // const [results, setResults] = useState<any[] | null>(null);
  
  //   useEffect(() => {
  //     async function fetchResults() {
  //       const res = await getResults();
  //       setResults(res);
  //     }
  //     fetchResults();
  //   }, []);

  if (loading) {
    // return <LoadingScreen />;
  } else {
    return (
      <>
        <div className="bg-base-100 flex flex-col items-center gap-y-6">

          {user && (
            <>
              <Profile />
              <Summary />
              <Table />
              <button className="btn">
                <span className="loading loading-spinner"></span>
                loading
              </button>
            </>
          )}
        </div>
      </>
    );
  }
}
