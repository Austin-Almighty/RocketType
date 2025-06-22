"use client"
import { useState } from "react";

import LeaderboardFilter from "./_components/Filter"
import Leaderboard from "./_components/Leaderboard";

export default function LeaderboardPage() {
    const [range, setRange] = useState("All-time");
    const [time, setTime] = useState("15");

    return (
        <div className="flex justify-center w-dvw">
            <div className="flex w-[90%] mt-6 mx-auto gap-6 lg:flex-row flex-col">
                <div className="min-w-56 flex flex-row lg:block justify-center">
                    <LeaderboardFilter range={range} setRange={setRange} time={time} setTime={setTime}/>
                </div>
                <div className="mx-auto lg:flex-1 w-full">
                    <h3 className="text-base-content font-extrabold text-3xl text-center">{`${range} English Time ${time}`}</h3>
                    <div className="divider divider-neutral"></div>
                    <Leaderboard range={range} time={time}/>
                </div>
            </div>
        </div>
    )
}