import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqr1ug1jY4pwb...",
  authDomain: "speakingcommunityuzb.firebaseapp.com",
  projectId: "speakingcommunityuzb",
  storageBucket: "speakingcommunityuzb.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX",
  measurementId: "G-XXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
