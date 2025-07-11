"use client";
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GithubAuthProvider
} from "firebase/auth";
import { auth } from "../../_lib/Firebase";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";

const provider = new GoogleAuthProvider();
const gitHubProvider = new GithubAuthProvider();

export default function LoginRegister() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm(); //不同的表格
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin, isSubmitting: isSubmittingLogin },
    reset: resetLogin,
    getValues: getValuesLogin,
  } = useForm(); //for the login form

  function signInWithGoogle() {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        console.log(credential);
        // const token = credential?.accessToken;
        // const user = result.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        // const email = error.customData.email;
        // const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorCode, errorMessage);
      });
  }

  function signInWithGithub() {
    signInWithPopup(auth, gitHubProvider)
    .then((result) => {
      const credential = GithubAuthProvider.credentialFromResult(result);
      console.log(credential);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.error(errorCode, errorMessage)
    });
  }

  function authCreateUserWithPassword(email: string, password: string) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in as", user);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async function onSubmit(data: FieldValues) {
    const { email, password } = data;
    try {
      authCreateUserWithPassword(email, password);
      reset();
    } catch (e) {
      console.error(e)
    }
  }

  function ErrorMessage(errorMessage: string) {
    return (
      <div role="alert" className="alert alert-error alert-soft">
        <span>{errorMessage}</span>
      </div>
    );
  }

  function loginWithEmailAndPassword(email: string, password: string) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in as", user);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async function onSubmitLogin(dataLogin: FieldValues) {
    const { loginEmail, loginPassword } = dataLogin;
    try {
      loginWithEmailAndPassword(loginEmail, loginPassword);
      resetLogin();
    } catch(e) {
      console.error(e);
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col md:flex-row md:space-x-35">
        <div id="register" className="md:h-32 w-full md:w-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="fieldset bg-base-300 border-neutral rounded-box w-[90%] md:w-xs border p-4">
              <legend className="fieldset-legend text-base-content">
                Register
              </legend>
              <label className="label text-base-content">Email</label>
              <input
                {...register("email", {
                  required: "Please enter a valid email",
                })}
                type="email"
                className="input bg-base-100 text-base-content w-full"
                placeholder="Email"
                id="email"
              />
              {errors.email && ErrorMessage(`${errors.email.message}`)}
              <label className="label text-base-content">Verify Email</label>
              <input
                {...register("verifyEmail", {
                  required: "Confirm your email address",
                  validate: (value) =>
                    value === getValues("email") || "Email address must match",
                })}
                type="email"
                className="input bg-base-100 text-base-content w-full"
                placeholder="Verify Email"
                id="verifyEmail"
              />
              {errors.verifyEmail &&
                ErrorMessage(`${errors.verifyEmail.message}`)}
              <label className="label text-base-content">Password</label>
              <input
                {...register("password", {
                  required: "Enter your password",
                  minLength: {
                    value: 8,
                    message: "Password must contain at least 8 characters",
                  },
                })}
                type="password"
                className="input bg-base-100 text-base-context w-full"
                placeholder="Password"
                id="password"
              />
              {errors.password && ErrorMessage(`${errors.password.message}`)}
              <label className="label text-base-content">Verify Password</label>
              <input
                {...register("verifyPassword", {
                  required: "Confirm your password",
                  validate: (value) =>
                    value === getValues("password") || "Password must match",
                })}
                type="password"
                className="input bg-base-100 text-base-content w-full"
                placeholder="Verify Password"
                id="verifyPassword"
              />
              {errors.verifyPassword &&
                ErrorMessage(`${errors.verifyPassword.message}`)}
              <button className="btn btn-neutral mt-4 text-neutral-content" disabled={isSubmitting}>
                Sign up
              </button>
            </fieldset>
          </form>
        </div>
        <div id="login" className="md:h-32 w-full md:w-auto">
          <fieldset className="fieldset bg-base-300 border-neutral rounded-box w-[90%] md:w-xs border p-4">
            <legend className="fieldset-legend text-base-content">Login</legend>

            <label className="label text-primary-content"></label>
            <button className="btn bg-black text-white border-black" onClick={signInWithGithub}>
              <svg
                aria-label="GitHub logo"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                ></path>
              </svg>
              Login with GitHub
            </button>

            {/* Google */}
            <button
              className="btn bg-white text-black border-[#e5e5e5]"
              onClick={signInWithGoogle}
            >
              <svg
                aria-label="Google logo"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <g>
                  <path d="m0 0H512V512H0" fill="#fff"></path>
                  <path
                    fill="#34a853"
                    d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                  ></path>
                  <path
                    fill="#4285f4"
                    d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                  ></path>
                  <path
                    fill="#fbbc02"
                    d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                  ></path>
                  <path
                    fill="#ea4335"
                    d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                  ></path>
                </g>
              </svg>
              Login with Google
            </button>
            <form onSubmit={handleSubmitLogin(onSubmitLogin)}>
              <div className="divider divider-secondary text-base-content">OR</div>
              <label className="label text-base-content">Email</label>
              <input
                type="email"
                className="input bg-base-100 text-base-content w-full"
                placeholder="Email"
                {...registerLogin("loginEmail", {
                  required: "Enter your email address",
                })}
                id="loginEmail"
              ></input>
              {errors.loginEmail &&
                ErrorMessage(`${errors.loginEmail.message}`)}
              <label className="label text-base-content">Password</label>
              <input
                type="password"
                className="input bg-base-100 text-base-content w-full"
                placeholder="Password"
                id="loginPassword"
                {...registerLogin("loginPassword", {
                  required: "Enter your password"
                })}
              ></input>
              {errors.loginPassword &&
               ErrorMessage(`${errors.loginPassword.message}`)}
              <button className="btn btn-neutral text-neutral-content mt-4 w-full">Login</button>
            </form>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
