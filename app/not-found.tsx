import Earth from "@/components/svgs/earth";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center ">
      <div className="flex items-center justify-center flex-col gap-6">
        <Earth />
        <h1 className="text-3xl font-bold mb-4 text-base-content">404 - Page Not Found</h1>
        <p className="text-base-content">Sorry, we couldn't find the page you requested.</p>
        <p className="text-base-content">Heading back to Earth!</p>
        <Link href="/app">
            <button className="rounded-2xl bg-base-300 text-base-content p-4 hover:bg-warning hover:text-warning-content">Homepage</button>
        </Link>
      </div>
    </div>
  );
}