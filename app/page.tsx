import Image from "next/image";
import Header from "./_components/Header"
import Typing from "./_components/TypingArea";
import Keyboard from "./_components/Keyboard";
import { Clock } from "./_components/Clock";
import FPSDisplay from "./_components/Fps";

export default function Home() {
  return (
    <div className="bg-amber-100 min-h-screen flex flex-col items-center w-screen">
      <Header />
      <div className="w-3/4 mx-auto absolute top-[30vh]">
        <Clock start={100}/>
        <Typing />
      </div>
      <Keyboard />
      <FPSDisplay />
    </div>
  );
}
