"use client";
import React, { useState } from "react";
import { IoEarthSharp, IoToday, IoTimer } from "react-icons/io5";
import { FaCalendarWeek } from "react-icons/fa";

type LeaderboardFilterProps = {
  range: string;
  setRange: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
};

export default function LeaderboardFilter({range, setRange, time, setTime}: LeaderboardFilterProps) {
    

    const rangeSelectedClass = "btn join-item justify-start bg-secondary-content text-secondary rounded-2xl"
    const timeSelectedClass = "btn join-item justify-start bg-accent-content text-accent rounded-2xl"

  return (
    <>
      <div className="join join-horizontal lg:join-vertical bg-base-300 justify-center rounded-2xl p-4 lg:max-w-56 w-fit">
        <div className="lg:w-full lg:block flex flex-col">
          <div className="flex flex-row lg:flex-col">
            <button className={`${range === "All-time" ? rangeSelectedClass: "btn join-item justify-start bg-secondary text-secondary-content rounded-2xl"}`}
            onClick={()=>setRange("All-time")}><IoEarthSharp/>all-time English</button>
            <button className={`${range === "Monthly" ? rangeSelectedClass: "btn join-item justify-start bg-secondary text-secondary-content rounded-2xl"}`} onClick={()=>setRange("Monthly")}><FaCalendarWeek/>Monthly</button>
            <button className={`${range === "Daily" ? rangeSelectedClass: "btn join-item justify-start bg-secondary text-secondary-content rounded-2xl"}`}  onClick={()=>setRange("Daily")}><IoToday/>daily</button>
          </div>
          <div className="divider divider-neutral"></div>
          <div className="flex flex-row lg:flex-col w-full justify-center">
            <button className={`${time === "15" ? timeSelectedClass: "btn join-item justify-start bg-accent text-accent-content rounded-2xl"}`} onClick={()=>setTime("15")}><IoTimer/>Time 15</button>
            <button className={`${time === "30" ? timeSelectedClass: "btn join-item justify-start bg-accent text-accent-content rounded-2xl"}`} onClick={()=>setTime("30")}><IoTimer/>Time 30</button>
            <button className={`${time === "60" ? timeSelectedClass: "btn join-item justify-start bg-accent text-accent-content rounded-2xl"}`} onClick={()=>setTime("60")}><IoTimer/>Time 60</button>
          </div>   
        </div>   
      </div>
    </>
  );
}
