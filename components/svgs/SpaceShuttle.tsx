import ShuttleExhaust from "./ShuttleExhaust";
import Shuttle from "./Shuttle";

export default function SpaceShuttle({thrust, flying}: {thrust:boolean, flying: boolean}) {
    return (
        <div className="items-center flex overflow-visible justify-center md:h-fit">
            <div className="rotate-270 ">
                {flying && <ShuttleExhaust thrust={thrust} />}
            </div>
            <div className="rotate-90">
                <Shuttle />
            </div>
            
            {/* <ShuttleExhaust/> */}
        </div>
    )
}