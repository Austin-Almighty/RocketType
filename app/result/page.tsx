import Header from "../_components/Header"
import Result from "../_components/Result"
import { GameProvider } from "../_lib/gameContext"

export default function ResultPage() {
    return(
    <div className="bg-amber-100 h-screen flex flex-col items-center w-screen">
        <Header />

        <Result />

    </div>
    )
}