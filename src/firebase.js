import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBw8mF9oCXIpsxjcVmpMSx_6eEXnfwqVtI",
  authDomain: "crownasianew.firebaseapp.com",
  projectId: "crownasianew",
  storageBucket: "crownasianew.firebasestorage.app",
  messagingSenderId: "137632152784",
  appId: "1:137632152784:web:e59c4d15b1e02805bab2d5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);