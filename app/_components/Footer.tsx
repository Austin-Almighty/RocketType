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
      <footer className="flex flex-col md:flex-row justify-between items-center p-4 bg-base-100 text-base-content">
        <aside className="mb-2 md:mb-0 flex items-center">
          <Link href="https://github.com/Austin-Almighty/RocketType" target="_blank" rel="noopener noreferrer">
            <button className="btn bg-transparent border-none p-0 m-0 shadow-none outline-none flex items-center gap-2">
              <FaGithub className="w-6 h-6 md:w-8 md:h-8 fill-base-content" />
              <span className="sm:inline">GitHub</span>
            </button>
          </Link>
        </aside>
        <nav className="flex items-center gap-4">
          <div className="w-fit h-fit tooltip-left tooltip" data-tip="Change themes here">
            <button
              className="btn bg-transparent border-none p-0 m-0 shadow-none outline-none flex items-center gap-2"
              onClick={() => {
                const modal = document.getElementById("themeModal");
                if (modal) (modal as HTMLDialogElement).showModal();
              }}
            >
              <FaPalette className="w-6 h-6 md:w-8 md:h-8 fill-base-content" />
              <span className="sm:inline">{theme}</span>
            </button>
          </div>
          <dialog id="themeModal" className="modal">
            <div className="modal-box">
              <ThemeSelector setTheme={setTheme} />
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
