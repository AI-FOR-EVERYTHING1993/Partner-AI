import {initializeApp, getApp, getApps} from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyALQor8YRj6WPYBMaxDTcdZvTdYZZ20w3w",
  authDomain: "partner-ai-b850f.firebaseapp.com",
  projectId: "partner-ai-b850f",
  storageBucket: "partner-ai-b850f.firebasestorage.app",
  messagingSenderId: "326793697658",
  appId: "1:326793697658:web:b828e9f40e635355809ec3"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();


export const auth = getAuth(app);
export const db = getFirestore(app);

