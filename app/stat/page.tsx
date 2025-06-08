
import Header from "../_components/Header";
import Profile from "./_components/Profile";
import Summary from "./_components/Summary";
import Table from "./_components/Table";

export default function User() {
  return (
    <>
      <div className="bg-amber-100 flex flex-col items-center w-screen gap-y-6">
        <Header />
        <Profile />
        <Summary />
        <Table />
        <button className="btn">
          <span className="loading loading-spinner"></span>
          loading
        </button>
      </div>
    </>
  );
}
