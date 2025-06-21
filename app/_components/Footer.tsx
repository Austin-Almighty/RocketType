"use client";
import { FaGithub, FaPalette } from "react-icons/fa";
import ThemeSelector from "./ThemeSelector";
import { useEffect, useState } from "react";
import Link from "next/link";

type FooterProps = {
  className?: string;
};

// export default function App() {
//   const [theme, setTheme] = useState(
//     JSON.parse(localStorage.getItem('theme'))
//   );
//   useEffect(() => {
//     localStorage.setItem('isdark', JSON.stringify(isdark));
//   }, [isdark]);
//   return (
//     <>
//       <input
//         type="checkbox"
//         checked={isdark}
//         onChange={() => setIsdark(!isdark)}
//       />
//       The value of this checkbox gets saved on browser localStorage
//     </>
//   );
// }

export default function Footer({ className }: FooterProps) {
  const [theme, setTheme] = useState("light");

  // On mount, load theme from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) {
        setTheme(stored);
      }
    }
  }, []);

  // Sync theme to data-theme and localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return (
    <div className={className}>
      <footer className="footer sm:footer-horizontal bg-base-100 items-center p-4 text-base-content">
        <aside className="grid-flow-col items-center">
         
          <Link href="https://github.com/Austin-Almighty/RocketType" target="_blank" rel="noopener noreferrer">
            <button className="btn bg-transparent border-none p-0 m-0 shadow-none outline-none">
                <FaGithub className="w-9 h-9 fill-base-content" />
                GitHub
            </button>
          </Link>
        </aside>
        <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          {/* Open the modal using document.getElementById('ID').showModal() method */}
          <div
            className="w-fit h-fit tooltip-left tooltip"
            data-tip="Change themes here"
          >
            <button
              className="btn bg-transparent border-none p-0 m-0 shadow-none outline-none"
              onClick={() => {
                const modal = document.getElementById("themeModal");
                if (modal) (modal as HTMLDialogElement).showModal();
              }}
            >
              <FaPalette className="w-9 h-9 fill-base-content" />
              {theme}
            </button>
          </div>
          <dialog id="themeModal" className="modal">
            <div className="modal-box">
              <ThemeSelector setTheme={setTheme} />
              {/* <h3 className="font-bold text-lg">Hello!</h3> */}
              {/* <p className="py-4">Press ESC key or click outside to close</p> */}
            </div>

            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
          
        </nav>
      </footer>
    </div>
  );
}
