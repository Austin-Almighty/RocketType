import Earth from "@/components/svgs/earth"

import { ReactNode } from "react"

type HeroProps = {
    children: ReactNode;
}

export default function Hero({children}: HeroProps) {
    return (
        <div className="w-full items-center justify-center flex">
            {children}
        </div>
    )
}