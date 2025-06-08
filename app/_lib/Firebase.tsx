import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEA3-cLbNReVaDWANo3-HaB2-EXI8tL-M",
  authDomain: "typing-app-566de.firebaseapp.com",
  projectId: "typing-app-566de",
  storageBucket: "typing-app-566de.firebasestorage.app",
  messagingSenderId: "650860083709",
  appId: "1:650860083709:web:d6d0f0a0138dc7548f0194"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)

