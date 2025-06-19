"use client";

import { useEffect, useState } from "react";
import { useGameContext } from "../_lib/gameContext";


export default function WordCounter({complete}: {complete:number}) {
    const {gameMode} = useGameContext();
  return (
    <>
      <span className="font-mono text-4xl text-base-content">
        <span className="countdown">
          <span
            style={{ "--value": complete } as React.CSSProperties}
            aria-live="polite"
            aria-label={complete?.toString()}
          >
            {`${complete}`}
          </span>
        </span>
        <span className="mx-1 font-normal">/</span>
        <span className="countdown">
          <span
            style={{ "--value": gameMode.count } as React.CSSProperties}
            aria-live="polite"
            aria-label={gameMode.count?.toString()}
          >
            {gameMode.count}
          </span>
        </span>
      </span>
    </>
  );
}
