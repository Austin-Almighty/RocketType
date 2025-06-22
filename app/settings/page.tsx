"use client";
import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoStatsChart } from "react-icons/io5";
import { MdOutlineDeleteForever } from "react-icons/md";
import { updateProfile, updatePassword, deleteUser } from "firebase/auth";
import { auth } from "../_lib/Firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Earth from "@/components/svgs/earth";
import { deleteData } from "../_lib/getResults";

export default function Settings() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [showSuccessUsername, setShowSuccessUsername] = useState(false);
  const [showErrorUsername, setShowErrorUsername] = useState(false);
  const [showSuccessPassword, setShowSuccessPassword] = useState(false);
  const [showErrorPassword, setShowErrorPassword] = useState(false);
  const [userNameInput, setUserNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [showSuccessDelete, setShowSuccessDelete] = useState(false);
  const [showErrorDelete, setShowErrorDelete] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState("");
  const [userNameErrorMsg, setUserNameErrorMsg] = useState("");
  const [showSuccessReset, setShowSuccessReset] = useState(false);
  const [showErrorReset, setShowErrorReset] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState("");
  async function handleResetData() {
    try {
      await deleteData();
      setShowSuccessReset(true);
      setTimeout(() => setShowSuccessReset(false), 2000);
    } catch (error: any) {
      setShowErrorReset(true);
      setResetErrorMsg(error?.message || "Data reset failed!");
      setTimeout(() => setShowErrorReset(false), 2000);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/user");
      } else {
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="animate-fade-in min-h-screen flex justify-center items-center bg-base-100 flex-col">
        <Earth />
        <span className="text-lg text-base-content">
          Checking for credentials...
        </span>
      </div>
    );
  }

  function updateUserName(newUserName: string) {
    const user = auth.currentUser;
    if (!user) {
      setShowErrorUsername(true);
      renderError("User Not Signed In")
      return;
    }
    updateProfile(user, {
      displayName: newUserName,
    })
      .then(() => {
        setShowSuccessUsername(true);
        setTimeout(() => setShowSuccessUsername(false), 2000);
      })
      .catch((error) => {
        setShowErrorUsername(true);
        setUserNameErrorMsg(error.message || "User name update failed!");
        setTimeout(() => setShowErrorUsername(false), 2000);
      });
  }

  function changePassword(newPassword: string) {
    const user = auth.currentUser;
    if (!user) {
        console.error("Password not updated!")
        return;
    }
    updatePassword(user, newPassword).then(()=>{
        setShowSuccessPassword(true);
        setTimeout(()=> setShowSuccessPassword(false), 2000)
    })
    .catch((error)=> {
        setShowErrorPassword(true);
        setPasswordErrorMsg(error.message || "Password update failed!");
        setTimeout(()=> setShowErrorPassword(false), 2000);
        console.log(error);
    })
  }

  function deleteProfile() {
    const user = auth.currentUser;
    if (!user) {
      setShowErrorDelete(true);
      setDeleteErrorMsg("User not found!");
      setTimeout(() => setShowErrorDelete(false), 2000);
      return;
    }
    deleteUser(user)
      .then(() => {
        setShowSuccessDelete(true);
        setTimeout(() => setShowSuccessDelete(false), 2000);
        router.push("/user");
      })
      .catch((error) => {
        setShowErrorDelete(true);
        setDeleteErrorMsg(error.message || "Account deletion failed!");
        setTimeout(() => setShowErrorDelete(false), 2000);
        console.log(error);
      });
  }

  function renderInfo(message:string) {
    return (
        <div role="alert" className="alert alert-success absolute right-6 top-6 z-50">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{message}</span>
        </div>
    )
  }

  function renderError(message:string) {
    return (
        <div role="alert" className="alert alert-error absolute right-6 top-6 z-50">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{message}</span>
        </div>
    )
  }

  return (
    <div>
      {showSuccessUsername && (
        renderInfo("User name updated!")
      )}
      {showErrorUsername && renderError(userNameErrorMsg)}

      {showSuccessPassword && (
        renderInfo("Password updated!")
      )}
      {showErrorPassword && renderError(passwordErrorMsg)}

      {showSuccessDelete && renderInfo("Account deleted!")}
      {showErrorDelete && renderError(deleteErrorMsg)}
      {showSuccessReset && renderInfo("Account data reset!")}
      {showErrorReset && renderError(resetErrorMsg)}
      <div className="w-full mx-auto flex flex-col px-6 items-center mt-6 gap-10">
        <section className="flex flex-col lg:flex-row sm:w-[50%] w-[80%] mx-auto bg-base-200 text-center p-6 rounded-2xl gap-3 items-center">
          <div className="lg:flex-1 flex flex-col items-center lg:block">
            <span className="lg:text-2xl font-bold flex text-start items-center gap-1 text-base-content">
              <FaUser className="w-5 h-5 fill-base-content" />
              Update Display Name
            </span>
            <p className="text-base-content text-start">
              Change your display name
            </p>
          </div>
          <button
            className="btn btn-xs sm:btn-sm md:btn-md bg-primary text-primary-content hover:bg-secondary hover:text-secondary-content rounded-2xl"
            onClick={() => {
              const dialog = document.getElementById(
                "username"
              ) as HTMLDialogElement | null;
              if (dialog) dialog.showModal();
            }}
          >
            Update name
          </button>
        </section>
        <section className="flex flex-col lg:flex-row sm:w-[50%] w-[80%] mx-auto bg-base-200 text-center p-6 rounded-2xl gap-3 items-center">
          <div className="lg:flex-1 flex flex-col items-center lg:block">
            <span className="lg:text-2xl font-bold flex text-start items-center gap-1 text-base-content">
              <RiLockPasswordFill className="w-5 h-5 fill-base-content" />
              Change Password
            </span>
            <p className="text-base-content text-start">Change your password</p>
            <p className="text-warning text-start">
              Keep your new password safe
            </p>
          </div>
          <button className="btn btn-xs sm:btn-sm md:btn-md bg-primary text-primary-content hover:bg-secondary hover:text-secondary-content rounded-2xl"
          onClick={() => {
              const dialog = document.getElementById(
                "password"
              ) as HTMLDialogElement | null;
              if (dialog) dialog.showModal();
            }}
          >
            Change password
          </button>
        </section>
        <section className="flex flex-col lg:flex-row sm:w-[50%] w-[80%] mx-auto bg-base-200 text-center p-6 rounded-2xl gap-3 items-center">
          <div className="lg:flex-1 flex flex-col items-center lg:block">
            <span className="lg:text-2xl font-bold flex text-start items-center gap-1 text-base-content">
              <IoStatsChart className="w-5 h-5 fill-base-content" />
              Reset Data
            </span>
            <p className="text-base-content text-center lg:text-left">
              Delete all existing data, including all records and leaderboard
              placement
            </p>
            <p className="text-warning text-center lg:text-left">
              Warning: You cannot undo this action!
            </p>
          </div>
          <button className="btn btn-xs sm:btn-sm md:btn-md bg-warning text-warning-content hover:bg-info hover:text-info-content rounded-2xl"
          onClick={() => {
              const dialog = document.getElementById(
                "reset"
              ) as HTMLDialogElement | null;
              if (dialog) dialog.showModal();
            }}>
            Reset Account
          </button>
        </section>
        <section className="flex flex-col lg:flex-row sm:w-[50%] w-[80%] mx-auto bg-base-200 text-center p-6 rounded-2xl gap-3 items-center">
          <div className="lg:flex-1 flex flex-col items-center lg:block">
            <span className="lg:text-2xl font-bold flex text-start items-center gap-1 text-base-content">
              <MdOutlineDeleteForever className="w-5 h-5 fill-base-content" />
              Delete Account
            </span>
            <p className="text-base-content text-center lg:text-left">
              Delete your account permanently
            </p>
            <p className="text-warning text-center lg:text-left">
              Warning: You will lose all data! You cannot undo this action!
            </p>
          </div>
          <button className="btn btn-xs sm:btn-sm md:btn-md bg-warning text-warning-content hover:bg-info hover:text-info-content rounded-2xl"
          onClick={() => {
              const dialog = document.getElementById(
                "delete"
              ) as HTMLDialogElement | null;
              if (dialog) dialog.showModal();
            }}
          >
            Delete account
          </button>
        </section>

        <dialog id="username" className="modal">
          <div className="modal-box modal-bottom sm:modal-middle bg-base-200 flex flex-col gap-2 items-center rounded-2xl">
            <h3 className="font-bold md:text-3xl text-base-content flex gap-2">
              <FaUser />
              Update username
            </h3>
            <form
              className="w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                await updateUserName(userNameInput);
                setUserNameInput(""); // Reset input
                const dialog = document.getElementById(
                  "username"
                ) as HTMLDialogElement | null;
                if (dialog) dialog.close(); // Close modal
              }}
            >
              <input
                type="text"
                placeholder="new name"
                className="text-base-100 bg-base-content rounded-2xl min-h-8 w-full p-2"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
              />
              <button
                type="submit"
                className="w-full mt-4 bg-neutral text-neutral-content rounded-2xl md:text-xl p-1"
              >
                Update
              </button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        <dialog id="password" className="modal">
          <div className="modal-box modal-bottom sm:modal-middle bg-base-200 flex flex-col gap-2 items-center rounded-2xl">
            <h3 className="font-bold md:text-3xl text-base-content flex gap-2">
              <FaUser />
              Change password
            </h3>
            <form
              className="w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                await changePassword(passwordInput);
                setPasswordInput(""); // Reset input
                const dialog = document.getElementById(
                  "password"
                ) as HTMLDialogElement | null;
                if (dialog) dialog.close(); // Close modal
              }}
            >
              <input
                type="password"
                placeholder="new password"
                className="text-base-100 bg-base-content rounded-2xl min-h-8 w-full p-2"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button
                type="submit"
                className="w-full mt-4 bg-neutral text-neutral-content rounded-2xl md:text-xl p-1"
              >
                Update
              </button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        <dialog id="delete" className="modal">
          <div className="modal-box modal-bottom sm:modal-middle bg-base-200 flex flex-col gap-2 items-center rounded-2xl">
            <h3 className="font-bold md:text-3xl text-base-content flex gap-2">
              <FaUser />
              Delete Account
            </h3>
            <h3>Are you sure you want to delete your account?</h3>
            <form
              className="w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                const dialog = document.getElementById(
                  "delete"
                ) as HTMLDialogElement | null;
                if (dialog) dialog.close(); // Close modal
              }}
            >
              <div className="flex gap-2">
              <button
                type="submit"
                className="w-full mt-4 bg-neutral text-neutral-content rounded-2xl md:text-xl p-1 hover:bg-warning hover:text-warning-content"
                onSubmit={async (e) => {
                e.preventDefault();
                const dialog = document.getElementById(
                  "delete"
                ) as HTMLDialogElement | null;
                if (dialog) dialog.close(); // Close modal
              }}
              >
                No
              </button>
              <button
                type="submit"
                className="w-full mt-4 bg-neutral text-neutral-content rounded-2xl md:text-xl p-1 hover:bg-warning hover:text-warning-content"
                onClick={deleteProfile}
              >
                Delete
              </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        <dialog id="reset" className="modal">
          <div className="modal-box modal-bottom sm:modal-middle bg-base-200 flex flex-col gap-2 items-center rounded-2xl">
            <h3 className="font-bold md:text-3xl text-base-content flex gap-2">
              <FaUser />
              Reset Progress
            </h3>
            <h3>Are you sure you want to reset your data?</h3>
            <form
              className="w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                const dialog = document.getElementById(
                  "reset"
                ) as HTMLDialogElement | null;
                if (dialog) dialog.close(); // Close modal
              }}
            >
              <div className="flex gap-2">
              <button
                type="submit"
                className="w-full mt-4 bg-neutral text-neutral-content rounded-2xl md:text-xl p-1 hover:bg-warning hover:text-warning-content"
                onSubmit={async (e) => {
                e.preventDefault();
                const dialog = document.getElementById(
                  "reset"
                ) as HTMLDialogElement | null;
                if (dialog) dialog.close(); // Close modal
              }}
              >
                No
              </button>
              <button
                type="submit"
                className="w-full mt-4 bg-neutral text-neutral-content rounded-2xl md:text-xl p-1 hover:bg-warning hover:text-warning-content"
                onClick={handleResetData}
              >
                Delete
              </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}
