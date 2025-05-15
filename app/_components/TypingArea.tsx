// export default function Typing() {
//     return (
//         <>
//             <textarea className="w-full min-h-40 text-blue-950 border-amber-700 bg-amber-100 text-5xl focus:outline-none caret-current overflow-hidden resize-none" style={{caretColor: "currentColor", animation: "none"}} id="typing-area" autoFocus />
//         </>
//     )
// }
"use client";

import { useRef, useEffect, useState } from "react";

export default function Typing() {
    const editorRef = useRef<HTMLDivElement>(null);
    const [text, setText] = useState("");

    useEffect(() => {
        if (editorRef.current) editorRef.current.focus();
    }, []);

    return (
        <div className="relative w-full min-h-40 bg-amber-100 text-blue-950 text-5xl border-amber-700 overflow-hidden">
            {/* Editable text input area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setText(e.currentTarget.textContent || "")}
                className="w-full min-h-40 outline-none caret-transparent px-2 py-4"
                id="typing-area"
            >{text}</div>

            {/* Custom caret */}
            <div className="absolute top-4 left-2 w-1 h-12 bg-blue-950"></div>
        </div>
    );
}