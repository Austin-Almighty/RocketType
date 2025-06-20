"use client";


import { useGameContext } from "../_lib/gameContext";


export default function WordCounter({complete}: {complete?:number}) {
    const {gameMode} = useGameContext();
    const showTotal = typeof gameMode.count === "number" && !isNaN(gameMode.count);
  return (
    <>
      <span className="font-mono text-4xl text-base-content">
        <span className="countdown">
          <span
            style={{ "--value": complete ?? 0 } as React.CSSProperties}
            aria-live="polite"
            aria-label={(complete ?? 0).toString()}
          >
            {`${complete ?? 0}`}
          </span>
        </span>
        {showTotal && (
          <>
            <span className="mx-1 font-normal">/</span>
            <span className="countdown">
              <span
                style={{ "--value": gameMode.count } as React.CSSProperties}
                aria-live="polite"
              >
                {gameMode.count}
              </span>
            </span>
          </>
        )}
      </span>
    </>
  );
}
