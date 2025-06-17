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
    

    const rangeSelectedClass = "btn join-item justify-start bg-secondary-content text-secondary rounded-t-lg"
    const timeSelectedClass = "btn join-item justify-start bg-accent-content text-accent rounded-t-lg"

  return (
    <>
      <div className="join join-horizontal lg:join-vertical bg-base-300 justify-center rounded-2xl p-4 min-w-56">
        <button className={`${range === "All-time" ? rangeSelectedClass: "btn join-item justify-start bg-secondary text-secondary-content rounded-t-lg"}`}
        onClick={()=>setRange("All-time")}><IoEarthSharp/>all-time English</button>
        <button className={`${range === "Monthly" ? rangeSelectedClass: "btn join-item justify-start bg-secondary text-secondary-content"}`} onClick={()=>setRange("Monthly")}><FaCalendarWeek/>Monthly</button>
        <button className={`${range === "Daily" ? rangeSelectedClass: "btn join-item justify-start bg-secondary text-secondary-content rounded-b-lg"}`}  onClick={()=>setRange("Daily")}><IoToday/>daily</button>
        <div className="divider divider-neutral"></div>
        <button className={`${time === "15" ? timeSelectedClass: "btn join-item justify-start bg-accent text-accent-content rounded-t-lg"}`} onClick={()=>setTime("15")}><IoTimer/>Time 15</button>
        <button className={`${time === "30" ? timeSelectedClass: "btn join-item justify-start bg-accent text-accent-content"}`} onClick={()=>setTime("30")}><IoTimer/>Time 30</button>
        <button className={`${time === "60" ? timeSelectedClass: "btn join-item justify-start bg-accent text-accent-content rounded-b-lg"}`} onClick={()=>setTime("60")}><IoTimer/>Time 60</button>
      </div>
    </>
  );
}
