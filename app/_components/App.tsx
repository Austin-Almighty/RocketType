import { Clock } from "./Clock"
import Typing from "./TypingArea"

export default function App() {
    return (
        <div className="w-3/4 mx-auto absolute top-[30vh]">
                <Clock start={100}/>
                <Typing />
        </div>
    )
}