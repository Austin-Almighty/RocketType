
"use client";

import { useRef, useEffect, useState } from "react";
const sample_text = "The hallway smelt of boiled cabbage and old rag mats At one end of it a coloured poster too large for indoor display had been tacked to the wall";
const characters = sample_text.split("");

export default function Typing() {
    const textRef = useRef<HTMLTextAreaElement>(null);
    // const caretRef = useRef(null);
    // const [text, setText] = useState("");
    const [userInput, setUserInput] = useState("");

    useEffect(() => {
        if (textRef.current) textRef.current.focus();
    }, []);

    useEffect(() => {
        function focusOnInput() {
            if (textRef.current) textRef.current.focus();}
            document.addEventListener('keypress', focusOnInput)
    }, [])

   

    return (
      <div className="relative w-full min-h-40 bg-amber-100 text-blue-950 text-5xl border-amber-700 overflow-hidden">
        <div className="text-display">
          {characters.map((char, index) => {
            let className = "";
            if (index < userInput.length) {
              className = char === userInput[index] ? "correct" : "incorrect";
            } else if (index === userInput.length) {
              className = "current";
            }
            return (
              <span key={index} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        <textarea
          ref={textRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="typing-input opacity-0 -z-50"
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