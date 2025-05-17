import { useState, useEffect } from "react"

export default function wpm() {
    const [count, setCount] = useState(0);
    function totalKeyPress(e: KeyboardEvent) {
        setCount(prevCount => count + 1)
    }

    return count;
}

