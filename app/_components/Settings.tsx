import { useEffect, useRef } from "react";
import { useGameContext } from "../_lib/gameContext";
import { FaKeyboard } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { MdTimer } from "react-icons/md";
import { TiSortAlphabetically } from "react-icons/ti";
import { IoDocument } from "react-icons/io5";




export default function Settings() {
  const { gameMode, setGameMode } = useGameContext();

  const modeDropdownRef = useRef<HTMLDetailsElement>(null);
  function handleModeChange(mode: "Rocket Run" | "Star Count" | "Zen") {
    setGameMode((prev) => ({ ...prev, mode }));
    modeDropdownRef.current?.removeAttribute("open");
  }

  const timeDropdownRef = useRef<HTMLDetailsElement>(null);
  function handleTimeChange(time: number) {
    setGameMode((prev) => ({ ...prev, time }));
    timeDropdownRef.current?.removeAttribute("open");
  }

  const countDropdownRef = useRef<HTMLDetailsElement>(null);
  function handleCountChange(count: number) {
    setGameMode((prev) => ({ ...prev, count }));
    countDropdownRef.current?.removeAttribute("open");
  }

  const wordDropdownRef = useRef<HTMLDetailsElement>(null);
  function handleWordsChange(words: "1k" | "5k" | "10k") {
    setGameMode((prev) => ({ ...prev, words }));
    wordDropdownRef.current?.removeAttribute("open");
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
    <div className="flex justify-center w-fit h-fit items-center bg-base-300 rounded-2xl z-1">
      <ul className="menu menu-horizontal w-fit mx-auto hidden md:flex">
        <li
          className={`${
            !(gameMode.mode && gameMode.time && gameMode.words)
              ? "tooltip tooltip-open tooltip-bottom md:tooltip-top"
              : ""
          }`}
          data-tip="Change settings"
        >
          <div
            className={`hover:scale-110 bg-transparent pointer-events-none text-base-content flex justify-center align-middle h-full ${
              !(gameMode.mode && gameMode.time && gameMode.words) ? "" : ""
            }`}
          >
            <FaKeyboard className="lg:text-xl" />
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
            <summary className="btn m-1 bg-base-300 border-0 shadow-none text-base-content w-34 lg:w-42 lg:text-xl">
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
              <summary className="btn m-1 bg-transparent border-0 shadow-none text-base-content w-34 lg:w-42 lg:text-xl">
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
              <summary className="btn m-1 bg-transparent border-0 shadow-none text-base-content w-34 lg:w-42 lg:text-xl">
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
              <summary className="btn m-1 bg-transparent border-0 shadow-none text-base-content w-34 lg:w-42 lg:text-xl">
                {gameMode.words === null ? "Words" : gameMode.words}
              </summary>
              <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none absolute left-1/2 -translate-x-1/2 rounded-2xl">
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleWordsChange("1k")}
                  >
                    1k
                  </a>
                </li>
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleWordsChange("5k")}
                  >
                    5k
                  </a>
                </li>
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleWordsChange("10k")}
                  >
                    10k
                  </a>
                </li>
              </ul>
            </details>
          </li>
        )}
      </ul>
      <div
        className="md:hidden flex bg-base-300 rounded-2xl 00 text-base-content p-4 g-4 z-1 hover:bg-info hover:text-info-content hover:cursor-pointer absolute top-35"
        onClick={() => {
          const modal = document.getElementById("settingsModal");
          if (modal) (modal as HTMLDialogElement).showModal();
        }}
      >
        <IoIosSettings className="w-6 h-6 md:w-8 md:h-8 fill-base-content" />
        <p className="text-base-content">Test Settings</p>
      </div>
      <dialog id="settingsModal" className="modal md:hidden ">
        <div className="modal-box w-[50%] join join-horizontal h-[50%] flex flex-col items-center justify-center gap-4">
          <h2 className="text-bold mb-4 text-base-content">Test Settings</h2>
          <details className="dropdown w-[90%] rounded-2xl" ref={modeDropdownRef}>
            <summary className="btn m-1 bg-base-300 border-0 shadow-none text-base-content w-full lg:w-42 lg:text-xl rounded-2xl">
              <FaKeyboard />  
              {gameMode.mode === null ? "Mode" : gameMode.mode}
            </summary>
            <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none w-full rounded-2xl">
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
          {gameMode.mode === "Star Count" && (

            <details className="dropdown relative w-[90%]" ref={countDropdownRef}>
              <summary className="btn m-1 bg-base-300 border-0 shadow-none text-base-content w-full lg:w-42 lg:text-xl rounded-2xl">
                <IoDocument />
                {gameMode.count === null ? "Count" : `${gameMode.count} words`}
              </summary>
              <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none absolute left-1/2 -translate-x-1/2 rounded-2xl w-[80%]">
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

        )}
        {gameMode.mode === "Rocket Run" && (

            <details className="dropdown relative w-[90%]" ref={timeDropdownRef}>
              <summary className="btn m-1 bg-base-300 border-0 shadow-none text-base-content w-full lg:w-42 lg:text-xl rounded-2xl">
                <MdTimer />
                {gameMode.time === null ? "Time" : `${gameMode.time}s`}
              </summary>
              <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none absolute left-1/2 -translate-x-1/2 rounded-2xl w-full">
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

        )}
         {gameMode.mode !== "Zen" && (

            <details className="dropdown w-[90%]" ref={wordDropdownRef}>
              <summary className="btn m-1 bg-base-300 border-0 shadow-none text-base-content w-full lg:w-42 lg:text-xl rounded-2xl">
                <TiSortAlphabetically />
                {gameMode.words === null ? "Words" : gameMode.words}
              </summary>
              <ul className="menu dropdown-content bg-base-300 text-base-content shadow-none absolute left-1/2 -translate-x-1/2 rounded-2xl w-full">
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleWordsChange("1k")}
                  >
                    1k
                  </a>
                </li>
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleWordsChange("5k")}
                  >
                    5k
                  </a>
                </li>
                <li className="text-base-content flex justify-center">
                  <a
                    className="block w-full text-center"
                    onClick={() => handleWordsChange("10k")}
                  >
                    10k
                  </a>
                </li>
              </ul>
            </details>

        )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
