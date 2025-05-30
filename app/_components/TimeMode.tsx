"use client";

import { useRef, useEffect, useState, forwardRef } from "react";
import { useGameContext } from "../_lib/gameContext";
import { top250Words, top1kWords, top5kWords } from "../_ui/words";


function getRandomWords(words: string[], count: number): string[] {
  // Step 1: Shuffle the original array (Fisher-Yates shuffle)
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Step 2: Take the first `count` words from the shuffled array
  const selectedWords = shuffled.slice(0, count);
  const fullString = selectedWords.join(" ")
  const characters = fullString.split("")
  return characters
}

function assignRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (value: T) => {
    refs.forEach(ref => {
      if (!ref) return;
      if (typeof ref === 'function') ref(value);
      else (ref as React.RefObject<T>).current = value;
    });
  };
}

export default forwardRef<HTMLTextAreaElement, { setMistakes: React.Dispatch<React.SetStateAction<number>> }>(
  function Typing({ setMistakes }, ref) {

    const {gameMode} = useGameContext();
    const textRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentCharRef = useRef<HTMLSpanElement>(null);
    const [characters, setCharacters] = useState<string[]>([]);

 
    const [userInput, setUserInput] = useState("");

    useEffect(() => {
        if (textRef.current) textRef.current.focus({preventScroll: true});
    }, []);

    useEffect(() => {
        function focusOnInput() {
            if (textRef.current) textRef.current.focus({preventScroll: true});}
            document.addEventListener('keypress', focusOnInput)
    }, [])
    
    useEffect(()=> {
      let newCharacters: string[] = [];
      if (gameMode.words === "1k") {
        newCharacters = getRandomWords(top250Words, 250)
      } else if (gameMode.words === "5k") {
        newCharacters = getRandomWords(top1kWords, 250)
         console.log(characters)
      } else if (gameMode.words === "10k") {
        newCharacters = getRandomWords(top5kWords, 250)
      }
      setCharacters(newCharacters)
    }, [gameMode.words])

    // useEffect(() => {
    //   const mistakeCount = userInput.split("").reduce((acc, char, index) => {
    //     if (index >= characters.length) return acc;
    //     return char !== characters[index] ? acc+1 : acc;
    //   }, 0);
    //   setMistakes(mistakeCount)
    // }, [userInput, setMistakes])

    useEffect(() => {
      if (!containerRef.current || !currentCharRef.current) return;

      const container = containerRef.current;
      const currentChar = currentCharRef.current;

      const containerRect = container.getBoundingClientRect();
      const charRect = currentChar.getBoundingClientRect();

      if (charRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - charRect.top;
      } else if (charRect.bottom > containerRect.bottom) {
        container.scrollTop += charRect.bottom - containerRect.bottom;
      }
    }, [userInput]);

    return (
      <div className="relative w-full bg-amber-100 text-blue-950 text-5xl border-amber-700 overflow-hidden leading-normal">
        <div
          ref={containerRef}
          className="text-display max-h-60 overflow-hidden"
          onWheel={(e) => e.preventDefault()}
          style={{ lineHeight: '1.25em' }}
        >
          {characters.map((char, index) => {
            let className = "";
            if (index < userInput.length) {
              className = char === userInput[index] ? "correct" : "incorrect"
            } else if (index === userInput.length) {
              className = "current";
            }
            return (
              <span
                key={index}
                className={className}
                ref={index === userInput.length ? currentCharRef : null}
              >
                {char}
              </span>
            );
          })}
        </div>

        <textarea
          ref={assignRefs(textRef, ref)}
          value={userInput}
          onChange={(e) => {
            const value = e.target.value;

            //Find what character was just typed
            const prevLength = userInput.length;
            const nextLength = value.length;
            let newMistakes = 0

            //Case1: User type a new character
            if (nextLength > prevLength) {
              const newChar = value[value.length - 1];
              const expectedChar = characters[prevLength];
              if (newChar !== expectedChar) {
                newMistakes = 1;
              }
            }
            setMistakes((prev)=>prev + newMistakes);
            setUserInput(value);
            
          }}
          className="typing-input opacity-0 -z-50 h-0 w-0"
        />

        {/* <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setText(e.currentTarget.textContent || "")}
                className="w-full min-h-40 outline-none caret-transparent px-2 py-4"
                id="typing-area"

            ></div> */}

      
        {/* <div className="absolute top-4 left-2 w-1 h-12 bg-blue-950"></div> */}
      </div>
    );
  }
);