import { useEffect, useRef } from "react";
import { useGameContext } from "../_lib/gameContext";
import { FaKeyboard } from "react-icons/fa";

export default function Settings() {

  const { gameMode, setGameMode } = useGameContext();

  const modeDropdownRef = useRef<HTMLDetailsElement>(null);
  function handleModeChange(mode: "Rocket Run" | "Star Count" | "Zen") {
    setGameMode((prev) => ({ ...prev, mode }));
    modeDropdownRef.current?.removeAttribute('open')
  }

  const timeDropdownRef = useRef<HTMLDetailsElement>(null);
  function handleTimeChange(time: number) {
    setGameMode((prev) => ({ ...prev, time }));
    timeDropdownRef.current?.removeAttribute("open")
  }

  const countDropdownRef = useRef<HTMLDetailsElement>(null);
  function handleCountChange(count: number) {
    setGameMode((prev)=> ({...prev, count}));
    countDropdownRef.current?.removeAttribute('open')
  }

  const wordDropdownRef = useRef<HTMLDetailsElement>(null);
  function handleWordsChange(words: "1k" | "5k" | "10k") {
    setGameMode((prev) => ({ ...prev, words }));
    wordDropdownRef.current?.removeAttribute("open")
  }


 useEffect(() => {
  let shouldStart = false;

  if (gameMode.mode === "Rocket Run") {
    shouldStart = Boolean(gameMode.time && gameMode.words);
  } else if (gameMode.mode === "Star Count") {
    shouldStart = Boolean(gameMode.count && gameMode.words);
  } else if (gameMode.mode === "Zen") {
    shouldStart = true;
  }

  if (gameMode.start !== shouldStart) {
    setGameMode((prev) => ({
      ...prev,
      start: shouldStart,
    }));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  gameMode.mode,
  gameMode.time,
  gameMode.words,
  gameMode.count,
  setGameMode,
]);

  return (
    <div className="flex justify-center w-fit h-fit items-center bg-base-300 rounded-2xl">
      <ul className="menu menu-horizontal w-fit mx-auto">
        <li
          className={`${
            !(gameMode.mode && gameMode.time && gameMode.words)
              ? "tooltip tooltip-open"
              : ""
          }`}
          data-tip="Use the drop-down menu"
        >
          <div
            className={`hover:scale-110 bg-transparent pointer-events-none text-base-content ${
              !(gameMode.mode && gameMode.time && gameMode.words)
                ? "animate-ping"
                : ""
            }`}
          >
            <svg
              className="h-7 w-7 active:bg-transparent focus:bg-transparent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74457 2.35523 9.35522 2.74458 9.15223 3.23463C9.05957 3.45834 9.0233 3.7185 9.00911 4.09799C8.98826 4.65568 8.70226 5.17189 8.21894 5.45093C7.73564 5.72996 7.14559 5.71954 6.65219 5.45876C6.31645 5.2813 6.07301 5.18262 5.83294 5.15102C5.30704 5.08178 4.77518 5.22429 4.35436 5.5472C4.03874 5.78938 3.80577 6.1929 3.33983 6.99993C2.87389 7.80697 2.64092 8.21048 2.58899 8.60491C2.51976 9.1308 2.66227 9.66266 2.98518 10.0835C3.13256 10.2756 3.3397 10.437 3.66119 10.639C4.1338 10.936 4.43789 11.4419 4.43786 12C4.43783 12.5581 4.13375 13.0639 3.66118 13.3608C3.33965 13.5629 3.13248 13.7244 2.98508 13.9165C2.66217 14.3373 2.51966 14.8691 2.5889 15.395C2.64082 15.7894 2.87379 16.193 3.33973 17C3.80568 17.807 4.03865 18.2106 4.35426 18.4527C4.77508 18.7756 5.30694 18.9181 5.83284 18.8489C6.07289 18.8173 6.31632 18.7186 6.65204 18.5412C7.14547 18.2804 7.73556 18.27 8.2189 18.549C8.70224 18.8281 8.98826 19.3443 9.00911 19.9021C9.02331 20.2815 9.05957 20.5417 9.15223 20.7654C9.35522 21.2554 9.74457 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8477 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.902C15.0117 19.3443 15.2977 18.8281 15.781 18.549  C16.2643 18.2699 16.8544 18.2804 17.3479 18.5412C17.6836 18.7186 17.927 18.8172 18.167 18.8488C18.6929 18.9181 19.2248 18.7756 19.6456 18.4527C19.9612 18.2105 20.1942 17.807 20.6601 16.9999C21.1261 16.1929 21.3591 15.7894 21.411 15.395C21.4802 14.8691 21.3377 14.3372 21.0148 13.9164C20.8674 13.7243 20.6602 13.5628 20.3387 13.3608C19.8662 13.0639 19.5621 12.558 19.5621 11.9999C19.5621 11.4418 19.8662 10.9361 20.3387 10.6392C20.6603 10.4371 20.8675 10.2757 21.0149 10.0835C21.3378 9.66273 21.4803 9.13087 21.4111 8.60497C21.3592 8.21055 21.1262 7.80703 20.6602 7C20.1943 6.19297 19.9613 5.78945 19.6457 5.54727C19.2249 5.22436 18.693 5.08185 18.1671 5.15109C17.9271 5.18269 17.6837 5.28136 17.3479 5.4588C16.8545 5.71959 16.2644 5.73002 15.7811 5.45096C15.2977 5.17191 15.0117 4.65566 14.9909 4.09794C14.9767 3.71848 14.9404 3.45833 14.8477 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </li>
        {/* <li className="w-32">
          <button className="btn bg-transparent border-0 shadow-none text-blue-950 w-full" popoverTarget="popover-1" style={{ anchorName: "--anchor-1" }  as React.CSSProperties }>
            {gameMode.mode===undefined ? "Mode": gameMode.mode}
          </button> 
          <ul className="dropdown menu w-fit bg-transparent shadow-none text-blue-950 left-[-20]"
            popover="auto" id="popover-1" style={{ positionAnchor: "--anchor-1" } as React.CSSProperties }>
            <li className="text-blue-950 flex justify-center"><a className="block w-full text-center" onClick={()=> handleModeChange("Time Attack")}>Time Attack</a></li>
            <li className="text-blue-950 flex justify-center"><a className="block w-full text-center" onClick={()=> handleModeChange("Strict")}>Strict</a></li>
            <li className="text-blue-950"><a className="block w-full text-center" onClick={()=>handleModeChange('Zen')}>Zen</a></li>
          </ul>
        </li>
        <li className="w-32">
          <button className="btn bg-transparent border-0 shadow-none text-blue-950" popoverTarget="popover-2" style={{ anchorName: "--anchor-2"} as React.CSSProperties }>
            {gameMode.time===undefined ? "Time": `${gameMode.time}s`}
          </button>
          <ul className="dropdown menu w-fit bg-transparent shadow-none text-blue-950 left-5" popover="auto" id="popover-2" style={{ positionAnchor: "--anchor-2"} as React.CSSProperties }>
            <li className="text-blue-950 flex justify-center"><a className="block w-full text-center" onClick={()=>handleTimeChange(15)}>15</a></li>
            <li className="text-blue-950 flex justify-center"><a className="block w-full text-center" onClick={()=>handleTimeChange(30)}>30</a></li>
            <li className="text-blue-950 flex justify-center"><a className="block w-full text-center" onClick={()=>handleTimeChange(60)}>60</a></li>
          </ul>
        </li>
        <li className="w-32 relative">
          <button className="btn bg-transparent border-0 shadow-none text-blue-950" popoverTarget="popover-3" style={{ anchorName: "--anchor-3"} as React.CSSProperties }>
            {gameMode.words===undefined ? "Words": gameMode.words}
          </button>
          <ul className="dropdown menu w-fit bg-transparent shadow-none text-blue-950 left-[15]" popover="auto" id="popover-3" style={{ positionAnchor: "--anchor-3"} as React.CSSProperties }>
            <li className="text-blue-950 flex justify-center"><a className="block w-full text-center" onClick={()=>handleWordsChange("1k")}>1k</a></li>
            <li className="text-blue-950 flex justify-center"><a className="block w-full text-center" onClick={()=>handleWordsChange("5k")}>5k</a></li>
            <li className="text-blue-950 flex justify-center"><a className="block w-full text-center" onClick={()=>handleWordsChange("10k")}>10k</a></li>
          </ul>
        </li> */}
        <li>

          <details className="dropdown" ref={modeDropdownRef}>

            <summary className="btn m-1 bg-base-300 border-0 shadow-none text-base-content w-34">
              {gameMode.mode === null ? "Mode" : gameMode.mode}
            </summary>
            <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none rounded-2xl">
              <li className="text-base-content flex justify-center">
                <a
                  className="block w-full text-center"
                  onClick={() => handleModeChange("Rocket Run")}
                >
                  Rocket Run
                </a>
              </li>
              <li className="text-base-content flex justify-center">
                <a
                  className="block w-full text-center"
                  onClick={() => handleModeChange("Star Count")}
                >
                  Star Count
                </a>
              </li>
              <li className="text-base-content">
                <a
                  className="block w-full text-center"
                  onClick={() => handleModeChange("Zen")}
                >
                  Zen
                </a>
              </li>
            </ul>
          </details>
        </li>
        {gameMode.mode === "Star Count" && (
          <li>
            <details className="dropdown relative" ref={countDropdownRef}>
              <summary className="btn m-1 bg-transparent border-0 shadow-none text-base-content w-34">
                {gameMode.count === null ? "Count" : `${gameMode.count} words`}
              </summary>
              <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none absolute left-1/2 -translate-x-1/2 rounded-2xl">
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleCountChange(20)}
                  >
                    20
                  </a>
                </li>
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleCountChange(50)}
                  >
                    50
                  </a>
                </li>
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleCountChange(100)}
                  >
                    100
                  </a>
                </li>
              </ul>
            </details>
          </li>
        )}
        {gameMode.mode === "Rocket Run" && (
          <li>
            <details className="dropdown relative" ref={timeDropdownRef}>
              <summary className="btn m-1 bg-transparent border-0 shadow-none text-base-content w-34">
                {gameMode.time === null ? "Time" : `${gameMode.time}s`}
              </summary>
              <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none absolute left-1/2 -translate-x-1/2 rounded-2xl">
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleTimeChange(15)}
                  >
                    15
                  </a>
                </li>
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleTimeChange(30)}
                  >
                    30
                  </a>
                </li>
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleTimeChange(60)}
                  >
                    60
                  </a>
                </li>
              </ul>
            </details>
          </li>
        )}
        {gameMode.mode !== "Zen" && (
          <li>
            <details className="dropdown" ref={wordDropdownRef}>
              <summary className="btn m-1 bg-transparent border-0 shadow-none text-base-content w-34">
                {gameMode.words===null ? "Words": gameMode.words}
              </summary>
              <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none absolute left-1/2 -translate-x-1/2 rounded-2xl">
                <li className="text-base-content flex justify-center"><a className="block w-full text-center" onClick={()=>handleWordsChange("1k")}>1k</a></li>
                <li className="text-base-content flex justify-center"><a className="block w-full text-center" onClick={()=>handleWordsChange("5k")}>5k</a></li>
                <li className="text-base-content flex justify-center"><a className="block w-full text-center" onClick={()=>handleWordsChange("10k")}>10k</a></li>
              </ul>
            </details>
          </li>
        )}
      </ul>
    </div>
  );
}
