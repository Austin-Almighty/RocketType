"use client";
import { useEffect, useRef, useState } from "react";

export default function FPSDisplay() {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const update = (time: number) => {
      frameCount.current++;
      const elapsed = time - lastTime.current;

      if (elapsed >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = time;
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="fixed top-2 right-2 bg-black text-green-400 text-sm p-2 rounded shadow">
      FPS: {fps}
    </div>
  );
}
