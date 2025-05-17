"use client"; 

import { useEffect } from "react";

export default function KeyboardListener() {
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      let key = e.key.toLowerCase(); // normalize casing
      if (key === " ") key = "space"; // handle special characters manually
      if (key === "enter") key = "enter"; // optionally handle other keys

      const keypress = document.getElementById(key);
      keypress?.classList.add("pressed");

      setTimeout(() => {
        keypress?.classList.remove("pressed");
      }, 150);
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  return null; 
}
