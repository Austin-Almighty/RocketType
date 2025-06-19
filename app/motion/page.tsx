// import * as motion from "motion/react-client";
"use client";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";
import Campfire from "@/components/svgs/campfire";
// import AppLogo from "../_components/Logo";

import React from "react";
import SpaceShuttle from "@/components/svgs/SpaceShuttle";

export default function Motion() {
    // const [thrust, setThrust] = React.useState(false);

    // return (
    // <div className="flex flex-col items-center">
    //     {/* ... your shuttle SVG ... */}
    //     <FlameExhaust thrust={thrust} />
    //     <button
    //     className="mt-4 px-3 py-1 bg-blue-600 text-white rounded"
    //     onClick={() => setThrust((t) => !t)}
    //     >
    //     Toggle Thrust
    //     </button>
    // </div>
    // )
      return (
        <>
            <SpaceShuttle thrust={false}/>
        </>
      )
    }
