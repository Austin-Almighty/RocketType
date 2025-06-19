import { FaInfoCircle } from "react-icons/fa";
import { unstable_ViewTransition as ViewTransition } from "react";
import { FaRocket, FaLanguage } from "react-icons/fa6";
import { SiStardock } from "react-icons/si";
import { BsMoonStarsFill } from "react-icons/bs";
import { IoStatsChart } from "react-icons/io5";
import { FaClock, FaKeyboard } from "react-icons/fa";
import { ImTarget } from "react-icons/im";
import { RiSortAlphabetAsc } from "react-icons/ri";
import { TbBrandSpeedtest } from "react-icons/tb";
import Earth from "@/components/svgs/earth";
import Hero from "./_components/Hero";
import SpaceShuttle from "@/components/svgs/SpaceShuttle";






export default function About() {
  return (
    <div className="w-[90%] bg-base-100 mx-auto mt-6">
        {/* <ViewTransition name="shuttle"> */}
            <Hero>
                <SpaceShuttle flying={true} thrust={true}/>
            </Hero>
        {/* </ViewTransition> */}
      <div>
        <article aria-label="About">
          <span className="flex my-4">
            <FaInfoCircle className="w-10 h-10 mr-4" />
            <h2 className="text-center align-middle text-3xl">About RocketType</h2>
          </span>
          <p className="text-base-content bg-base-300 rounded-2xl p-4">
            RocketType is a typing test that can be run in the browser.
            Currently, it features three test modes: time attack, word scramble,
            and zen mode. To start the test, choose your desired settings and start typing!
          </p>
        </article>

        <section aria-label="Word sets">
            <span className="flex my-4">
            <FaLanguage className="w-10 h-10 mr-4"/>
            <h2 className="text-center align-middle text-3xl">Word Sets</h2>
          </span>
          <p className="text-base-content bg-base-300 rounded-2xl p-4">
            Currently, there are 3 word sets: English Most Common 1k, 5k and 10k. Support for other languages and word sets will be added in the future.
          </p>
        </section>
        <section aria-label="Test Modes">
          <span className="flex my-4">
            <TbBrandSpeedtest className="w-10 h-10 mr-4" />
            <h2 className="text-center align-middle text-3xl">Test Modes</h2>
          </span>
          <div
            tabIndex={0}
            className="bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content collapse mb-6"
          >
            <div className="collapse-title font-semibold flex">
                <FaRocket className="w-6 h-6 mr-4"/>
                Rocket Run (Time-Based Mode)
            </div>
            <div className="collapse-content text-sm">
              In Rocket Run, race against the clock and type as fast as you can before time runs out. Select your time limit and fire away!
            </div>
          </div>
          <div
            tabIndex={0}
            className="bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content collapse mb-6"
          >
            <div className="collapse-title font-semibold flex">
                <SiStardock className="w-6 h-6 mr-4"/>
                Star Count (Word Count Mode)
            </div>
            <div className="collapse-content text-sm">
                In Star Count, you are tasked to type a set number of words. The test won't stop until you hit the target word count!           
            </div>
          </div>
          <div
            tabIndex={0}
            className="bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content collapse mb-6"
          >
            <div className="collapse-title font-semibold flex">
                <BsMoonStarsFill className="w-6 h-6 mr-4"/>
                Zen Mode
            </div>
            <div className="collapse-content text-sm">
                Not in a competitive mood? Type away in the Zen Mode and enjoy the serenity of the night sky!
            </div>
          </div>
        </section>

        <section aria-label="stat">
          <span className="flex my-4">
            <IoStatsChart className="w-10 h-10 mr-4" />
            <h2 className="text-center align-middle text-3xl">Stats</h2>
          </span>
          <div
            tabIndex={0}
            className="bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content collapse mb-6"
          >
            <div className="collapse-title font-semibold flex">
                <FaClock className="w-6 h-6 mr-4"/>
                Words Per Minute (WPM)
            </div>
            <div className="collapse-content text-sm">
                WPM stands for Words Per Minute. It measures how many standard words (each word counted as five characters) you type in one minute, counting only correctly typed words. Mistyped words or corrections are not included in your WPM score, so it’s a good indicator of your real-world typing speed.
            </div>
          </div>
          <div
            tabIndex={0}
            className="bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content collapse mb-6"
          >
            <div className="collapse-title font-semibold flex">
                <FaKeyboard className="w-6 h-6 mr-4"/>
                Raw WPM
            </div>
            <div className="collapse-content text-sm">
                Raw WPM measures your typing speed without considering accuracy. It counts all the keystrokes you type—correct or not—and calculates how many words per minute you would have typed if every keystroke was correct.
            </div>
          </div>
          <div
            tabIndex={0}
            className="bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content collapse mb-6"
          >
            <div className="collapse-title font-semibold flex">
                <ImTarget className="w-6 h-6 mr-4"/>
                Accuracy
            </div>
            <div className="collapse-content text-sm">
                Accuracy = (Number of Correct Keystrokes ÷ Total Keystrokes) × 100%
            </div>
          </div>
          <div
            tabIndex={0}
            className="bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content collapse mb-6"
          >
            <div className="collapse-title font-semibold flex">
                <RiSortAlphabetAsc className="w-6 h-6 mr-4"/>
                Characters
            </div>
            <div className="collapse-content text-sm">
                The ratio between the correctly typed and incorrectly typed characters.
            </div>
          </div>
         </section>
         <section aria-label="Acknowledgement">
            <span className="flex my-4">
            <FaLanguage className="w-10 h-10 mr-4"/>
            <h2 className="text-center align-middle text-3xl">Acknowledgement</h2>
          </span>
          <p className="text-base-content bg-base-300 rounded-2xl p-4">
            Inspired by the minimalistic aesthetic and incredible responsiveness of MonkeyType, this project is built by Austin Liao.
          </p>
        </section>
      </div>
    </div>
  );
}
