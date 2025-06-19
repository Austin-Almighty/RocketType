"use client";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";

type ShuttleExhaustProps = {
  thrust?: boolean;
};

export default function ShuttleExhaust({ thrust = false }: ShuttleExhaustProps) {
  const [flameRef, animate] = useAnimate();

  useEffect(() => {
    let isMounted = true;

    function flicker() {
      if (!isMounted) return;

      // Thrust state: longer, faster, more dramatic. Idle: gentle.
      const interval = thrust ? 60 + Math.random() * 40 : 180 + Math.random() * 120;
      const baseScaleY = thrust ? 1.5 : 1;
      const baseScaleX = thrust ? 1.05 : 1;
      const scaleY = baseScaleY + (thrust ? (Math.random() * 0.18 - 0.09) : (Math.random() * 0.1 - 0.05));
      const scaleX = baseScaleX + (thrust ? (Math.random() * 0.10 - 0.05) : (Math.random() * 0.06 - 0.03));
      const skewX = thrust
        ? Math.random() * 16 - 8
        : Math.random() * 10 - 5;
      const opacity = thrust
        ? 0.85 + Math.random() * 0.25
        : 0.7 + Math.random() * 0.3;
      const fillColors = ["#EBBA16", "#F0C419", "#D9A715"];
      const fill = fillColors[Math.floor(Math.random() * fillColors.length)];

      animate(
        flameRef.current,
        {
          scaleX,
          scaleY,
          skewX,
          opacity,
          fill,
        },
        { duration: interval / 1000 }
      );

      setTimeout(flicker, interval);
    }

    flicker();
    return () => {
      isMounted = false;
    };
  }, [animate, flameRef, thrust]);

  return (
    <motion.svg
      height="80px"
      width="80px"
      version="1.1"
      viewBox="0 -10 55.243 55.243"
    >
      {/* Outer yellow flame */}
      <motion.path
        ref={flameRef}
        fill="#EBBA16"
        d="M41,8.122c0,9.5-8,16-8,16c0-7.5-3-14-3-14c0,5.875-4,9-4,9c-5.344-5.344,0-18,0-18
          c-7.61,1.004-14.425,6.25-14.425,15c0,6.188,1.728,10.304,4.425,13c0,0-2.393-1.388-4.78-2.304
          c1.238,9.8,8.044,17.304,16.28,17.304c9.113,0,16.5-8.438,16.5-20S41,8.122,41,8.122z"
      />
      {/* Inner orange flame */}
      <motion.path
        fill="#DC691D"
        d="M32.912,30.564c0,3.314-3.535,6.279-3.535,6.279c0-2.616-1.326-5.233-1.326-5.233
          c0,2.049-3.093,2.093-3.093,2.093c-1.381-1.483,0-5.581,0-5.581c-3.363,0.35-5.048,2.18-5.048,5.233
          c0,2.158,0.764,3.594,1.955,4.535,c0,0-1.057-0.484-2.112-0.804c0.547,3.418,3.555,6.036,7.193,6.036
          c4.027,0,7.291-2.943,7.291-6.977S32.912,30.564,32.912,30.564z"
      />
    </motion.svg>
  );
}